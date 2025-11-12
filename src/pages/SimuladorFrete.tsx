import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, User, MapPin, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { frete, CotacaoItem, clientes, remetentes, EnderecoCliente, RemetenteItem } from "@/lib/api";
import { toast } from "sonner";
import { CotacaoResultCard } from "@/components/CotacaoResultCard";

interface OrigemItem {
  id: string;
  nome: string;
  endereco: string;
  cep: string;
  isPrincipal?: boolean;
}

interface EnderecoDestino {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export default function SimuladorFrete() {
  const [cep, setCep] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [peso, setPeso] = useState("");
  const [valorDeclarado, setValorDeclarado] = useState("");
  const [origens, setOrigens] = useState<OrigemItem[]>([]);
  const [origemSelecionada, setOrigemSelecionada] = useState<OrigemItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [buscaOrigem, setBuscaOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrigens, setLoadingOrigens] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cotacoes, setCotacoes] = useState<CotacaoItem[]>([]);
  const [enderecoDestino, setEnderecoDestino] = useState<EnderecoDestino | null>(null);

  // Carregar origens ao montar o componente
  useEffect(() => {
    const carregarOrigens = async () => {
      try {
        setLoadingOrigens(true);
        
        // Buscar endereço principal e remetentes em paralelo
        const [enderecoPrincipal, remetentesData] = await Promise.all([
          clientes.getEnderecoPrincipal().catch((error) => {
            console.error("Erro ao buscar endereço principal:", error);
            return null;
          }),
          remetentes.listar().catch((error) => {
            console.error("Erro ao buscar remetentes:", error);
            return { data: [] };
          })
        ]);

        const origensCarregadas: OrigemItem[] = [];

        // Adicionar endereço principal como primeira opção
        if (enderecoPrincipal) {
          // A API pode retornar o endereço diretamente ou dentro de um objeto data
          const endereco = enderecoPrincipal.data || enderecoPrincipal;
          
          const enderecoFormatado = [
            endereco.logradouro,
            endereco.numero,
            endereco.complemento,
            endereco.bairro,
            `${endereco.localidade}/${endereco.uf}`
          ].filter(Boolean).join(', ');

          origensCarregadas.push({
            id: "principal",
            nome: "Endereço Principal",
            endereco: enderecoFormatado,
            cep: endereco.cep || "",
            isPrincipal: true,
          });
        }

        // Adicionar remetentes
        if (remetentesData.data && remetentesData.data.length > 0) {
          remetentesData.data.forEach((remetente: RemetenteItem) => {
            const enderecoFormatado = [
              remetente.endereco.logradouro,
              remetente.endereco.numero,
              remetente.endereco.complemento,
              remetente.endereco.bairro,
              `${remetente.endereco.localidade}/${remetente.endereco.uf}`
            ].filter(Boolean).join(', ');

            origensCarregadas.push({
              id: remetente.id,
              nome: remetente.nome,
              endereco: enderecoFormatado,
              cep: remetente.endereco.cep || "",
              isPrincipal: false,
            });
          });
        }

        setOrigens(origensCarregadas);
        
        // Selecionar a primeira origem automaticamente
        if (origensCarregadas.length > 0) {
          setOrigemSelecionada(origensCarregadas[0]);
        } else {
          toast.error("Nenhuma origem disponível. Configure um remetente primeiro.");
        }
      } catch (error) {
        console.error("Erro ao carregar origens:", error);
        toast.error("Erro ao carregar origens disponíveis");
      } finally {
        setLoadingOrigens(false);
      }
    };

    carregarOrigens();
  }, []);

  // Função para formatar CEP
  const formatarCep = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 5) {
      return apenasNumeros;
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
  };

  // Função para buscar CEP
  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    // Validar se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return;
    }

    setLoadingCep(true);
    setEnderecoDestino(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setEnderecoDestino({
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || "",
      });

      toast.success("CEP encontrado!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Verifique o número informado.");
    } finally {
      setLoadingCep(false);
    }
  };

  // Handler para mudança no CEP
  const handleCepChange = (valor: string) => {
    const cepFormatado = formatarCep(valor);
    setCep(cepFormatado);

    // Buscar automaticamente quando o CEP estiver completo
    const cepLimpo = cepFormatado.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCep(cepFormatado);
    } else {
      setEnderecoDestino(null);
    }
  };

  const origensFiltradas = origens.filter((origem) =>
    origem.nome.toLowerCase().includes(buscaOrigem.toLowerCase()) ||
    origem.endereco.toLowerCase().includes(buscaOrigem.toLowerCase())
  );

  const handleCalcularFrete = async () => {
    // Validação
    if (!origemSelecionada) {
      toast.error("Selecione uma origem");
      return;
    }
    
    if (!cep || !altura || !largura || !comprimento || !peso) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setCotacoes([]);

    try {
      const response = await frete.cotacao({
        cepOrigem: origemSelecionada.cep.replace("-", ""),
        cepDestino: cep.replace("-", ""),
        embalagem: {
          altura,
          largura,
          comprimento,
          peso,
          diametro: "0",
        },
        logisticaReversa: "N",
        valorDeclarado: parseFloat(valorDeclarado) || 0,
        cpfCnpjLoja: "", // Será preenchido pela função com dados do usuário
      });

      setCotacoes(response.data);
      
      if (response.data.length === 0) {
        toast.info("Nenhuma cotação disponível para os dados informados");
      } else {
        toast.success(`${response.data.length} opção${response.data.length > 1 ? 'ões' : ''} de frete encontrada${response.data.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao calcular frete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Simulador de Frete</h1>
        <p className="text-sm text-muted-foreground">
          Simule o valor do frete para o seu pedido
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-none shadow-sm">
        <div className="p-6">
          {/* Origem */}
          {loadingOrigens ? (
            <div className="mb-6 flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando origens...</span>
            </div>
          ) : origens.length === 0 ? (
            <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Nenhuma origem disponível</p>
            </div>
          ) : (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <div className="mb-6 cursor-pointer rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <User className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Origem:</p>
                        <p className="text-sm font-medium">
                          {origemSelecionada?.nome}
                          {origemSelecionada?.isPrincipal && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              Principal
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {origemSelecionada?.endereco}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Alterar
                    </Button>
                  </div>
                </div>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Selecionar Origem</DialogTitle>
              </DialogHeader>
              
              {/* Campo de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou endereço..."
                  value={buscaOrigem}
                  onChange={(e) => setBuscaOrigem(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {origensFiltradas.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma origem encontrada
                  </p>
                ) : (
                  origensFiltradas.map((origem) => (
                  <button
                    key={origem.id}
                    onClick={() => {
                      setOrigemSelecionada(origem);
                      setModalOpen(false);
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-accent ${
                      origemSelecionada?.id === origem.id
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {origem.nome}
                          {origem.isPrincipal && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              Principal
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{origem.endereco}</p>
                        <p className="mt-1 text-xs text-muted-foreground">CEP: {origem.cep}</p>
                      </div>
                      {origemSelecionada?.id === origem.id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <svg
                            className="h-4 w-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          )}

          {/* CEP Destino */}
          <div className="mb-6">
            <Label htmlFor="cep" className="text-base">CEP de Destino</Label>
            <div className="relative">
              <Input
                id="cep"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                maxLength={9}
                className="mt-2 h-12 rounded-lg"
              />
              {loadingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {enderecoDestino && (
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">
                  {enderecoDestino.logradouro}
                  {enderecoDestino.logradouro && enderecoDestino.bairro && " - "}
                  {enderecoDestino.bairro}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enderecoDestino.localidade}/{enderecoDestino.uf}
                </p>
              </div>
            )}
          </div>

          {/* Dimensões */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Dimensões (cm):</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="altura" className="text-primary">Altura:</Label>
                <Input
                  id="altura"
                  type="number"
                  placeholder="0"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  className="mt-2 h-12 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="largura" className="text-primary">largura:</Label>
                <Input
                  id="largura"
                  type="number"
                  placeholder="0"
                  value={largura}
                  onChange={(e) => setLargura(e.target.value)}
                  className="mt-2 h-12 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="comprimento" className="text-primary">Comprimento:</Label>
                <Input
                  id="comprimento"
                  type="number"
                  placeholder="0"
                  value={comprimento}
                  onChange={(e) => setComprimento(e.target.value)}
                  className="mt-2 h-12 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="peso" className="text-primary">Peso:</Label>
                <Input
                  id="peso"
                  type="number"
                  placeholder="0"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="mt-2 h-12 rounded-lg"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              O peso deve ser em gramas. Ex: 100 gramas = 100 <span className="text-destructive">(Apenas números)</span>
            </p>
          </div>

          {/* Valor Declarado */}
          <div className="mb-6">
            <Label htmlFor="valorDeclarado" className="text-muted-foreground">Valor Declarado:</Label>
            <Input
              id="valorDeclarado"
              type="number"
              placeholder="0"
              value={valorDeclarado}
              onChange={(e) => setValorDeclarado(e.target.value)}
              className="mt-2 h-12 rounded-lg"
            />
          </div>
        </div>
      </Card>

      {/* Results or Empty State */}
      {loading ? (
        <Card className="border-none shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center p-4 text-center sm:p-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h3 className="mt-6 text-xl font-semibold sm:text-2xl">Calculando opções de frete...</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Aguarde enquanto buscamos as melhores opções para você
            </p>
          </div>
        </Card>
      ) : cotacoes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {cotacoes.length} opção{cotacoes.length > 1 ? 'ões' : ''} encontrada{cotacoes.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cotacoes.map((cotacao, index) => (
              <CotacaoResultCard key={`${cotacao.idLote}-${index}`} cotacao={cotacao} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-none shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center p-4 text-center sm:p-8">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted sm:h-32 sm:w-32">
              <Calculator className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
            </div>
            <h3 className="mb-2 text-xl font-semibold sm:text-2xl">Nenhuma cotação disponível</h3>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              Preencha os dados acima e clique em calcular para ver as opções de frete disponíveis
            </p>
          </div>
        </Card>
      )}

      {/* Calculate Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-4 z-10">
        <Button
          size="lg"
          className="h-14 w-full rounded-full font-semibold shadow-lg"
          onClick={handleCalcularFrete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Frete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
