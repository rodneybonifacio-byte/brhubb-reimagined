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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, CreditCard } from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  created_at: string;
  role: string;
  credits: number;
}

export default function Configuracoes() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [criando, setCriando] = useState(false);
  const [defaultCredits, setDefaultCredits] = useState(100);
  
  // Form states
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<"admin" | "cliente">("cliente");
  const [creditosInicial, setCreditosInicial] = useState("100");

  useEffect(() => {
    carregarUsuarios();
    carregarCreditosPadrao();
  }, []);

  const carregarCreditosPadrao = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'default_credits')
        .single();

      if (data) {
        const value = data.setting_value as any;
        const credits = value.amount || 100;
        setDefaultCredits(credits);
        setCreditosInicial(credits.toString());
      }
    } catch (error) {
      console.error('Erro ao carregar créditos padrão:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários com roles e créditos
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');
      
      const { data: creditsData } = await supabase
        .from('client_credits')
        .select('client_id, client_name, credits');
      
      // Criar mapa de créditos por cliente
      const creditsMap = new Map(
        creditsData?.map(c => [c.client_id, { credits: c.credits, name: c.client_name }]) || []
      );
      
      // Montar lista de usuários
      const usuariosComDados: Usuario[] = [];
      
      for (const roleData of rolesData || []) {
        const creditInfo = creditsMap.get(roleData.user_id);
        
        usuariosComDados.push({
          id: roleData.user_id,
          email: creditInfo?.name || roleData.user_id.substring(0, 8),
          created_at: roleData.created_at,
          role: roleData.role,
          credits: creditInfo?.credits || 0,
        });
      }
      
      setUsuarios(usuariosComDados);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      toast.error('Preencha email e senha');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setCriando(true);

      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          email,
          password: senha,
          role: role,
          initialCredits: role === 'cliente' ? parseFloat(creditosInicial) : 0,
        },
      });

      if (error) throw error;

      toast.success(`Usuário criado com sucesso! ${role === 'cliente' ? `Créditos: R$ ${creditosInicial}` : ''}`);
      
      // Limpar formulário
      setEmail('');
      setSenha('');
      setRole('cliente');
      setCreditosInicial(defaultCredits.toString());
      
      // Recarregar lista
      setTimeout(carregarUsuarios, 1000);
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setCriando(false);
    }
  };

  const handleAtualizarCreditos = async (clientId: string, novosCreditos: string) => {
    try {
      const valor = parseFloat(novosCreditos);
      if (isNaN(valor)) {
        toast.error('Valor inválido');
        return;
      }

      const { error } = await supabase
        .from('client_credits')
        .update({ credits: valor })
        .eq('client_id', clientId);

      if (error) throw error;

      toast.success('Créditos atualizados!');
      carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao atualizar créditos:', error);
      toast.error('Erro ao atualizar créditos');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Crie novos usuários e gerencie seus créditos
        </p>
      </div>

      {/* Formulário de Criação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </CardTitle>
          <CardDescription>
            Adicione um novo usuário ao sistema com role e créditos iniciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCriarUsuario} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "cliente")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'cliente' && (
                <div className="space-y-2">
                  <Label htmlFor="creditos">Créditos Iniciais (R$)</Label>
                  <Input
                    id="creditos"
                    type="number"
                    step="0.01"
                    placeholder={defaultCredits.toString()}
                    value={creditosInicial}
                    onChange={(e) => setCreditosInicial(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar o padrão do sistema (R$ {defaultCredits.toFixed(2)})
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={criando} className="w-full md:w-auto">
              {criando ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Usuários Cadastrados
          </CardTitle>
          <CardDescription>
            Visualize e gerencie os créditos dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário cadastrado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Créditos (R$)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.email}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {usuario.id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={usuario.role === 'admin' ? 'text-orange-600 font-semibold' : ''}>
                          {usuario.role === 'admin' ? 'Admin' : 'Cliente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {usuario.role === 'cliente' ? (
                          <span className="font-semibold">
                            R$ {usuario.credits.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario.role === 'cliente' && (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={usuario.credits}
                            onBlur={(e) => handleAtualizarCreditos(usuario.id, e.target.value)}
                            className="w-32"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
