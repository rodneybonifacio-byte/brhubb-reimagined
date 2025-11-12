import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, CheckCircle, Truck, DollarSign } from "lucide-react";

const metrics = [
  {
    title: "Total de Envios",
    value: "0",
    icon: Package,
    color: "bg-metric-red",
  },
  {
    title: "Pré-postados",
    value: "0",
    icon: Tag,
    color: "bg-metric-blue",
  },
  {
    title: "Entregues",
    value: "0",
    icon: CheckCircle,
    color: "bg-metric-green",
  },
  {
    title: "Em Trânsito",
    value: "0",
    icon: Truck,
    color: "bg-metric-yellow",
  },
  {
    title: "Custo Total",
    value: "0",
    icon: DollarSign,
    color: "bg-metric-purple",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus envios e estatísticas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`rounded-lg p-2 ${metric.color} text-white`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimos Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Nenhum envio encontrado
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status dos Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
