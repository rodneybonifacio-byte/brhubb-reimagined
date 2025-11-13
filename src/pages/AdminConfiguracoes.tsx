import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, DollarSign, Percent, Users, Save } from "lucide-react";

interface SystemSettings {
  default_credits: number;
  default_markup_percentage: number;
  min_credits_warning: number;
}

export default function AdminConfiguracoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    default_credits: 100,
    default_markup_percentage: 15,
    min_credits_warning: 50,
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', ['default_credits', 'default_markup_percentage', 'min_credits_warning']);

      if (error) throw error;

      if (data && data.length > 0) {
        const newSettings = { ...settings };
        data.forEach((setting) => {
          const value = setting.setting_value as any;
          if (setting.setting_key === 'default_credits') {
            newSettings.default_credits = value.amount;
          } else if (setting.setting_key === 'default_markup_percentage') {
            newSettings.default_markup_percentage = value.percentage;
          } else if (setting.setting_key === 'min_credits_warning') {
            newSettings.min_credits_warning = value.amount;
          }
        });
        setSettings(newSettings);
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracao = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast.success('Configuração salva com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDefaultCredits = async () => {
    await salvarConfiguracao('default_credits', { amount: settings.default_credits });
  };

  const handleSaveMarkupPercentage = async () => {
    await salvarConfiguracao('default_markup_percentage', { 
      percentage: settings.default_markup_percentage 
    });
  };

  const handleSaveMinCreditsWarning = async () => {
    await salvarConfiguracao('min_credits_warning', { 
      amount: settings.min_credits_warning 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todas as regras e configurações globais do sistema
        </p>
      </div>

      <Tabs defaultValue="creditos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="creditos">
            <DollarSign className="h-4 w-4 mr-2" />
            Créditos
          </TabsTrigger>
          <TabsTrigger value="markup">
            <Percent className="h-4 w-4 mr-2" />
            Markup & Preços
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Novos Usuários
          </TabsTrigger>
        </TabsList>

        {/* Aba de Créditos */}
        <TabsContent value="creditos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créditos Padrão para Novos Clientes</CardTitle>
              <CardDescription>
                Define o valor de créditos que novos clientes receberão ao serem criados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-credits">Valor de Créditos Inicial (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    id="default-credits"
                    type="number"
                    step="0.01"
                    value={settings.default_credits}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      default_credits: parseFloat(e.target.value) || 0 
                    })}
                    className="max-w-xs"
                  />
                  <Button 
                    onClick={handleSaveDefaultCredits}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Novos clientes criados receberão automaticamente R$ {settings.default_credits.toFixed(2)} em créditos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aviso de Créditos Baixos</CardTitle>
              <CardDescription>
                Define quando exibir avisos de saldo baixo para os clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-credits">Valor Mínimo de Créditos (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    id="min-credits"
                    type="number"
                    step="0.01"
                    value={settings.min_credits_warning}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      min_credits_warning: parseFloat(e.target.value) || 0 
                    })}
                    className="max-w-xs"
                  />
                  <Button 
                    onClick={handleSaveMinCreditsWarning}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clientes com saldo abaixo de R$ {settings.min_credits_warning.toFixed(2)} verão um aviso
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Markup */}
        <TabsContent value="markup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Porcentagem de Markup Padrão</CardTitle>
              <CardDescription>
                Define a porcentagem de acréscimo aplicada sobre o valor do frete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="markup-percentage">Porcentagem de Markup (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="markup-percentage"
                    type="number"
                    step="0.01"
                    value={settings.default_markup_percentage}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      default_markup_percentage: parseFloat(e.target.value) || 0 
                    })}
                    className="max-w-xs"
                  />
                  <Button 
                    onClick={handleSaveMarkupPercentage}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Um frete de R$ 100,00 será vendido por R$ {(100 * (1 + settings.default_markup_percentage / 100)).toFixed(2)}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Como funciona o markup?</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>O valor do frete é obtido da transportadora (custo base)</li>
                  <li>A porcentagem de markup é aplicada sobre este valor</li>
                  <li>O valor final é o preço cobrado do cliente</li>
                  <li>A diferença entre o valor final e o custo base é sua margem</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Novos Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo das Configurações para Novos Usuários</CardTitle>
              <CardDescription>
                Veja todas as configurações que serão aplicadas quando novos usuários forem criados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Créditos Iniciais</h4>
                  </div>
                  <p className="text-2xl font-bold">R$ {settings.default_credits.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Saldo inicial ao criar conta
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Markup Padrão</h4>
                  </div>
                  <p className="text-2xl font-bold">{settings.default_markup_percentage}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Acréscimo sobre o frete
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2">Exemplo de Cálculo</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Custo do frete (transportadora):</span>
                    <span className="font-semibold">R$ 50,00</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Markup aplicado ({settings.default_markup_percentage}%):</span>
                    <span className="font-semibold text-primary">+ R$ {(50 * settings.default_markup_percentage / 100).toFixed(2)}</span>
                  </p>
                  <div className="border-t pt-1 mt-1">
                    <p className="flex justify-between text-base">
                      <span className="font-semibold">Preço final para o cliente:</span>
                      <span className="font-bold text-lg">R$ {(50 * (1 + settings.default_markup_percentage / 100)).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
