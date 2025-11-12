import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function NovaPrePostagem() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pré-postagem criada com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nova Pré-Postagem</h1>
          <p className="text-muted-foreground">Cadastre um novo envio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Remetente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Remetente:</CardTitle>
            <Button variant="outline" size="sm" type="button">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">FINANCEIRO BRHUB</p>
              <p className="text-sm text-muted-foreground">
                Rua Laurindo Sbampato, 461, CASA, Vila Guilherme, São Paulo/SP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Destinatário */}
        <Card>
          <CardHeader>
            <CardTitle>Destinatário:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Destinatário:</Label>
                <Input id="nome" placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF/CNPJ:</Label>
                <Input id="cpf" placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular:</Label>
                <Input id="celular" placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP:</Label>
                <Input id="cep" placeholder="00000-000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rua">Rua:</Label>
                <Input id="rua" placeholder="Nome da rua" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número:</Label>
                <Input id="numero" placeholder="123" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento:</Label>
                <Input id="complemento" placeholder="Apto, Bloco, etc" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro:</Label>
                <Input id="bairro" placeholder="Nome do bairro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade:</Label>
                <Input id="cidade" placeholder="Nome da cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF:</Label>
                <Input id="uf" placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="logistica" />
              <label htmlFor="logistica" className="text-sm font-medium leading-none">
                Logística Reversa
              </label>
              <span className="text-sm text-muted-foreground">
                Somente para devoluções. Prazo de expiração: <span className="font-medium">10 dias</span> após a solicitação.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dimensões */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensões (cm):</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="altura">Altura:</Label>
                <Input id="altura" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura">Largura:</Label>
                <Input id="largura" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento">Comprimento:</Label>
                <Input id="comprimento" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso:</Label>
                <Input id="peso" type="number" placeholder="0" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              O peso deve ser em gramas. Ex: 100 gramas = 100{" "}
              <span className="text-red-500">(Apenas números)</span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Declarado:</Label>
              <Input id="valor" type="number" placeholder="0" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">Criar Pré-Postagem</Button>
        </div>
      </form>
    </div>
  );
}
