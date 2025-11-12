import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusTabs = [
  { label: "Todas", value: "todas", count: 0 },
  { label: "Pré-postadas", value: "pre-postados", count: 0 },
  { label: "Postadas", value: "postados", count: 0 },
  { label: "Em trânsito", value: "em-transito", count: 0 },
  { label: "Entregues", value: "entregues", count: 0 },
];

export default function PrePostagem() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("todas");

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Etiquetas</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas etiquetas de envio</p>
        </div>
        <Button
          onClick={() => navigate("/envios/nova")}
          size="lg"
          className="h-11 rounded-full font-medium shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova etiqueta
        </Button>
      </div>

      {/* Tabs */}
      <Card className="border-none shadow-sm">
        <div className="flex gap-2 overflow-x-auto p-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-full font-medium",
                activeTab === tab.value && "shadow-sm"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Empty State */}
      <Card className="border-none shadow-sm">
        <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Package2 className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Nenhuma etiqueta ainda</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Crie sua primeira etiqueta de envio para começar a gerenciar suas remessas
          </p>
          <Button
            onClick={() => navigate("/envios/nova")}
            size="lg"
            className="h-11 rounded-full font-medium shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar primeira etiqueta
          </Button>
        </div>
      </Card>
    </div>
  );
}
