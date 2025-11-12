import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, TrendingUp, Plus, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickStats = [
  { label: "Total de envios", value: "0", icon: Package, color: "text-blue-600" },
  { label: "Em trânsito", value: "0", icon: Truck, color: "text-yellow-600" },
  { label: "Entregues", value: "0", icon: CheckCircle, color: "text-green-600" },
  { label: "Pendentes", value: "0", icon: Clock, color: "text-orange-600" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-sm text-muted-foreground">
          Aqui está um resumo das suas atividades
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Ações rápidas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => navigate("/envios/nova")}
            >
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Nova etiqueta</p>
                <p className="text-xs text-muted-foreground">Criar novo envio</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => navigate("/simulador-frete")}
            >
              <Calculator className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Simulação de Frete</p>
                <p className="text-xs text-muted-foreground">Calcular valores</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => navigate("/acompanhamento/envios")}
            >
              <Truck className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Rastrear</p>
                <p className="text-xs text-muted-foreground">Acompanhar envios</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => navigate("/financeiro/faturas")}
            >
              <TrendingUp className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Financeiro</p>
                <p className="text-xs text-muted-foreground">Ver faturas</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card className="border-none shadow-sm">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Nenhuma atividade recente</h3>
          <p className="mb-6 text-muted-foreground">
            Comece criando sua primeira etiqueta de envio
          </p>
          <Button
            onClick={() => navigate("/envios/nova")}
            className="h-11 rounded-full font-medium shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar etiqueta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
