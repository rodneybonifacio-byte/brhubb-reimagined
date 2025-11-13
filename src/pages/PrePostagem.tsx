import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Package2, Search, Filter, Download, MoreVertical, Loader2, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { emissoes } from "@/lib/api";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusTabs = [
  { label: "Todas", value: "", count: 0 },
  { label: "Pré-postadas", value: "PRE_POSTADO", count: 0 },
  { label: "Postadas", value: "POSTADO", count: 0 },
  { label: "Em trânsito", value: "EM_TRANSITO", count: 0 },
  { label: "Entregues", value: "ENTREGUE", count: 0 },
];

interface EmissaoData {
  id: string;
  mysql_id: string;
  cliente_id: string | null;
  codigo_objeto: string | null;
  codigo_rastreio: string | null;
  transportadora: string | null;
  servico: string | null;
  status: string | null;
  valor_frete: number | null;
  data_emissao: string | null;
  data_postagem: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
  remetente: any;
  destinatario: any;
  dimensoes: any;
}

export default function PrePostagem() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emissoesData, setEmissoesData] = useState<EmissaoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (!authLoading && user) {
      carregarEmissoes();
    }
  }, [activeTab, searchQuery, page, user, authLoading, isAdmin]);

  const carregarEmissoes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Construir query base - usando 'as any' para evitar erros de tipo do TypeScript
      let query = supabase
        .from('mysql_emissoes' as any)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false }); // Ordenar por data de criação, mais recente primeiro

      // CONTROLE DE ACESSO: Admin vê todas as emissões, usuários comuns veem apenas as suas
      if (!isAdmin) {
        query = query.eq('cliente_id', user.id);
      }

      // Filtrar por status se selecionado
      if (activeTab) {
        query = query.eq('status', activeTab);
      }

      // Filtrar por busca (código de rastreio, código objeto, ou nome do destinatário)
      if (searchQuery) {
        query = query.or(
          `codigo_objeto.ilike.%${searchQuery}%,codigo_rastreio.ilike.%${searchQuery}%,destinatario->>nome.ilike.%${searchQuery}%`
        );
      }

      // Paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao carregar emissões:', error);
        toast.error("Erro ao carregar etiquetas");
        return;
      }

      setEmissoesData((data as unknown as EmissaoData[]) || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error("Erro ao carregar etiquetas");
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = (emissao: EmissaoData) => {
    let url = "";
    if (emissao.transportadora === "CORREIOS") {
      url = emissoes.obterEtiquetaCorreiosPdf(emissao.mysql_id);
    } else {
      url = emissoes.obterEtiquetaPdf(emissao.mysql_id);
    }
    navigate(`/envios/visualizar?url=${encodeURIComponent(url)}&id=${emissao.mysql_id}`);
  };

  const handleImprimirDeclaracao = (emissao: EmissaoData) => {
    if (emissao.transportadora === "CORREIOS") {
      const url = emissoes.obterDeclaracaoCorreiosPdf(emissao.mysql_id);
      navigate(`/envios/visualizar?url=${encodeURIComponent(url)}&id=${emissao.mysql_id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PRE_POSTADO: { label: "Pré-postado", variant: "secondary" },
      POSTADO: { label: "Postado", variant: "default" },
      EM_TRANSITO: { label: "Em trânsito", variant: "default" },
      ENTREGUE: { label: "Entregue", variant: "default" },
      CANCELADO: { label: "Cancelado", variant: "destructive" },
    };
    
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Etiquetas de envio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie e acompanhe todas as suas etiquetas
            </p>
          </div>
          <Button
            onClick={() => navigate("/envios/nova")}
            size="lg"
            className="h-12 w-full rounded-full px-6 font-medium shadow-lg sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova etiqueta
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-none shadow-sm">
          <div className="flex flex-col gap-3 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, destinatário ou CEP..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-full pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="h-11 flex-1 rounded-full sm:flex-initial"
                onClick={carregarEmissoes}
              >
                <Filter className="mr-2 h-5 w-5" />
                Atualizar
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={cn(
                "h-11 flex-shrink-0 whitespace-nowrap rounded-full px-4 font-medium transition-all sm:px-6",
                activeTab === tab.value && "shadow-md"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Emissões */}
      {loading ? (
        <Card className="border-none shadow-sm">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Card>
      ) : emissoesData.length === 0 ? (
        <Card className="border-none shadow-sm">
          <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center sm:p-8">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 sm:h-32 sm:w-32">
              <Package2 className="h-12 w-12 text-primary sm:h-16 sm:w-16" />
            </div>
            <h3 className="mb-2 text-xl font-semibold sm:text-2xl">Nenhuma etiqueta encontrada</h3>
            <p className="mb-8 max-w-md text-sm text-muted-foreground sm:text-base">
              {activeTab === ""
                ? "Comece criando sua primeira etiqueta de envio"
                : `Não há etiquetas com status "${statusTabs.find(t => t.value === activeTab)?.label}"`
              }
            </p>
            <Button
              onClick={() => navigate("/envios/nova")}
              size="lg"
              className="h-12 w-full rounded-full px-8 font-medium shadow-lg sm:w-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              Criar nova etiqueta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {emissoesData.map((emissao) => (
            <Card key={emissao.id} className="border-none shadow-sm">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-bold">
                      {emissao.codigo_objeto || emissao.id}
                    </span>
                    {getStatusBadge(emissao.status || '')}
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2">
                    {emissao.destinatario && (
                      <div>
                        <p className="text-xs text-muted-foreground">Destinatário</p>
                        <p className="font-medium">{emissao.destinatario.nome}</p>
                        <p className="text-sm text-muted-foreground">{emissao.destinatario.cpfCnpj}</p>
                      </div>
                    )}
                    
                    {emissao.remetente && (
                      <div>
                        <p className="text-xs text-muted-foreground">Remetente</p>
                        <p className="font-medium">{emissao.remetente.nome}</p>
                        {emissao.remetente.empresa && (
                          <p className="text-sm text-muted-foreground">{emissao.remetente.empresa}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Serviço: </span>
                      <span className="font-medium">{emissao.servico}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transportadora: </span>
                      <span className="font-medium">{emissao.transportadora}</span>
                    </div>
                    {emissao.valor_frete && (
                      <div>
                        <span className="text-muted-foreground">Valor: </span>
                        <span className="font-medium">R$ {Number(emissao.valor_frete).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Criado em: {new Date(emissao.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => handleImprimir(emissao)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleImprimir(emissao)}>
                        Imprimir Etiqueta
                      </DropdownMenuItem>
                      {emissao.transportadora === "CORREIOS" && (
                        <DropdownMenuItem onClick={() => handleImprimirDeclaracao(emissao)}>
                          Imprimir Declaração
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Rastrear</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center px-4">
                Página {page} de {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}