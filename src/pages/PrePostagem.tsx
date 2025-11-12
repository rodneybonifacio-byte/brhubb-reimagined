import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Package2, Search, Filter, Download, MoreVertical } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Etiquetas de envio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie e acompanhe todas as suas etiquetas
            </p>
          </div>
          <Button
            onClick={() => navigate("/envios/nova")}
            size="lg"
            className="h-12 rounded-full px-6 font-medium shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova etiqueta
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-none shadow-sm">
          <div className="flex flex-col gap-3 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, destinatário ou CEP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-full pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="h-11 rounded-full">
                <Filter className="mr-2 h-5 w-5" />
                Filtros
              </Button>
              <Button variant="outline" size="lg" className="h-11 rounded-full">
                <Download className="mr-2 h-5 w-5" />
                Exportar
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              size="lg"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-11 whitespace-nowrap rounded-full px-6 font-medium transition-all",
                activeTab === tab.value && "shadow-md"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 rounded-full bg-background/80 text-foreground"
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <Card className="border-none shadow-sm">
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
            <Package2 className="h-16 w-16 text-primary" />
          </div>
          <h3 className="mb-2 text-2xl font-semibold">Nenhuma etiqueta encontrada</h3>
          <p className="mb-8 max-w-md text-muted-foreground">
            {activeTab === "todas" 
              ? "Comece criando sua primeira etiqueta de envio"
              : `Não há etiquetas com status "${statusTabs.find(t => t.value === activeTab)?.label}"`
            }
          </p>
          <Button
            onClick={() => navigate("/envios/nova")}
            size="lg"
            className="h-12 rounded-full px-8 font-medium shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar nova etiqueta
          </Button>
        </div>
      </Card>
    </div>
  );
}
