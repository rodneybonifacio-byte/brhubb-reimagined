import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Filter, Package, Tag, CheckCircle, Truck, Wallet, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusTabs = [
  { label: "PRE POSTADOS", value: "pre-postados", active: true },
  { label: "POSTADOS", value: "postados", active: false },
  { label: "COLETADOS", value: "coletados", active: false },
  { label: "EM TRANSITO", value: "em-transito", active: false },
  { label: "ENTREGUES", value: "entregues", active: false },
  { label: "CANCELADOS", value: "cancelados", active: false },
];

const metrics = [
  { title: "Total de Envios", value: "0", icon: Package, color: "bg-metric-red" },
  { title: "Pré-postados", value: "0", icon: Tag, color: "bg-metric-blue" },
  { title: "Entregues", value: "0", icon: CheckCircle, color: "bg-metric-green" },
  { title: "Em Trânsito", value: "0", icon: Truck, color: "bg-metric-yellow" },
  { title: "Custo Total", value: "0", icon: Wallet, color: "bg-metric-purple" },
];

export default function PrePostagem() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pre-postados");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etiquetas de envio</h1>
          <p className="text-muted-foreground">Lista de etiquetas cadastradas no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/envios/nova")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
          <Button variant="secondary">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
          </Button>
        </div>
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
              <div className="text-2xl font-bold">{metric.value}</div>
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
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-primary">
              <XCircle className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Ops! Nenhum dado encontrado</h3>
              <p className="text-muted-foreground">
                Nenhum dado corresponde aos critérios selecionados.
              </p>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou verificar novamente.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-2 font-medium">Sugestões:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Verifique os filtros aplicados</li>
                <li>• Tente termos de busca diferentes</li>
                <li>• Limpe todos os filtros e tente novamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
