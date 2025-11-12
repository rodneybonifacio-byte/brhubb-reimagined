import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, User } from "lucide-react";
import { useState } from "react";

export default function SimuladorFrete() {
  const [cep, setCep] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [peso, setPeso] = useState("");
  const [valorDeclarado, setValorDeclarado] = useState("");

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
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Origem:</p>
                <p className="text-sm font-medium">FINANCEIRO BRHUB</p>
                <p className="text-sm text-muted-foreground">
                  Rua Laurindo Sbampato, 461, CASA, Vila Guilherme, São Paulo/SP
                </p>
              </div>
            </div>
          </div>

          {/* CEP */}
          <div className="mb-6">
            <Label htmlFor="cep" className="text-base">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="mt-2 h-12 rounded-lg"
            />
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

      {/* Empty State */}
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

      {/* Calculate Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-4 z-10">
        <Button
          size="lg"
          className="h-14 w-full rounded-full font-semibold shadow-lg"
        >
          <Calculator className="mr-2 h-5 w-5" />
          Calcular Frete
        </Button>
      </div>
    </div>
  );
}
