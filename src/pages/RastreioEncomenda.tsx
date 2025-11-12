import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MapPin, Clock, CheckCircle2, XCircle, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EventoRastreio {
  data: string;
  hora: string;
  local: string;
  status: string;
  descricao: string;
}

export default function RastreioEncomenda() {
  const [codigoRastreio, setCodigoRastreio] = useState("");
  const [loading, setLoading] = useState(false);
  const [rastreioData, setRastreioData] = useState<{
    codigo: string;
    status: string;
    eventos: EventoRastreio[];
  } | null>(null);

  const handleRastrear = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigoRastreio.trim()) {
      toast.error("Digite um código de rastreio válido");
      return;
    }

    try {
      setLoading(true);
      
      // Simulação de API - substituir pela chamada real quando disponível
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dados mockados para demonstração
      setRastreioData({
        codigo: codigoRastreio,
        status: "EM_TRANSITO",
        eventos: [
          {
            data: "12/11/2025",
            hora: "14:30",
            local: "São Paulo - SP",
            status: "SAIU_PARA_ENTREGA",
            descricao: "Objeto saiu para entrega ao destinatário"
          },
          {
            data: "12/11/2025",
            hora: "08:15",
            local: "São Paulo - SP",
            status: "EM_TRANSITO",
            descricao: "Objeto em trânsito - por favor aguarde"
          },
          {
            data: "11/11/2025",
            hora: "16:45",
            local: "São Paulo - SP",
            status: "POSTADO",
            descricao: "Objeto postado nos Correios"
          }
        ]
      });

      toast.success("Rastreio encontrado!");
    } catch (error) {
      toast.error("Erro ao rastrear encomenda. Tente novamente.");
      setRastreioData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ENTREGUE":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "SAIU_PARA_ENTREGA":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "EM_TRANSITO":
        return <Package className="h-5 w-5 text-orange-500" />;
      case "POSTADO":
        return <MapPin className="h-5 w-5 text-primary" />;
      case "CANCELADO":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ENTREGUE: { label: "Entregue", variant: "default" },
      SAIU_PARA_ENTREGA: { label: "Saiu para entrega", variant: "default" },
      EM_TRANSITO: { label: "Em trânsito", variant: "secondary" },
      POSTADO: { label: "Postado", variant: "outline" },
      CANCELADO: { label: "Cancelado", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">BRHUB</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Card de Busca */}
          <Card className="mb-8 border-none shadow-xl">
            <CardContent className="p-8 sm:p-12">
              <div className="mb-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Package className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="mb-2 text-3xl font-bold">Rastreio de encomendas</h2>
                <p className="text-muted-foreground">
                  Fique atento ao status da sua encomenda
                </p>
              </div>

              <form onSubmit={handleRastrear} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Código de Rastreio"
                    value={codigoRastreio}
                    onChange={(e) => setCodigoRastreio(e.target.value.toUpperCase())}
                    className="h-14 text-center text-lg font-mono"
                    disabled={loading}
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    Ex: AB123456789BR
                  </p>
                </div>

                <Button
                  type="submit"
                  className="h-14 w-full text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Rastreando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Rastrear
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultado do Rastreio */}
          {rastreioData && (
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                {/* Header do Resultado */}
                <div className="mb-8 border-b pb-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Código de rastreio</p>
                      <p className="font-mono text-xl font-bold">{rastreioData.codigo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rastreioData.status)}
                    </div>
                  </div>
                </div>

                {/* Timeline de Eventos */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Histórico de movimentação</h3>
                  
                  <div className="relative space-y-6">
                    {/* Linha vertical */}
                    <div className="absolute left-[14px] top-4 h-[calc(100%-2rem)] w-px bg-border" />

                    {rastreioData.eventos.map((evento, index) => (
                      <div key={index} className="relative flex gap-4">
                        {/* Ícone */}
                        <div className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-4 border-background bg-card shadow-sm">
                          {getStatusIcon(evento.status)}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{evento.data} às {evento.hora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{evento.local}</span>
                            </div>
                          </div>
                          <p className="font-medium">{evento.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Nova Busca */}
                <div className="mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRastreioData(null);
                      setCodigoRastreio("");
                    }}
                  >
                    Rastrear outra encomenda
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
