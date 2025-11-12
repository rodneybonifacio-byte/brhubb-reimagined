import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package, FileText } from "lucide-react";
import { CotacaoItem } from "@/lib/api";

interface CotacaoResultCardProps {
  cotacao: CotacaoItem;
}

const getLogoUrl = (imagem: string): string => {
  const logos: Record<string, string> = {
    correios: "https://logospng.org/download/correios/logo-correios-256.png",
    rodonaves: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcx3xLwfVE5xYYxN1YpO5m_XqxYdxNjXZhqw&s",
    jadlog: "https://www.jadlog.com.br/assets/images/logo-jadlog.svg",
    tnt: "https://www.tnt.com/etc.clientlibs/tnt/clientlibs/clientlib-site/resources/images/logo.svg",
  };
  
  return logos[imagem.toLowerCase()] || "";
};

export function CotacaoResultCard({ cotacao }: CotacaoResultCardProps) {
  const logoUrl = getLogoUrl(cotacao.imagem);
  
  return (
    <Card className="overflow-hidden border-border transition-all hover:border-primary hover:shadow-md">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          {/* Logo da Transportadora */}
          <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-muted/50">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={cotacao.transportadora}
                className="max-h-12 max-w-full object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {cotacao.transportadora}
              </span>
            )}
          </div>
          
          {/* Preço */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-2xl font-bold text-primary">
              R$ {parseFloat(cotacao.preco).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Nome do Serviço */}
        <h3 className="mb-3 text-lg font-semibold">{cotacao.nomeServico}</h3>

        {/* Informações */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Prazo de entrega: <span className="font-medium text-foreground">{cotacao.prazo} dia{cotacao.prazo > 1 ? 's' : ''} útil{cotacao.prazo > 1 ? 'is' : ''}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Peso: <span className="font-medium text-foreground">{(cotacao.embalagem.peso / 1000).toFixed(2)} kg</span>
            </span>
          </div>

          {cotacao.isNotaFiscal && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-500">Requer Nota Fiscal</span>
            </div>
          )}
        </div>

        {/* Botão */}
        <Button className="w-full" variant="outline">
          Selecionar
        </Button>
      </div>
    </Card>
  );
}
