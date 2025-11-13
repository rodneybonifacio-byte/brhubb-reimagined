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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Settings, Percent, Truck, Save, Plus, LogIn } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";

const clientSettingSchema = z.object({
  markup_percentage: z.number()
    .min(0, "Markup não pode ser negativo")
    .max(1000, "Markup deve ser no máximo 1000%"),
  enabled_carriers: z.array(z.string())
    .min(1, "Selecione pelo menos uma transportadora")
});

interface ClientSetting {
  id: string;
  client_id: string;
  client_name: string;
  enabled_carriers: string[];
  markup_percentage: number;
  updated_at: string;
}

const AVAILABLE_CARRIERS = [
  { id: "CORREIOS", name: "Correios" },
  { id: "RODONAVES", name: "Rodonaves" },
];

export default function AdminGestaoClientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ClientSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientSetting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Form states
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(["CORREIOS", "RODONAVES"]);
  const [markupValue, setMarkupValue] = useState("15.00");

  useEffect(() => {
    carregarClientes();
    carregarUsuariosDisponiveis();
  }, []);

  const carregarUsuariosDisponiveis = async () => {
    try {
      // Buscar todos os usuários com role cliente
      const { data: usuarios, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'cliente');

      if (error) throw error;

      // Buscar nomes dos clientes
      const { data: credits } = await supabase
        .from('client_credits')
        .select('client_id, client_name');

      // Combinar dados
      const usuariosComNome = (usuarios || []).map(u => {
        const creditInfo = credits?.find(c => c.client_id === u.user_id);
        return {
          id: u.user_id,
          name: creditInfo?.client_name || u.user_id.substring(0, 8),
        };
      });

      setUsuariosDisponiveis(usuariosComNome);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarClientes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_settings')
        .select('*')
        .order('client_name', { ascending: true });

      if (error) throw error;

      // Fazer cast dos dados para o tipo correto
      const clientesFormatados = (data || []).map(item => ({
        ...item,
        enabled_carriers: item.enabled_carriers as unknown as string[]
      }));

      setClientes(clientesFormatados);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar configurações dos clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCliente = (cliente: ClientSetting) => {
    setEditingClient(cliente);
    setSelectedCarriers(cliente.enabled_carriers);
    setMarkupValue(cliente.markup_percentage.toString());
    setDialogOpen(true);
  };

  const handleSalvarConfiguracoes = async () => {
    if (!editingClient) return;

    // Validação com Zod
    const validation = clientSettingSchema.safeParse({
      markup_percentage: parseFloat(markupValue),
      enabled_carriers: selectedCarriers
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
      return;
    }

    const markup = parseFloat(markupValue);

    try {
      const { error } = await supabase
        .from('client_settings')
        .update({
          enabled_carriers: selectedCarriers,
          markup_percentage: markup,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      toast.success('Configurações atualizadas com sucesso!');
      setDialogOpen(false);
      setEditingClient(null);
      carregarClientes();
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleToggleCarrier = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId)
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    );
  };

  const handleAbrirAdicionarCliente = () => {
    setSelectedUserId("");
    setSelectedCarriers(["CORREIOS", "RODONAVES"]);
    setMarkupValue("15.00");
    setAddDialogOpen(true);
  };

  const handleAdicionarCliente = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (selectedCarriers.length === 0) {
      toast.error('Selecione pelo menos uma transportadora');
      return;
    }

    const markup = parseFloat(markupValue);
    if (isNaN(markup) || markup < 0) {
      toast.error('Porcentagem de markup inválida');
      return;
    }

    try {
      const usuario = usuariosDisponiveis.find(u => u.id === selectedUserId);
      
      const { error } = await supabase
        .from('client_settings')
        .insert({
          client_id: selectedUserId,
          client_name: usuario?.name || selectedUserId,
          enabled_carriers: selectedCarriers,
          markup_percentage: markup,
        });

      if (error) throw error;

      toast.success('Cliente adicionado com sucesso!');
      setAddDialogOpen(false);
      carregarClientes();
      carregarUsuariosDisponiveis();
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente');
    }
  };

  const handleLoginAsClient = async (cliente: ClientSetting) => {
    try {
      // Buscar credenciais do cliente na tabela client_credits
      const { data: clientData, error: clientError } = await supabase
        .from('client_credits')
        .select('client_name')
        .eq('client_id', cliente.client_id)
        .single();

      if (clientError) {
        toast.error("Cliente não encontrado");
        return;
      }

      toast.warning("Funcionalidade de impersonation desabilitada por segurança", {
        description: "Cada usuário só pode acessar suas próprias etiquetas. A API externa valida isso através do token de autenticação.",
        duration: 8000,
      });

      // Comentado por segurança - não podemos impersonar sem ter as credenciais reais do cliente
      // A API externa filtra etiquetas pelo token, então impersonation sem token real do cliente
      // permitiria admin ver suas próprias etiquetas, não as do cliente
      
      /*
      // Salvar dados do admin atual antes de impersonar
      const currentToken = auth.getToken();
      const currentUserData = auth.getUserData();
      
      if (currentToken && currentUserData) {
        localStorage.setItem('admin_impersonation_token', currentToken);
        localStorage.setItem('admin_impersonation_user', JSON.stringify(currentUserData));
        localStorage.setItem('is_impersonating', 'true');
        localStorage.setItem('impersonated_client_id', cliente.client_id);
        localStorage.setItem('impersonated_client_name', clientData.client_name);
      }

      toast.success(`Logado como ${clientData.client_name}`, {
        description: "Você está visualizando o sistema como este cliente",
        duration: 5000,
      });

      // Recarregar a página para atualizar o contexto
      navigate('/');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      */
    } catch (error) {
      console.error("Erro ao logar como cliente:", error);
      toast.error("Erro ao fazer login como cliente");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Configure transportadoras disponíveis e porcentagem de markup por cliente
          </p>
        </div>
        <Button onClick={handleAbrirAdicionarCliente}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações dos Clientes
          </CardTitle>
          <CardDescription>
            Defina quais transportadoras cada cliente pode usar e a porcentagem de lucro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente cadastrado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Transportadoras Habilitadas</TableHead>
                    <TableHead>Markup (%)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cliente.client_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {cliente.client_id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {cliente.enabled_carriers.map((carrier) => (
                            <span 
                              key={carrier}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                            >
                              <Truck className="h-3 w-3" />
                              {carrier}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          {cliente.markup_percentage.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditarCliente(cliente)}
                            variant="outline"
                            size="sm"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                          <Button
                            onClick={() => handleLoginAsClient(cliente)}
                            variant="secondary"
                            size="sm"
                            disabled
                            title="Funcionalidade desabilitada por segurança - cada usuário só vê suas próprias etiquetas"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Logar como
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Cliente</DialogTitle>
            <DialogDescription>
              {editingClient?.client_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Transportadoras */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Transportadoras Habilitadas
              </Label>
              <p className="text-sm text-muted-foreground">
                Selecione quais transportadoras este cliente pode usar
              </p>
              
              <div className="space-y-2">
                {AVAILABLE_CARRIERS.map((carrier) => (
                  <div key={carrier.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={carrier.id}
                      checked={selectedCarriers.includes(carrier.id)}
                      onCheckedChange={() => handleToggleCarrier(carrier.id)}
                    />
                    <label
                      htmlFor={carrier.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {carrier.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Markup */}
            <div className="space-y-2">
              <Label htmlFor="markup" className="text-base font-semibold">
                Porcentagem de Markup (%)
              </Label>
              <p className="text-sm text-muted-foreground">
                Porcentagem de lucro aplicada sobre o valor do frete
              </p>
              <Input
                id="markup"
                type="number"
                step="0.01"
                min="0"
                value={markupValue}
                onChange={(e) => setMarkupValue(e.target.value)}
                placeholder="15.00"
              />
              
              {/* Preview do cálculo */}
              <div className="bg-muted p-3 rounded-lg mt-3">
                <p className="text-xs font-semibold mb-1">Exemplo de Cálculo:</p>
                <p className="text-xs text-muted-foreground">
                  Frete: R$ 100,00 + {markupValue}% = R$ {(100 + (100 * parseFloat(markupValue || "0") / 100)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarConfiguracoes}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Adicionar Cliente */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Selecione um cliente e configure suas permissões
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente" className="text-base font-semibold">
                Selecionar Cliente
              </Label>
              <select
                id="cliente"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Selecione um cliente...</option>
                {usuariosDisponiveis
                  .filter(u => !clientes.some(c => c.client_id === u.id))
                  .map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Transportadoras */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Transportadoras Habilitadas
              </Label>
              <p className="text-sm text-muted-foreground">
                Selecione quais transportadoras este cliente pode usar
              </p>
              
              <div className="space-y-2">
                {AVAILABLE_CARRIERS.map((carrier) => (
                  <div key={carrier.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`add-${carrier.id}`}
                      checked={selectedCarriers.includes(carrier.id)}
                      onCheckedChange={() => handleToggleCarrier(carrier.id)}
                    />
                    <label
                      htmlFor={`add-${carrier.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {carrier.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Markup */}
            <div className="space-y-2">
              <Label htmlFor="add-markup" className="text-base font-semibold">
                Porcentagem de Markup (%)
              </Label>
              <p className="text-sm text-muted-foreground">
                Porcentagem de lucro aplicada sobre o valor do frete
              </p>
              <Input
                id="add-markup"
                type="number"
                step="0.01"
                min="0"
                value={markupValue}
                onChange={(e) => setMarkupValue(e.target.value)}
                placeholder="15.00"
              />
              
              {/* Preview do cálculo */}
              <div className="bg-muted p-3 rounded-lg mt-3">
                <p className="text-xs font-semibold mb-1">Exemplo de Cálculo:</p>
                <p className="text-xs text-muted-foreground">
                  Frete: R$ 100,00 + {markupValue}% = R$ {(100 + (100 * parseFloat(markupValue || "0") / 100)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionarCliente}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
