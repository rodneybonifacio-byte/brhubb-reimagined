import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit, Loader2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { emissoes } from "@/lib/api";

interface CostAdjustment {
  id: string;
  emission_id: string;
  original_cost: number;
  adjusted_cost: number;
  sale_price: number;
  reason: string | null;
  created_at: string;
}

interface EmissionData {
  id: string;
  codigoObjeto?: string;
  servico?: string;
  valor: number;
  status?: string;
}

export default function AdminCostAdjustments() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [adjustments, setAdjustments] = useState<CostAdjustment[]>([]);
  const [emissions, setEmissions] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmission, setSelectedEmission] = useState<string>("");
  
  // Form states
  const [originalCost, setOriginalCost] = useState("");
  const [adjustedCost, setAdjustedCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
      return;
    }
    
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar ajustes
      const { data: adjustmentsData, error: adjustmentsError } = await supabase
        .from('shipping_cost_adjustments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (adjustmentsError) throw adjustmentsError;
      setAdjustments(adjustmentsData || []);

      // Carregar emissões recentes da API externa
      const emissoesData = await emissoes.listar({ page: 1, limit: 50 });
      const mappedEmissions = (emissoesData.data || []).map(e => ({
        id: e.id,
        codigoObjeto: e.codigoObjeto,
        servico: e.servico,
        valor: typeof e.valor === 'string' ? parseFloat(e.valor) : e.valor,
        status: e.status
      }));
      setEmissions(mappedEmissions);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmission || !originalCost || !adjustedCost || !salePrice) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const originalValue = parseFloat(originalCost);
    const adjustedValue = parseFloat(adjustedCost);
    const saleValue = parseFloat(salePrice);

    if (isNaN(originalValue) || isNaN(adjustedValue) || isNaN(saleValue)) {
      toast.error("Valores inválidos");
      return;
    }

    try {
      setProcessing(true);
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error } = await supabase
        .from('shipping_cost_adjustments')
        .upsert({
          emission_id: selectedEmission,
          original_cost: originalValue,
          adjusted_cost: adjustedValue,
          sale_price: saleValue,
          reason: reason || null,
          adjusted_by: userId
        }, {
          onConflict: 'emission_id'
        });
      
      if (error) throw error;
      
      toast.success("Ajuste salvo com sucesso!");
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao salvar ajuste: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedEmission("");
    setOriginalCost("");
    setAdjustedCost("");
    setSalePrice("");
    setReason("");
  };

  const loadEmissionData = async (emissionId: string) => {
    try {
      const emission = emissions.find(e => e.id === emissionId);
      if (emission) {
        setOriginalCost(emission.valor.toString());
        setAdjustedCost(emission.valor.toString());
        setSalePrice(emission.valor.toString());
      }
    } catch (error) {
      console.error("Erro ao carregar dados da emissão:", error);
    }
  };

  const getMarginBadge = (adjustment: CostAdjustment) => {
    const margin = ((adjustment.sale_price - adjustment.adjusted_cost) / adjustment.sale_price) * 100;
    const isPositive = margin > 0;
    
    return (
      <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {margin.toFixed(1)}% margem
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ajustes de Custos</h1>
          <p className="text-muted-foreground">Gerencie custos e preços de venda das etiquetas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="mr-2 h-4 w-4" />
                Novo Ajuste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajustar Custos e Preços</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emission">Etiqueta</Label>
                  <select
                    id="emission"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedEmission}
                    onChange={(e) => {
                      setSelectedEmission(e.target.value);
                      if (e.target.value) loadEmissionData(e.target.value);
                    }}
                  >
                    <option value="">Selecione uma etiqueta...</option>
                    {emissions.map((emission) => (
                      <option key={emission.id} value={emission.id}>
                        {emission.codigoObjeto || emission.id} - {emission.servico || 'N/A'} - R$ {emission.valor.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="original-cost">Custo Original (R$)</Label>
                    <Input
                      id="original-cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={originalCost}
                      onChange={(e) => setOriginalCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Custo real da transportadora
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="adjusted-cost">Custo Ajustado (R$)</Label>
                    <Input
                      id="adjusted-cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={adjustedCost}
                      onChange={(e) => setAdjustedCost(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Custo após ajustes
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sale-price">Preço de Venda (R$)</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Preço cobrado do cliente
                    </p>
                  </div>
                </div>

                {originalCost && adjustedCost && salePrice && (
                  <Card className="bg-muted">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Margem Bruta:</span>
                        <span className="font-bold">
                          R$ {(parseFloat(salePrice) - parseFloat(adjustedCost)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">% Margem:</span>
                        <span className="font-bold">
                          {(((parseFloat(salePrice) - parseFloat(adjustedCost)) / parseFloat(salePrice)) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="reason">Motivo do Ajuste</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explique o motivo do ajuste de valores..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Ajuste
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajustes Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : adjustments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum ajuste registrado
            </p>
          ) : (
            <div className="space-y-4">
              {adjustments.map((adjustment) => (
                <div
                  key={adjustment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium">
                        {adjustment.emission_id}
                      </span>
                      {getMarginBadge(adjustment)}
                    </div>
                    
                    <div className="grid gap-2 text-sm md:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Custo Original</p>
                        <p className="font-medium">R$ {parseFloat(adjustment.original_cost.toString()).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo Ajustado</p>
                        <p className="font-medium">R$ {parseFloat(adjustment.adjusted_cost.toString()).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço de Venda</p>
                        <p className="font-medium text-primary">R$ {parseFloat(adjustment.sale_price.toString()).toFixed(2)}</p>
                      </div>
                    </div>

                    {adjustment.reason && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {adjustment.reason}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(adjustment.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedEmission(adjustment.emission_id);
                      setOriginalCost(adjustment.original_cost.toString());
                      setAdjustedCost(adjustment.adjusted_cost.toString());
                      setSalePrice(adjustment.sale_price.toString());
                      setReason(adjustment.reason || "");
                      setShowModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
