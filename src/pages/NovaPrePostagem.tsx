import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Package, DollarSign, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { remetentes, frete, emissoes, type RemetenteItem, type CotacaoItem } from "@/lib/api";
import { CotacaoResultCard } from "@/components/CotacaoResultCard";

export default function NovaPrePostagem() {
  const navigate = useNavigate();
  
  // Estado remetentes
  const [remetentesList, setRemetentesList] = useState<RemetenteItem[]>([]);
  const [remetenteSelecionado, setRemetenteSelecionado] = useState<RemetenteItem | null>(null);
  const [showRemetentesModal, setShowRemetentesModal] = useState(false);
  const [loadingRemetentes, setLoadingRemetentes] = useState(false);

  // Estado formulário
  const [formato, setFormato] = useState("caixa");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [valorDeclarado, setValorDeclarado] = useState("0");

  // Estado destinatário
  const [nomeDestinatario, setNomeDestinatario] = useState("");
  const [cpfDestinatario, setCpfDestinatario] = useState("");
  const [telefoneDestinatario, setTelefoneDestinatario] = useState("");
  const [cepDestinatario, setCepDestinatario] = useState("");
  const [logradouroDestinatario, setLogradouroDestinatario] = useState("");
  const [numeroDestinatario, setNumeroDestinatario] = useState("");
  const [complementoDestinatario, setComplementoDestinatario] = useState("");
  const [bairroDestinatario, setBairroDestinatario] = useState("");
  const [cidadeDestinatario, setCidadeDestinatario] = useState("");
  const [ufDestinatario, setUfDestinatario] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  // Estado cotação
  const [cotacoes, setCotacoes] = useState<CotacaoItem[]>([]);
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<CotacaoItem | null>(null);
  const [loadingCotacao, setLoadingCotacao] = useState(false);
  const [showCotacoes, setShowCotacoes] = useState(false);

  // Estado criação
  const [criandoEtiqueta, setCriandoEtiqueta] = useState(false);
  const [cadastrarDestinatario, setCadastrarDestinatario] = useState(false);

  useEffect(() => {
    carregarRemetentes();
  }, []);

  const carregarRemetentes = async () => {
    try {
      setLoadingRemetentes(true);
      const response = await remetentes.listar();
      setRemetentesList(response.data);
      if (response.data.length > 0 && !remetenteSelecionado) {
        setRemetenteSelecionado(response.data[0]);
      }
    } catch (error) {
      toast.error("Erro ao carregar remetentes");
      console.error(error);
    } finally {
      setLoadingRemetentes(false);
    }
  };

  const buscarCep = async (cep: string) => {
    if (cep.replace(/\D/g, "").length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setLogradouroDestinatario(data.logradouro);
      setBairroDestinatario(data.bairro);
      setCidadeDestinatario(data.localidade);
      setUfDestinatario(data.uf);
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCotacao = async () => {
    if (!remetenteSelecionado) {
      toast.error("Selecione um remetente");
      return;
    }

    if (!peso || !altura || !largura || !comprimento) {
      toast.error("Preencha as dimensões do pacote");
      return;
    }

    if (!cepDestinatario) {
      toast.error("Preencha o CEP de destino");
      return;
    }

    try {
      setLoadingCotacao(true);
      const response = await frete.cotacao({
        cepOrigem: remetenteSelecionado.endereco.cep.replace(/\D/g, ""),
        cepDestino: cepDestinatario.replace(/\D/g, ""),
        embalagem: {
          altura,
          largura,
          comprimento,
          peso,
          diametro: "0",
        },
        logisticaReversa: "N",
        valorDeclarado: parseFloat(valorDeclarado) || 0,
        cpfCnpjLoja: remetenteSelecionado.cpfCnpj,
      });

      setCotacoes(response.data);
      setShowCotacoes(true);
      toast.success("Cotação realizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cotação");
    } finally {
      setLoadingCotacao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cotacaoSelecionada) {
      toast.error("Selecione uma opção de frete");
      return;
    }

    if (!remetenteSelecionado) {
      toast.error("Selecione um remetente");
      return;
    }

    if (!nomeDestinatario || !cpfDestinatario || !telefoneDestinatario) {
      toast.error("Preencha todos os dados do destinatário");
      return;
    }

    try {
      setCriandoEtiqueta(true);
      
      const response = await emissoes.criar({
        remetenteId: remetenteSelecionado.id,
        cienteObjetoNaoProibido: true,
        cadastrarDestinatario,
        logisticaReversa: "N",
        cotacao: {
          idLote: cotacaoSelecionada.idLote,
          codigoServico: cotacaoSelecionada.codigoServico,
          nomeServico: cotacaoSelecionada.nomeServico,
          preco: cotacaoSelecionada.preco,
          prazo: cotacaoSelecionada.prazo,
          transportadora: cotacaoSelecionada.transportadora,
        },
        embalagem: {
          altura: parseFloat(altura),
          largura: parseFloat(largura),
          comprimento: parseFloat(comprimento),
          peso: parseFloat(peso),
          diametro: 0,
        },
        destinatario: {
          nome: nomeDestinatario,
          cpfCnpj: cpfDestinatario,
          telefone: telefoneDestinatario,
          endereco: {
            cep: cepDestinatario.replace(/\D/g, ""),
            logradouro: logradouroDestinatario,
            numero: numeroDestinatario,
            complemento: complementoDestinatario,
            bairro: bairroDestinatario,
            localidade: cidadeDestinatario,
            uf: ufDestinatario,
          },
        },
        valorDeclarado: parseFloat(valorDeclarado) || 0,
      });

      toast.success(`Etiqueta criada com sucesso! ID: ${response.id}`);
      
      // Abrir etiqueta em nova aba
      if (response.link_etiqueta) {
        window.open(response.link_etiqueta, "_blank");
      }
      
      navigate("/envios/pre-postagem");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar etiqueta");
    } finally {
      setCriandoEtiqueta(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Nova etiqueta</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados para criar uma nova etiqueta de envio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origem */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <MapPin className="h-5 w-5" />
              Informe a origem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remetenteSelecionado ? (
              <div className="rounded-lg bg-accent/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{remetenteSelecionado.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {remetenteSelecionado.endereco.logradouro}, {remetenteSelecionado.endereco.numero}
                      {remetenteSelecionado.endereco.complemento && `, ${remetenteSelecionado.endereco.complemento}`}, {remetenteSelecionado.endereco.bairro}, {remetenteSelecionado.endereco.localidade}/{remetenteSelecionado.endereco.uf}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemetentesModal(true)}
                  >
                    Alterar
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setShowRemetentesModal(true)}>
                <Search className="mr-2 h-4 w-4" />
                Selecionar Remetente
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pacote */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <Package className="h-5 w-5" />
              Informações do pacote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formato">Formato</Label>
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger id="formato">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caixa">Caixa / Pacote</SelectItem>
                  <SelectItem value="envelope">Envelope</SelectItem>
                  <SelectItem value="rolo">Rolo / Cilindro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (g)</Label>
                <Input
                  id="peso"
                  type="number"
                  placeholder="100"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  placeholder="10"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input
                  id="largura"
                  type="number"
                  placeholder="15"
                  value={largura}
                  onChange={(e) => setLargura(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento">Comprimento (cm)</Label>
                <Input
                  id="comprimento"
                  type="number"
                  placeholder="20"
                  value={comprimento}
                  onChange={(e) => setComprimento(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destinatário */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <MapPin className="h-5 w-5" />
              Informe o destino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                className="h-11"
                value={nomeDestinatario}
                onChange={(e) => setNomeDestinatario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF/CNPJ</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                className="h-11"
                value={cpfDestinatario}
                onChange={(e) => setCpfDestinatario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                className="h-11"
                value={telefoneDestinatario}
                onChange={(e) => setTelefoneDestinatario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  className="h-11"
                  value={cepDestinatario}
                  onChange={(e) => {
                    setCepDestinatario(e.target.value);
                    if (e.target.value.replace(/\D/g, "").length === 8) {
                      buscarCep(e.target.value);
                    }
                  }}
                  required
                />
                {loadingCep && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rua">Rua</Label>
              <Input
                id="rua"
                placeholder="Nome da rua"
                className="h-11"
                value={logradouroDestinatario}
                onChange={(e) => setLogradouroDestinatario(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  placeholder="123"
                  className="h-11"
                  value={numeroDestinatario}
                  onChange={(e) => setNumeroDestinatario(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  placeholder="Apto, bloco, etc"
                  className="h-11"
                  value={complementoDestinatario}
                  onChange={(e) => setComplementoDestinatario(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Nome do bairro"
                className="h-11"
                value={bairroDestinatario}
                onChange={(e) => setBairroDestinatario(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  className="h-11"
                  value={cidadeDestinatario}
                  onChange={(e) => setCidadeDestinatario(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  placeholder="SP"
                  maxLength={2}
                  className="h-11"
                  value={ufDestinatario}
                  onChange={(e) => setUfDestinatario(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="cadastrar"
                checked={cadastrarDestinatario}
                onCheckedChange={(checked) => setCadastrarDestinatario(checked as boolean)}
              />
              <Label htmlFor="cadastrar" className="cursor-pointer text-sm font-normal">
                Salvar destinatário para uso futuro
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Valor */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <DollarSign className="h-5 w-5" />
              Valor declarado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do conteúdo</Label>
              <Input
                id="valor"
                type="number"
                placeholder="0,00"
                className="h-11"
                value={valorDeclarado}
                onChange={(e) => setValorDeclarado(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Valor declarado para fins de seguro</p>
            </div>
          </CardContent>
        </Card>

        {/* Cotações */}
        {showCotacoes && cotacoes.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold uppercase text-primary">
                Selecione o frete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cotacoes.map((cotacao, index) => (
                <div
                  key={index}
                  onClick={() => setCotacaoSelecionada(cotacao)}
                  className="cursor-pointer"
                >
                  <CotacaoResultCard
                    cotacao={cotacao}
                    isSelected={cotacaoSelecionada?.idLote === cotacao.idLote && 
                                 cotacaoSelecionada?.codigoServico === cotacao.codigoServico}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            onClick={() => navigate("/envios/pre-postagem")}
          >
            Cancelar
          </Button>
          
          {!showCotacoes && (
            <Button
              type="button"
              className="h-11 rounded-full font-medium shadow-lg"
              onClick={handleCotacao}
              disabled={loadingCotacao}
            >
              {loadingCotacao && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cotar Frete
            </Button>
          )}

          {showCotacoes && (
            <Button
              type="submit"
              className="h-11 rounded-full font-medium shadow-lg"
              disabled={criandoEtiqueta || !cotacaoSelecionada}
            >
              {criandoEtiqueta && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar etiqueta
            </Button>
          )}
        </div>
      </form>

      {/* Modal Remetentes */}
      <Dialog open={showRemetentesModal} onOpenChange={setShowRemetentesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Remetente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {loadingRemetentes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              remetentesList.map((remetente) => (
                <Card
                  key={remetente.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => {
                    setRemetenteSelecionado(remetente);
                    setShowRemetentesModal(false);
                  }}
                >
                  <CardContent className="p-4">
                    <p className="font-medium">{remetente.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {remetente.endereco.logradouro}, {remetente.endereco.numero}
                      {remetente.endereco.complemento && `, ${remetente.endereco.complemento}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {remetente.endereco.bairro}, {remetente.endereco.localidade}/{remetente.endereco.uf}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}