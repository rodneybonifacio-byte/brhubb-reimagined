import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react";

export default function VisualizarEtiqueta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  
  const urlEtiqueta = searchParams.get("url");
  const emissaoId = searchParams.get("id");

  useEffect(() => {
    if (!urlEtiqueta) {
      setError(true);
      setLoading(false);
    } else {
      // Timeout para garantir que não fique loading infinito
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [urlEtiqueta]);

  const handleImprimir = () => {
    if (urlEtiqueta) {
      window.print();
    }
  };

  const handleBaixar = () => {
    if (urlEtiqueta) {
      const link = document.createElement('a');
      link.href = urlEtiqueta;
      link.download = `etiqueta-${emissaoId || 'download'}.pdf`;
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
        <div className="flex items-center justify-between gap-4 p-4">
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
          {!iframeError ? (
            <iframe
              src={urlEtiqueta}
              className="h-full w-full border-0"
              title="Etiqueta de Envio"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setIframeError(true);
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <Card className="max-w-md p-6 text-center">
                <p className="mb-4 text-muted-foreground">
                  Não foi possível carregar o PDF no navegador.
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
          )}
        </div>

        {/* PDF Viewer - Mobile */}
        <div className="md:hidden">
          <div className="p-4">
            {!iframeError ? (
              <Card className="overflow-hidden">
                <iframe
                  src={urlEtiqueta}
                  className="h-[70vh] w-full border-0"
                  title="Etiqueta de Envio"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setIframeError(true);
                  }}
                />
              </Card>
            ) : null}
            
            {/* Opções de visualização mobile */}
            <div className="mt-4 space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                {iframeError ? "PDF não pôde ser carregado." : "Use as opções abaixo para melhor visualização:"}
              </p>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={handleBaixar}
                  className="w-full"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Baixar PDF
                </Button>
                <Button
                  onClick={() => window.open(urlEtiqueta, '_blank')}
                  className="w-full"
                >
                  Abrir em Nova Aba
                </Button>
              </div>
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