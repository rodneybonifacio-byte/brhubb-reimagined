import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

const coletas = [
  {
    nome: "NICKY ATACADO",
    quantidade: 6,
    local: "RUA DOUTOR ORNELAS, 27 - , CANINDÉ, SÃO PAULO - SP, 03029030",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "CAIRO IMPORTS",
    quantidade: 5,
    local: "Rua Behring, 304 - LOJA, Brás, São Paulo - SP, 03023-020",
    responsavel: "CAIRO",
    horario: "08:00",
    color: "border-l-orange-500",
  },
  {
    nome: "KAESSI",
    quantidade: 4,
    local: "RUA CASIMIRO DE ABREU, 313 - SEM COMPLEMENTO, BRÁS, SÃO PAULO - SP, 03013001",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "LARAS MODA FITNESS",
    quantidade: 3,
    local: "RUA MINISTRO FIRMINO WHITAKER, 161 - SEM COMPLEMENTO, BRÁS, SÃO PAULO - SP, 03012020",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "NONO MODAS",
    quantidade: 3,
    local: "AVENIDA VAUTIER, 248 - , CANINDÉ, SÃO PAULO - SP, 03032000",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "TG GRIFFES",
    quantidade: 2,
    local: "Rua Xavantes, 715 - SALA 71B A, Brás, São Paulo - SP, 03027-000",
    responsavel: "TANG",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "BAUARTE",
    quantidade: 1,
    local: "RUA RIBEIRO DE LIMA, 573 - SEM COMPLEMENTO, BOM RETIRO, SÃO PAULO - SP, 01122000",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
  {
    nome: "LE RICARD BOM RETIRO",
    quantidade: 1,
    local: "RUA PROFESSOR CESARE LOMBROSO, 115 - SEM COMPLEMENTO, BOM RETIRO, SÃO PAULO - SP, 01122021",
    responsavel: "GUILHERME",
    horario: "08:30",
    color: "border-l-orange-500",
  },
];

export default function Coletas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordem de Coleta</h1>
          <p className="text-muted-foreground">Acompanhe as ordens de coleta emitidas</p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total de Objetos para Coleta</CardTitle>
            <Badge variant="default" className="bg-primary text-2xl px-4 py-2 font-bold">
              25
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Soma de todos os objetos das ordens de coleta (8 clientes)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {coletas.map((coleta, index) => (
              <Card key={index} className={`border-l-4 ${coleta.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-bold">{coleta.nome}</CardTitle>
                    <Badge variant="default" className="bg-primary">
                      {coleta.quantidade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Local:</p>
                    <p className="text-muted-foreground">{coleta.local}</p>
                  </div>
                  <div>
                    <p className="font-medium">Responsável:</p>
                    <p className="text-muted-foreground">{coleta.responsavel}</p>
                  </div>
                  <div className="rounded bg-muted px-3 py-2">
                    <p className="font-medium">Horário de Coleta: {coleta.horario}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
