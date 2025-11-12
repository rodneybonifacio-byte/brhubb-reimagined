import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, User, MapPin, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const origens = [
  {
    id: 1,
    nome: "FINANCEIRO BRHUB",
    endereco: "Rua Laurindo Sbampato, 461, CASA, Vila Guilherme, São Paulo/SP",
    cep: "02055-000"
  },
  {
    id: 2,
    nome: "CD Norte",
    endereco: "Av. das Nações, 1500, Galpão 3, Guarulhos/SP",
    cep: "07123-456"
  },
  {
    id: 3,
    nome: "Filial RJ",
    endereco: "Rua do Porto, 200, Centro, Rio de Janeiro/RJ",
    cep: "20040-000"
  },
  {
    id: 4,
    nome: "CD Sul",
    endereco: "Rua dos Pinheiros, 890, Curitiba/PR",
    cep: "80420-100"
  }
];

export default function SimuladorFrete() {
  const [cep, setCep] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [peso, setPeso] = useState("");
  const [valorDeclarado, setValorDeclarado] = useState("");
  const [origemSelecionada, setOrigemSelecionada] = useState(origens[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [buscaOrigem, setBuscaOrigem] = useState("");

  const origensFiltradas = origens.filter((origem) =>
    origem.nome.toLowerCase().includes(buscaOrigem.toLowerCase()) ||
    origem.endereco.toLowerCase().includes(buscaOrigem.toLowerCase())
  );

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
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <div className="mb-6 cursor-pointer rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <User className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Origem:</p>
                      <p className="text-sm font-medium">{origemSelecionada.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {origemSelecionada.endereco}
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
                      origemSelecionada.id === origem.id
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{origem.nome}</p>
                        <p className="text-sm text-muted-foreground">{origem.endereco}</p>
                        <p className="mt-1 text-xs text-muted-foreground">CEP: {origem.cep}</p>
                      </div>
                      {origemSelecionada.id === origem.id && (
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
