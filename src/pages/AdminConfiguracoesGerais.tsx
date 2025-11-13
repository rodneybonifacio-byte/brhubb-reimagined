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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, DollarSign, Percent, Users, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_at: string;
}

export default function AdminConfiguracoesGerais() {
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Configurações
  const [creditosPadrao, setCreditosPadrao] = useState("100");
  const [porcentagemMarkup, setPorcentagemMarkup] = useState("15");
  const [avisoCreditos, setAvisoCreditos] = useState("50");
  const [autoAprovar, setAutoAprovar] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Mapear as configurações
      data?.forEach((setting: SystemSetting) => {
        switch (setting.setting_key) {
          case 'default_credits':
            setCreditosPadrao(setting.setting_value.amount.toString());
            break;
          case 'default_markup_percentage':
            setPorcentagemMarkup(setting.setting_value.percentage.toString());
            break;
          case 'min_credits_warning':
            setAvisoCreditos(setting.setting_value.amount.toString());
            break;
          case 'new_user_auto_approve':
            setAutoAprovar(setting.setting_value.enabled);
            break;
        }
      });
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracao = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  };

  const handleSalvarTodasConfiguracoes = async () => {
    try {
      setSalvando(true);

      await Promise.all([
        salvarConfiguracao('default_credits', { amount: parseFloat(creditosPadrao) }),
        salvarConfiguracao('default_markup_percentage', { percentage: parseFloat(porcentagemMarkup) }),
        salvarConfiguracao('min_credits_warning', { amount: parseFloat(avisoCreditos) }),
        salvarConfiguracao('new_user_auto_approve', { enabled: autoAprovar }),
      ]);

      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todas as regras e configurações administrativas
        </p>
      </div>

      <Tabs defaultValue="novos-usuarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="novos-usuarios">
            <Users className="h-4 w-4 mr-2" />
            Novos Usuários
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="markup">
            <Percent className="h-4 w-4 mr-2" />
            Markup
          </TabsTrigger>
        </TabsList>

        {/* Tab: Novos Usuários */}
        <TabsContent value="novos-usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações para Novos Usuários
              </CardTitle>
              <CardDescription>
                Defina os valores padrão aplicados quando um novo cliente é criado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="creditos-padrao">
                  Créditos Iniciais (R$)
                </Label>
                <Input
                  id="creditos-padrao"
                  type="number"
                  step="0.01"
                  value={creditosPadrao}
                  onChange={(e) => setCreditosPadrao(e.target.value)}
                  placeholder="100.00"
                />
                <p className="text-sm text-muted-foreground">
                  Valor de créditos que todo novo cliente receberá automaticamente
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-aprovar">Auto-aprovar novos usuários</Label>
                  <p className="text-sm text-muted-foreground">
                    Novos usuários são automaticamente aprovados no sistema
                  </p>
                </div>
                <Switch
                  id="auto-aprovar"
                  checked={autoAprovar}
                  onCheckedChange={setAutoAprovar}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configurações Financeiras
              </CardTitle>
              <CardDescription>
                Configure os parâmetros de créditos e avisos financeiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aviso-creditos">
                  Aviso de Créditos Baixos (R$)
                </Label>
                <Input
                  id="aviso-creditos"
                  type="number"
                  step="0.01"
                  value={avisoCreditos}
                  onChange={(e) => setAvisoCreditos(e.target.value)}
                  placeholder="50.00"
                />
                <p className="text-sm text-muted-foreground">
                  Exibir aviso quando o saldo do cliente estiver abaixo deste valor
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Informações</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Créditos são consumidos ao criar etiquetas</li>
                  <li>• Clientes sem crédito não podem criar novas etiquetas</li>
                  <li>• Admins podem adicionar/remover créditos na tela de Gestão de Créditos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Markup */}
        <TabsContent value="markup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configurações de Markup
              </CardTitle>
              <CardDescription>
                Defina a porcentagem de lucro sobre os fretes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="markup-padrao">
                  Porcentagem de Markup Padrão (%)
                </Label>
                <Input
                  id="markup-padrao"
                  type="number"
                  step="0.01"
                  value={porcentagemMarkup}
                  onChange={(e) => setPorcentagemMarkup(e.target.value)}
                  placeholder="15.00"
                />
                <p className="text-sm text-muted-foreground">
                  Porcentagem aplicada sobre o valor do frete das transportadoras
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Exemplo de Cálculo
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>Valor do frete: R$ 100,00</p>
                  <p>Markup de {porcentagemMarkup}%: R$ {(parseFloat(porcentagemMarkup || "0") * 100 / 100).toFixed(2)}</p>
                  <p className="font-semibold pt-2 border-t border-blue-200 dark:border-blue-800">
                    Valor final: R$ {(100 + (parseFloat(porcentagemMarkup || "0") * 100 / 100)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Observações</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Esta porcentagem é aplicada em todas as cotações de frete</li>
                  <li>• Você pode ajustar manualmente o custo de etiquetas específicas na tela de Ajustes de Custo</li>
                  <li>• O markup define sua margem de lucro sobre cada envio</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de Salvar Fixo */}
      <div className="sticky bottom-6 flex justify-end">
        <Button 
          size="lg"
          onClick={handleSalvarTodasConfiguracoes}
          disabled={salvando}
          className="shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {salvando ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>
      </div>
    </div>
  );
}
