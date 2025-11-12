import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer, Loader2, Package, DollarSign } from "lucide-react";
import { emissoes, type EmissaoItem } from "@/lib/api";
import { toast } from "sonner";

export default function VisualizarEtiqueta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [emissaoData, setEmissaoData] = useState<EmissaoItem | null>(null);
  const [loadingEmissao, setLoadingEmissao] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  const urlEtiqueta = searchParams.get("url");
  const emissaoId = searchParams.get("id");

  useEffect(() => {
    if (!urlEtiqueta) {
      setError(true);
      setLoading(false);
      return;
    }

    // Baixar o PDF e criar blob URL
    const carregarPdf = async () => {
      try {
        setLoading(true);
        const response = await fetch(urlEtiqueta);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar PDF');
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        setIframeError(true);
        setLoading(false);
      }
    };

    carregarPdf();

    // Cleanup: revogar blob URL quando componente desmontar
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [urlEtiqueta]);

  useEffect(() => {
    if (emissaoId) {
      carregarEmissao();
    }
  }, [emissaoId]);

  const carregarEmissao = async () => {
    if (!emissaoId) return;
    
    try {
      setLoadingEmissao(true);
      const data = await emissoes.obterPorId(emissaoId);
      setEmissaoData(data);
    } catch (error: any) {
      console.error("Erro ao carregar emissão:", error);
      toast.error("Não foi possível carregar os dados da etiqueta");
    } finally {
      setLoadingEmissao(false);
    }
  };

  const handleImprimir = () => {
    if (urlEtiqueta) {
      window.print();
    }
  };

  const handleBaixar = () => {
    const downloadUrl = pdfBlobUrl || urlEtiqueta;
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `etiqueta-${emissaoData?.codigoObjeto || emissaoId || 'download'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error || !urlEtiqueta) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h2 className="mb-4 text-xl font-bold text-destructive">Erro ao carregar etiqueta</h2>
          <p className="mb-6 text-muted-foreground">
            Não foi possível carregar a etiqueta. O link pode estar inválido ou expirado.
          </p>
          <Button onClick={() => navigate("/envios/pre-postagem")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Etiquetas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Oculto na impressão */}
      <div className="print:hidden sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 p-4">
          {/* Linha superior: Botão voltar e ações */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/envios/pre-postagem")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBaixar}
                className="flex-shrink-0"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
              <Button
                size="sm"
                onClick={handleImprimir}
                className="flex-shrink-0"
              >
                <Printer className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            </div>
          </div>

          {/* Informações da Etiqueta */}
          {emissaoData && !loadingEmissao && (
            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Código de Rastreio</p>
                  <p className="font-mono text-sm font-bold">
                    {emissaoData.codigoObjeto || emissaoId}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Serviço</p>
                  <p className="text-sm font-medium">{emissaoData.servico || emissaoData.nomeServico}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="text-sm font-bold text-primary">R$ {emissaoData.valor || emissaoData.valorFrete}</p>
                </div>
              </div>

              {emissaoData.status && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <Badge variant={emissaoData.status === "ENTREGUE" ? "default" : "secondary"}>
                    {emissaoData.status}
                  </Badge>
                </>
              )}
            </div>
          )}

          {loadingEmissao && (
            <div className="flex items-center gap-2 border-t pt-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando informações...</p>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo - Etiqueta */}
      <div className="flex-1 bg-muted/30">
        {loading && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando etiqueta...</p>
            </div>
          </div>
        )}

        {/* PDF Viewer - Desktop */}
        <div className="hidden h-full md:block">
          {!iframeError && !loading && pdfBlobUrl ? (
            <object
              data={pdfBlobUrl}
              type="application/pdf"
              className="h-full w-full"
            >
              <iframe
                src={pdfBlobUrl}
                className="h-full w-full border-0"
                title="Etiqueta de Envio"
                onError={() => {
                  setIframeError(true);
                }}
              />
            </object>
          ) : !loading && iframeError ? (
            <div className="flex h-full items-center justify-center p-8">
              <Card className="max-w-md p-6 text-center">
                <p className="mb-4 text-muted-foreground">
                  Não foi possível carregar o PDF diretamente no navegador.
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Use uma das opções abaixo para visualizar sua etiqueta:
                </p>
                <div className="space-y-3">
                  <Button onClick={handleBaixar} className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Baixar PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(urlEtiqueta, '_blank')}
                    className="w-full"
                  >
                    Abrir em Nova Aba
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        {/* PDF Viewer - Mobile */}
        <div className="md:hidden">
          <div className="p-4 space-y-4">
            {!iframeError && !loading && pdfBlobUrl ? (
              <Card className="overflow-hidden">
                <object
                  data={pdfBlobUrl}
                  type="application/pdf"
                  className="h-[60vh] w-full"
                >
                  <iframe
                    src={pdfBlobUrl}
                    className="h-[60vh] w-full border-0"
                    title="Etiqueta de Envio"
                    onError={() => {
                      setIframeError(true);
                    }}
                  />
                </object>
              </Card>
            ) : null}
            
            {/* Opções de visualização mobile - sempre visível */}
            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-foreground">
                {iframeError && !loading ? "PDF não pôde ser carregado. " : ""}
                Opções de visualização:
              </p>
              <div className="grid gap-3">
                <Button
                  onClick={handleBaixar}
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(pdfBlobUrl || urlEtiqueta, '_blank')}
                  className="w-full"
                  size="lg"
                >
                  Abrir em Nova Aba
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Recomendamos baixar o PDF para melhor visualização em dispositivos móveis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilo para impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          iframe, iframe * {
            visibility: visible;
          }
          iframe {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}