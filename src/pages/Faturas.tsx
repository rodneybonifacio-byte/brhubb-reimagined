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
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const faturas = [
  {
    cliente: "PREMIUMVESTI",
    id: "78.402.515/0001-05",
    idCompleto: "Id: f95977ad-e803-4183-a6b8-71e9ffa5484",
    totalFatura: "R$ 6.263,75",
    custo: "R$ 5.296,00",
    lucro: "R$ 967,75",
    vencimento: "11/11/2025",
    status: "Venceu ontem",
    statusBadge: "PENDENTE",
    criado: "10/11/2025",
  },
];

export default function Faturas() {
  const [activeTab, setActiveTab] = useState("pendentes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faturas a Receber</h1>
        <p className="text-muted-foreground">Gerencie as faturas a receber dos seus clientes.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "pendentes" ? "default" : "outline"}
              onClick={() => setActiveTab("pendentes")}
            >
              Pendentes
            </Button>
            <Button
              variant={activeTab === "finalizados" ? "default" : "outline"}
              onClick={() => setActiveTab("finalizados")}
            >
              Finalizados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total Fatura R$</TableHead>
                  <TableHead>Data Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.map((fatura, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fatura.cliente}</p>
                        <p className="text-xs text-muted-foreground">{fatura.id}</p>
                        <p className="text-xs text-muted-foreground">{fatura.idCompleto}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-lg">{fatura.totalFatura}</p>
                        <p className="text-xs text-red-500">Custo: {fatura.custo}</p>
                        <p className="text-xs text-green-600">Lucro: {fatura.lucro}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fatura.vencimento}</p>
                        <p className="text-xs text-red-500">{fatura.status}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500 text-white">{fatura.statusBadge}</Badge>
                    </TableCell>
                    <TableCell>{fatura.criado}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Baixar PDF</DropdownMenuItem>
                          <DropdownMenuItem>Enviar por Email</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Página 1 de 1 | de 1 registros</span>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
