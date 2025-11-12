import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Package, ShoppingCart, Wallet, DollarSign, Users, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const metrics = [
  { title: "Total de Envios", value: "5563", icon: Package, color: "bg-purple-500" },
  { title: "Vendas Aproximado", value: "R$ 262.304,24", icon: ShoppingCart, color: "bg-orange-500" },
  { title: "Custo Aproximado", value: "R$ 215.036,66", icon: Wallet, color: "bg-pink-500" },
  { title: "Lucro Aproximado", value: "R$ 47.267,58", icon: DollarSign, color: "bg-green-500" },
  { title: "Total de Clientes", value: "33", icon: Users, color: "bg-blue-500" },
];

const statusTabs = [
  { label: "PRE POSTADOS", value: "pre-postados", active: true },
  { label: "POSTADOS", value: "postados", active: false },
  { label: "COLETADOS", value: "coletados", active: false },
  { label: "EM TRANSITO", value: "em-transito", active: false },
  { label: "ENTREGUES", value: "entregues", active: false },
  { label: "CANCELADOS", value: "cancelados", active: false },
];

const envios = [
  {
    objeto: "AB698123285BR",
    tipo: "CORREIOS SEDEX",
    remetente: "NICKY ATACADO",
    empresa: "PREMIUMVESTI",
    destinatario: "CAMILA ALVES BRITO",
    documento: "426.378.828-16",
    valor: "30.14",
    custo: "25.55",
    status: "PRE POSTADO",
    statusCor: "bg-blue-500",
    rastreio: "ABERTO",
    rastreioCor: "bg-yellow-500",
    criado: "12/11/2025 15:04",
  },
  {
    objeto: "AN206389222BR",
    tipo: "CORREIOS PAC",
    remetente: "CAIRO IMPORTS",
    empresa: "CAIRO IMPORTS",
    destinatario: "ROGERIO DUTRA DE OLIVEIRA",
    documento: "061.524.617-66",
    valor: "44.65",
    custo: "29.77",
    status: "PRE POSTADO",
    statusCor: "bg-blue-500",
    rastreio: "ABERTO",
    rastreioCor: "bg-yellow-500",
    criado: "12/11/2025 15:03",
  },
  // ... mais envios
];

export default function AcompanhamentoEnvios() {
  const [activeTab, setActiveTab] = useState("pre-postados");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento de envios</h1>
          <p className="text-muted-foreground">
            Acompanhe os envios realizados, visualize detalhes e estatísticas em geral.
          </p>
        </div>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`rounded-lg p-2 ${metric.color} text-white`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Valor/Custo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {envios.map((envio, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{envio.objeto}</p>
                        <p className="text-xs text-muted-foreground">{envio.tipo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{envio.remetente}</p>
                        <p className="text-xs text-muted-foreground">{envio.empresa}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{envio.destinatario}</p>
                        <p className="text-xs text-muted-foreground">{envio.documento}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{envio.valor}</p>
                        <p className="text-xs text-muted-foreground">{envio.custo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${envio.statusCor} text-white`}>{envio.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${envio.rastreioCor} text-white`}>{envio.rastreio}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{envio.criado}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Rastrear</DropdownMenuItem>
                          <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
