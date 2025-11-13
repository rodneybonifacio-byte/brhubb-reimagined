import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, User, MapPin, Search, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { frete, CotacaoItem } from "@/lib/api";
import { toast } from "sonner";
import { CotacaoResultCard } from "@/components/CotacaoResultCard";
import { supabase } from "@/integrations/supabase/client";
import brhubLogo from "@/assets/brhub-logo.png";
import correiosLogo from "@/assets/correios-logo.png";
import rodonaves from "@/assets/rodonaves-logo.png";
import { z } from "zod";

const cotacaoSchema = z.object({
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  altura: z.number().positive("Altura deve ser maior que zero").max(200, "Altura deve ser no máximo 200cm"),
  largura: z.number().positive("Largura deve ser maior que zero").max(200, "Largura deve ser no máximo 200cm"),
  comprimento: z.number().positive("Comprimento deve ser maior que zero").max(200, "Comprimento deve ser no máximo 200cm"),
  peso: z.number().positive("Peso deve ser maior que zero").max(300, "Peso deve ser no máximo 300kg"),
  valorDeclarado: z.number().min(0, "Valor declarado não pode ser negativo").max(100000, "Valor deve ser no máximo R$ 100.000")
});

const enderecoSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf_cnpj: z.string().trim().min(11, "CPF/CNPJ inválido").max(18, "CPF/CNPJ inválido"),
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  logradouro: z.string().trim().min(3, "Logradouro é obrigatório").max(200, "Logradouro deve ter no máximo 200 caracteres"),
  numero: z.string().trim().min(1, "Número é obrigatório").max(10, "Número deve ter no máximo 10 caracteres"),
  bairro: z.string().trim().min(2, "Bairro é obrigatório").max(100, "Bairro deve ter no máximo 100 caracteres"),
  localidade: z.string().trim().min(2, "Cidade é obrigatória").max(100, "Cidade deve ter no máximo 100 caracteres"),
  uf: z.string().trim().length(2, "UF deve ter 2 caracteres")
});
interface OrigemItem {
  id: string;
  nome: string;
  endereco: string;
  cep: string;
  cpfCnpj: string;
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
  const [addOrigemModalOpen, setAddOrigemModalOpen] = useState(false);
  const [buscaOrigem, setBuscaOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrigens, setLoadingOrigens] = useState(true);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cotacoes, setCotacoes] = useState<CotacaoItem[]>([]);
  const [enderecoDestino, setEnderecoDestino] = useState<EnderecoDestino | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  
  // Estados para novo endereço
  const [novoEndereco, setNovoEndereco] = useState({
    name: "",
    cpf_cnpj: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    is_principal: false
  });

  // Carregar origens ao montar o componente
  useEffect(() => {
    const carregarOrigens = async () => {
      try {
        setLoadingOrigens(true);

        // Obter o usuário autenticado do Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Usuário não autenticado no Supabase");
          setLoadingOrigens(false);
          return;
        }
        
        setSupabaseUserId(user.id);

        // Buscar endereços do banco MySQL sincronizado
        const { data: clientesData, error } = await supabase
          .from('mysql_clientes' as any)
          .select('*')
          .eq('ativo', true);

        if (error) {
          console.error("Erro ao buscar clientes do MySQL:", error);
          toast.error("Erro ao carregar endereços de origem");
          setOrigens([]);
          return;
        }

        const origensCarregadas: OrigemItem[] = [];

        // Converter dados do MySQL para formato OrigemItem
        if (clientesData && clientesData.length > 0) {
          clientesData.forEach((cliente: any) => {
            if (cliente.endereco) {
              const endereco = cliente.endereco;
              const enderecoFormatado = [
                endereco.logradouro, 
                endereco.numero, 
                endereco.complemento, 
                endereco.bairro, 
                `${endereco.localidade}/${endereco.uf}`
              ].filter(Boolean).join(', ');
              
              origensCarregadas.push({
                id: cliente.id,
                nome: cliente.nome || cliente.email,
                endereco: enderecoFormatado,
                cep: endereco.cep,
                cpfCnpj: cliente.cpf_cnpj,
                isPrincipal: false
              });
            }
          });
        }
        
        setOrigens(origensCarregadas);

        // Selecionar o primeiro endereço válido automaticamente
        if (origensCarregadas.length > 0) {
          setOrigemSelecionada(origensCarregadas[0]);
          toast.success("Origem carregada com sucesso!");
        } else {
          toast.info("Nenhum endereço de origem cadastrado. Adicione um para começar!");
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
        uf: data.uf || ""
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
  const origensFiltradas = origens.filter(origem => origem.nome.toLowerCase().includes(buscaOrigem.toLowerCase()) || origem.endereco.toLowerCase().includes(buscaOrigem.toLowerCase()));
  
  // Função para buscar CEP do novo endereço
  const buscarCepNovoEndereco = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setNovoEndereco(prev => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || ""
      }));
      toast.success("CEP encontrado!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };
  
  // Função para salvar novo endereço
  const handleSalvarNovoEndereco = async () => {
    if (!supabaseUserId) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    // Validação com Zod
    const validation = enderecoSchema.safeParse(novoEndereco);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('client_origins')
        .insert({
          user_id: supabaseUserId,
          client_id: supabaseUserId,
          name: novoEndereco.name,
          cpf_cnpj: novoEndereco.cpf_cnpj,
          cep: novoEndereco.cep,
          logradouro: novoEndereco.logradouro,
          numero: novoEndereco.numero,
          complemento: novoEndereco.complemento,
          bairro: novoEndereco.bairro,
          localidade: novoEndereco.localidade,
          uf: novoEndereco.uf,
          is_principal: novoEndereco.is_principal
        });
      
      if (error) throw error;
      
      toast.success("Endereço cadastrado com sucesso!");
      setAddOrigemModalOpen(false);
      
      // Resetar formulário
      setNovoEndereco({
        name: "",
        cpf_cnpj: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        localidade: "",
        uf: "",
        is_principal: false
      });
      
      // Recarregar origens
      const { data: origensData } = await supabase
        .from('client_origins')
        .select('*')
        .eq('user_id', supabaseUserId)
        .order('is_principal', { ascending: false })
        .order('created_at', { ascending: false});
      
      if (origensData) {
        const origensCarregadas: OrigemItem[] = origensData.map((origem: any) => {
          const enderecoFormatado = [
            origem.logradouro, 
            origem.numero, 
            origem.complemento, 
            origem.bairro, 
            `${origem.localidade}/${origem.uf}`
          ].filter(Boolean).join(', ');
          
          return {
            id: origem.id,
            nome: origem.name,
            endereco: enderecoFormatado,
            cep: origem.cep,
            cpfCnpj: origem.cpf_cnpj,
            isPrincipal: origem.is_principal
          };
        });
        
        setOrigens(origensCarregadas);
        if (origensCarregadas.length > 0) {
          setOrigemSelecionada(origensCarregadas[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      toast.error("Erro ao cadastrar endereço");
    }
  };
  
  const handleCalcularFrete = async () => {
    // Validação de origem
    if (!origemSelecionada) {
      toast.error("Selecione uma origem");
      return;
    }

    // Validação com Zod
    const validation = cotacaoSchema.safeParse({
      cep,
      altura: parseFloat(altura),
      largura: parseFloat(largura),
      comprimento: parseFloat(comprimento),
      peso: parseFloat(peso),
      valorDeclarado: parseFloat(valorDeclarado || "0")
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
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
          diametro: "0"
        },
        logisticaReversa: "N",
        valorDeclarado: parseFloat(valorDeclarado) || 0,
        cpfCnpjLoja: origemSelecionada.cpfCnpj // Usar CPF/CNPJ da origem selecionada
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
  return <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      {/* Black Friday Banner */}
      <Card className="relative overflow-hidden border-none bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="relative p-6 text-center">
          <div className="mb-3 inline-block animate-pulse rounded-full bg-black px-4 py-1">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              🔥 Oferta Limitada
            </p>
          </div>
          <h2 className="mb-2 text-3xl font-black uppercase text-white sm:text-4xl md:text-5xl">
            BLACK FRIDAY
          </h2>
          
          <p className="mx-auto max-w-2xl text-sm text-white/90 sm:text-base">
            <span className="font-bold text-[#FF6B00]">50% DE DESCONTO</span> em todos os fretes! 
            Aproveite as melhores tarifas do mercado.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-white">
            <span className="text-sm font-medium">⚡ Válido por tempo limitado</span>
          </div>
        </div>
      </Card>

      {/* Logo Section */}
      <Card className="border-none shadow-sm">
        
      </Card>

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
          <div className="mb-6">
            <Label className="text-base">Endereço de Origem</Label>
            {loadingOrigens ? (
              <div className="mt-2 flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando origens...</span>
              </div>
            ) : origens.length === 0 ? (
              <div className="mt-2 space-y-3">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">⚠️ Nenhuma origem disponível</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Cadastre um endereço de origem para começar a simular fretes.
                  </p>
                </div>
                <Button 
                  onClick={() => setAddOrigemModalOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Cadastrar Endereço de Origem
                </Button>
              </div>
            ) : (
              <>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="mt-2 h-12 w-full justify-start rounded-lg text-left font-normal"
                    >
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {origemSelecionada?.nome || "Selecionar origem"}
                      </span>
                      {origemSelecionada?.isPrincipal && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Principal
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Selecionar Origem</DialogTitle>
                    </DialogHeader>
                    
                    {/* Campo de Busca */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Buscar por nome ou endereço..." 
                          value={buscaOrigem} 
                          onChange={e => setBuscaOrigem(e.target.value)} 
                          className="pl-10" 
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setModalOpen(false);
                          setAddOrigemModalOpen(true);
                        }}
                        size="icon"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="max-h-[400px] space-y-3 overflow-y-auto">
                      {origensFiltradas.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          Nenhuma origem encontrada
                        </p>
                      ) : (
                        origensFiltradas.map(origem => (
                          <button 
                            key={origem.id} 
                            onClick={() => {
                              setOrigemSelecionada(origem);
                              setModalOpen(false);
                            }} 
                            className={`w-full rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-accent ${
                              origemSelecionada?.id === origem.id ? "border-primary bg-accent" : "border-border"
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
                                  <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                
                {/* Exibir endereço da origem selecionada */}
                {origemSelecionada && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {origemSelecionada.endereco}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CEP: {origemSelecionada.cep}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CEP Destino */}
          <div className="mb-6">
            <Label htmlFor="cep" className="text-base">CEP de Destino</Label>
            <div className="relative">
              <Input id="cep" placeholder="00000-000" value={cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} className="mt-2 h-12 rounded-lg" />
              {loadingCep && <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>}
            </div>
            {enderecoDestino && <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">
                  {enderecoDestino.logradouro}
                  {enderecoDestino.logradouro && enderecoDestino.bairro && " - "}
                  {enderecoDestino.bairro}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enderecoDestino.localidade}/{enderecoDestino.uf}
                </p>
              </div>}
          </div>

          {/* Dimensões */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Dimensões (cm):</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="altura" className="text-primary">Altura:</Label>
                <Input id="altura" type="number" placeholder="0" value={altura} onChange={e => setAltura(e.target.value)} className="mt-2 h-12 rounded-lg" />
              </div>
              <div>
                <Label htmlFor="largura" className="text-primary">largura:</Label>
                <Input id="largura" type="number" placeholder="0" value={largura} onChange={e => setLargura(e.target.value)} className="mt-2 h-12 rounded-lg" />
              </div>
              <div>
                <Label htmlFor="comprimento" className="text-primary">Comprimento:</Label>
                <Input id="comprimento" type="number" placeholder="0" value={comprimento} onChange={e => setComprimento(e.target.value)} className="mt-2 h-12 rounded-lg" />
              </div>
              <div>
                <Label htmlFor="peso" className="text-primary">Peso:</Label>
                <Input id="peso" type="number" placeholder="0" value={peso} onChange={e => setPeso(e.target.value)} className="mt-2 h-12 rounded-lg" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              O peso deve ser em gramas. Ex: 100 gramas = 100 <span className="text-destructive">(Apenas números)</span>
            </p>
          </div>

          {/* Valor Declarado */}
          <div className="mb-6">
            <Label htmlFor="valorDeclarado" className="text-muted-foreground">Valor Declarado:</Label>
            <Input id="valorDeclarado" type="number" placeholder="0" value={valorDeclarado} onChange={e => setValorDeclarado(e.target.value)} className="mt-2 h-12 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Results or Empty State */}
      {loading ? <Card className="border-none shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center p-4 text-center sm:p-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h3 className="mt-6 text-xl font-semibold sm:text-2xl">Calculando opções de frete...</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Aguarde enquanto buscamos as melhores opções para você
            </p>
          </div>
        </Card> : cotacoes.length > 0 ? <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {cotacoes.length} opção{cotacoes.length > 1 ? 'ões' : ''} encontrada{cotacoes.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cotacoes.map((cotacao, index) => <CotacaoResultCard key={`${cotacao.idLote}-${index}`} cotacao={cotacao} />)}
          </div>
        </div> : <Card className="border-none shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center p-4 text-center sm:p-8">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted sm:h-32 sm:w-32">
              <Calculator className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
            </div>
            <h3 className="mb-2 text-xl font-semibold sm:text-2xl">Nenhuma cotação disponível</h3>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              Preencha os dados acima e clique em calcular para ver as opções de frete disponíveis
            </p>
          </div>
        </Card>}

      {/* Modal para adicionar novo endereço */}
      <Dialog open={addOrigemModalOpen} onOpenChange={setAddOrigemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Endereço de Origem</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="novo-nome">Nome / Razão Social *</Label>
                <Input
                  id="novo-nome"
                  value={novoEndereco.name}
                  onChange={(e) => setNovoEndereco({...novoEndereco, name: e.target.value})}
                  placeholder="Digite o nome"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="novo-cpfcnpj">CPF / CNPJ *</Label>
                <Input
                  id="novo-cpfcnpj"
                  value={novoEndereco.cpf_cnpj}
                  onChange={(e) => setNovoEndereco({...novoEndereco, cpf_cnpj: e.target.value})}
                  placeholder="Digite o CPF ou CNPJ"
                  className="mt-2"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="novo-cep">CEP *</Label>
              <Input
                id="novo-cep"
                value={novoEndereco.cep}
                onChange={(e) => {
                  const cepFormatado = formatarCep(e.target.value);
                  setNovoEndereco({...novoEndereco, cep: cepFormatado});
                  if (cepFormatado.replace(/\D/g, '').length === 8) {
                    buscarCepNovoEndereco(cepFormatado);
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
                className="mt-2"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="novo-logradouro">Logradouro *</Label>
                <Input
                  id="novo-logradouro"
                  value={novoEndereco.logradouro}
                  onChange={(e) => setNovoEndereco({...novoEndereco, logradouro: e.target.value})}
                  placeholder="Rua, Avenida, etc."
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="novo-numero">Número *</Label>
                <Input
                  id="novo-numero"
                  value={novoEndereco.numero}
                  onChange={(e) => setNovoEndereco({...novoEndereco, numero: e.target.value})}
                  placeholder="Nº"
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="novo-complemento">Complemento</Label>
                <Input
                  id="novo-complemento"
                  value={novoEndereco.complemento}
                  onChange={(e) => setNovoEndereco({...novoEndereco, complemento: e.target.value})}
                  placeholder="Apto, Bloco, etc."
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="novo-bairro">Bairro *</Label>
                <Input
                  id="novo-bairro"
                  value={novoEndereco.bairro}
                  onChange={(e) => setNovoEndereco({...novoEndereco, bairro: e.target.value})}
                  placeholder="Digite o bairro"
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="novo-localidade">Cidade *</Label>
                <Input
                  id="novo-localidade"
                  value={novoEndereco.localidade}
                  onChange={(e) => setNovoEndereco({...novoEndereco, localidade: e.target.value})}
                  placeholder="Digite a cidade"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="novo-uf">UF *</Label>
                <Input
                  id="novo-uf"
                  value={novoEndereco.uf}
                  onChange={(e) => setNovoEndereco({...novoEndereco, uf: e.target.value.toUpperCase()})}
                  placeholder="SP"
                  maxLength={2}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="novo-principal"
                checked={novoEndereco.is_principal}
                onChange={(e) => setNovoEndereco({...novoEndereco, is_principal: e.target.checked})}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="novo-principal" className="cursor-pointer">
                Definir como endereço principal
              </Label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddOrigemModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvarNovoEndereco}>
                Salvar Endereço
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calculate Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-4 z-10">
        <Button size="lg" className="h-14 w-full rounded-full font-semibold shadow-lg" onClick={handleCalcularFrete} disabled={loading}>
          {loading ? <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculando...
            </> : <>
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Frete
            </>}
        </Button>
      </div>
    </div>;
}