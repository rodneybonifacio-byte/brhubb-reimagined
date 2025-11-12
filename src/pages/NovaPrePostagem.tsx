import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function NovaPrePostagem() {
  const navigate = useNavigate();
  const [formato, setFormato] = useState("caixa");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Etiqueta criada com sucesso!");
    navigate("/envios/pre-postagem");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nova etiqueta</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados para criar uma nova etiqueta de envio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origem */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <MapPin className="h-5 w-5" />
              Informe a origem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="font-medium">FINANCEIRO BRHUB</p>
              <p className="text-sm text-muted-foreground">
                Rua Laurindo Sbampato, 461, CASA, Vila Guilherme, São Paulo/SP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pacote */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <Package className="h-5 w-5" />
              Informações do pacote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formato">Formato</Label>
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger id="formato">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caixa">Caixa / Pacote</SelectItem>
                  <SelectItem value="envelope">Envelope</SelectItem>
                  <SelectItem value="rolo">Rolo / Cilindro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (g)</Label>
                <Input id="peso" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input id="altura" type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input id="largura" type="number" placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comprimento">Comprimento (cm)</Label>
                <Input id="comprimento" type="number" placeholder="20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destinatário */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <MapPin className="h-5 w-5" />
              Informe o destino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do destinatário</Label>
              <Input id="nome" placeholder="Nome completo" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF/CNPJ</Label>
              <Input id="cpf" placeholder="000.000.000-00" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(11) 99999-9999" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" placeholder="00000-000" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rua">Rua</Label>
              <Input id="rua" placeholder="Nome da rua" className="h-11" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" placeholder="123" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" placeholder="Apto, bloco, etc" className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" placeholder="Nome do bairro" className="h-11" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="São Paulo" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" placeholder="SP" maxLength={2} className="h-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valor */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase text-primary">
              <DollarSign className="h-5 w-5" />
              Valor declarado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do conteúdo</Label>
              <Input id="valor" type="number" placeholder="0,00" className="h-11" />
              <p className="text-xs text-muted-foreground">
                Valor declarado para fins de seguro
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            onClick={() => navigate("/envios/pre-postagem")}
          >
            Cancelar
          </Button>
          <Button type="submit" className="h-11 rounded-full font-medium shadow-lg">
            Criar etiqueta
          </Button>
        </div>
      </form>
    </div>
  );
}
