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
  
  // Valor apresentado pela API já tem o acréscimo aplicado
  const valorComAcrescimo = parseFloat(cotacao.preco);
  const acrescimoPercentual = cotacao.percentualAcrescimo || cotacao.acrescimo || 0;
  
  // Calcular valor real: valorApresentado / (1 + percentualAcrescimo/100)
  const valorReal = acrescimoPercentual > 0 
    ? valorComAcrescimo / (1 + acrescimoPercentual / 100)
    : valorComAcrescimo;
  
  const valorAcrescimo = valorComAcrescimo - valorReal;
  
  return (
    <Card className="group relative overflow-hidden border-border transition-all hover:border-primary hover:shadow-xl animate-fade-in">
      {/* Badge de Acréscimo */}
      {acrescimoPercentual > 0 && (
        <div className="absolute right-2 top-2 z-10">
          <div className="rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-1 shadow-lg">
            <p className="text-xs font-bold uppercase text-white">
              +{acrescimoPercentual}%
            </p>
          </div>
        </div>
      )}
      
      <div className="p-5 pt-10">
        {/* Logo da Transportadora */}
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-20 w-full max-w-[200px] items-center justify-center rounded-lg bg-muted/50 p-3">
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
        </div>
        
        {/* Nome do Serviço */}
        <h3 className="mb-3 text-center text-base font-semibold">{cotacao.nomeServico}</h3>
        
        {/* Preços */}
        <div className="mb-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center dark:from-orange-950/20 dark:to-orange-900/20">
          <div className="mb-2 inline-block rounded-full bg-black px-3 py-1">
            <p className="text-xs font-bold uppercase text-white">
              Black Friday
            </p>
          </div>
          <p className="mb-1 text-xs text-muted-foreground">
            Valor real do frete: R$ {valorReal.toFixed(2)}
          </p>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Valor com acréscimo
          </p>
          <p className="mb-2 text-4xl font-black text-primary">
            R$ {valorComAcrescimo.toFixed(2)}
          </p>
          {valorAcrescimo > 0 && (
            <div className="inline-block rounded-full bg-orange-600 px-4 py-1.5 shadow-md">
              <p className="text-xs font-bold text-white">
                +R$ {valorAcrescimo.toFixed(2)} de acréscimo
              </p>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="mb-4 space-y-3">
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
