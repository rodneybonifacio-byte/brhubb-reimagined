import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database, Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminSyncData() {
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [syncedClientes, setSyncedClientes] = useState<any[]>([]);
  const [syncedEmissoes, setSyncedEmissoes] = useState<any[]>([]);
  const [syncedUsuarios, setSyncedUsuarios] = useState<any[]>([]);

  useEffect(() => {
    loadSyncLogs();
    loadSyncedData();

    // Configurar realtime para sync_logs
    const logsChannel = supabase
      .channel('sync-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_logs'
        },
        (payload) => {
          console.log('Realtime sync_logs update:', payload);
          loadSyncLogs();
        }
      )
      .subscribe();

    // Configurar realtime para mysql_clientes
    const clientesChannel = supabase
      .channel('mysql-clientes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mysql_clientes'
        },
        (payload) => {
          console.log('Realtime mysql_clientes update:', payload);
          loadSyncedData();
        }
      )
      .subscribe();

    // Configurar realtime para mysql_emissoes
    const emissoesChannel = supabase
      .channel('mysql-emissoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mysql_emissoes'
        },
        (payload) => {
          console.log('Realtime mysql_emissoes update:', payload);
          loadSyncedData();
        }
      )
      .subscribe();

    // Configurar realtime para mysql_usuarios
    const usuariosChannel = supabase
      .channel('mysql-usuarios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mysql_usuarios'
        },
        (payload) => {
          console.log('Realtime mysql_usuarios update:', payload);
          loadSyncedData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(clientesChannel);
      supabase.removeChannel(emissoesChannel);
      supabase.removeChannel(usuariosChannel);
    };
  }, []);

  const loadSyncLogs = async () => {
    const { data, error } = await supabase
      .from('sync_logs' as any)
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading sync logs:', error);
      return;
    }

    setSyncLogs(data || []);
  };

  const loadSyncedData = async () => {
    // Carregar clientes
    const { data: clientes } = await supabase
      .from('mysql_clientes' as any)
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(50);
    setSyncedClientes(clientes || []);

    // Carregar emissões
    const { data: emissoes } = await supabase
      .from('mysql_emissoes' as any)
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(50);
    setSyncedEmissoes(emissoes || []);

    // Carregar usuários
    const { data: usuarios } = await supabase
      .from('mysql_usuarios' as any)
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(50);
    setSyncedUsuarios(usuarios || []);
  };

  const handleSync = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sync-mysql-data');

      if (error) {
        console.error('Erro ao sincronizar:', error);
        toast.error(`Erro: ${error.message}`);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        console.error('Detalhes:', data.details);
      } else {
        toast.success(data.message);
        console.log('Summary:', data.summary);
        
        // Recarregar dados
        await loadSyncLogs();
        await loadSyncedData();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { label: 'Completo', variant: 'default', icon: CheckCircle },
      completed_with_errors: { label: 'Com erros', variant: 'destructive', icon: XCircle },
      running: { label: 'Executando', variant: 'secondary', icon: Clock },
    };

    const config = variants[status] || variants.running;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sincronização de Dados MySQL</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a sincronização entre MySQL e Supabase
          </p>
        </div>
        <Button 
          onClick={handleSync}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Agora
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
          <TabsTrigger value="clientes">Clientes ({syncedClientes.length})</TabsTrigger>
          <TabsTrigger value="emissoes">Emissões ({syncedEmissoes.length})</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários ({syncedUsuarios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronizações</CardTitle>
              <CardDescription>
                Últimas 10 sincronizações executadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Processados</TableHead>
                    <TableHead>Sucesso</TableHead>
                    <TableHead>Falhas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="capitalize">{log.sync_type}</TableCell>
                      <TableCell>{log.table_name}</TableCell>
                      <TableCell>{log.records_processed}</TableCell>
                      <TableCell className="text-green-600">{log.records_success}</TableCell>
                      <TableCell className="text-red-600">{log.records_failed}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                  {syncLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhuma sincronização encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Sincronizados</CardTitle>
              <CardDescription>
                Últimos 50 clientes sincronizados do MySQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.cpf_cnpj}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.ativo ? "default" : "secondary"}>
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(cliente.synced_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {syncedClientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum cliente sincronizado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emissões Sincronizadas</CardTitle>
              <CardDescription>
                Últimas 50 emissões sincronizadas do MySQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Objeto</TableHead>
                    <TableHead>Transportadora</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Emissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedEmissoes.map((emissao) => (
                    <TableRow key={emissao.id}>
                      <TableCell className="font-mono text-sm">{emissao.codigo_objeto}</TableCell>
                      <TableCell>{emissao.transportadora}</TableCell>
                      <TableCell>{emissao.servico}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(emissao.valor_frete)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{emissao.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {emissao.data_emissao 
                          ? format(new Date(emissao.data_emissao), "dd/MM/yyyy", { locale: ptBR })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {syncedEmissoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma emissão sincronizada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Sincronizados</CardTitle>
              <CardDescription>
                Últimos 50 usuários sincronizados do MySQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.cpf}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{usuario.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.ativo ? "default" : "secondary"}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(usuario.synced_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {syncedUsuarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum usuário sincronizado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
