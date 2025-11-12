import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package, FileText } from "lucide-react";
import { CotacaoItem } from "@/lib/api";
import correiosLogo from "@/assets/correios-logo.png";
import rodonaves from "@/assets/rodonaves-logo.png";

interface CotacaoResultCardProps {
  cotacao: CotacaoItem;
}

const getLogoUrl = (nomeServico: string, transportadora: string): string => {
  const transportadoraNormalizada = transportadora.toLowerCase();
  
  if (transportadoraNormalizada.includes('rodonaves')) {
    return rodonaves;
  }
  
  // Por padrão, usar logo dos Correios
  return correiosLogo;
};

export function CotacaoResultCard({ cotacao }: CotacaoResultCardProps) {
  const logoUrl = getLogoUrl(cotacao.nomeServico, cotacao.transportadora);
  
  return (
    <Card className="overflow-hidden border-border transition-all hover:border-primary hover:shadow-md">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          {/* Logo da Transportadora */}
          <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-muted/50 p-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={cotacao.transportadora}
                className="max-h-full max-w-full object-contain"
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
