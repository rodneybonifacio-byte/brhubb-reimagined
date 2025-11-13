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
  const [tableStats, setTableStats] = useState<any[]>([]);
  const [allMysqlTables, setAllMysqlTables] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [syncingTable, setSyncingTable] = useState<string | null>(null);

  useEffect(() => {
    loadSyncLogs();
    loadSyncedData();
    loadTableStats();
    loadAllMysqlTables();

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

  const loadTableStats = async () => {
    // Tabelas conhecidas do sistema
    const tables = ['Cliente', 'Emissao', 'Usuarios'];
    const stats = [];

    for (const tableName of tables) {
      let status = 'pending';
      let recordCount = 0;
      let lastSync = null;
      let errors = null;

      // Buscar última sincronização desta tabela nos logs
      const { data: logs, error: logsError } = await supabase
        .from('sync_logs' as any)
        .select('*')
        .eq('table_name', tableName)
        .order('started_at', { ascending: false })
        .limit(1);

      if (!logsError && logs && logs.length > 0) {
        const log = logs[0] as any;
        status = log.status || 'pending';
        lastSync = log.completed_at || log.started_at || null;
        if (log.error_details) {
          errors = log.error_details;
        }
      }

      // Buscar contagem de registros sincronizados
      let supabaseTable = '';
      if (tableName === 'Cliente') {
        supabaseTable = 'mysql_clientes';
      } else if (tableName === 'Emissao') {
        supabaseTable = 'mysql_emissoes';
      } else if (tableName === 'Usuarios') {
        supabaseTable = 'mysql_usuarios';
      }

      if (supabaseTable) {
        const { count } = await supabase
          .from(supabaseTable as any)
          .select('*', { count: 'exact', head: true });
        recordCount = count || 0;
      }

      stats.push({
        name: tableName,
        supabaseTable,
        status,
        recordCount,
        lastSync,
        errors
      });
    }

    setTableStats(stats);
  };

  const loadAllMysqlTables = async () => {
    setLoadingTables(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-mysql-data', {
        body: { action: 'list-tables' }
      });

      if (error) {
        console.error('Erro ao listar tabelas:', error);
        toast.error('Erro ao listar tabelas do MySQL');
        return;
      }

      if (data.success) {
        setAllMysqlTables(data.tables || []);
        console.log('Tabelas MySQL encontradas:', data.tables);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSync = async (tableName?: string) => {
    setLoading(true);
    if (tableName) {
      setSyncingTable(tableName);
    }

    try {
      const { data, error } = await supabase.functions.invoke('sync-mysql-data', {
        body: tableName ? { tableName } : {}
      });

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
        await loadTableStats();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setLoading(false);
      setSyncingTable(null);
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
          onClick={() => handleSync()}
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
              Sincronizar Tudo
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="todas-tabelas" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todas-tabelas">Todas Tabelas MySQL</TabsTrigger>
          <TabsTrigger value="tabelas">Status Sincronizadas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="clientes">Clientes ({syncedClientes.length})</TabsTrigger>
          <TabsTrigger value="emissoes">Emissões ({syncedEmissoes.length})</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários ({syncedUsuarios.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas-tabelas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Todas as Tabelas do MySQL</CardTitle>
                  <CardDescription>
                    Lista completa de {allMysqlTables.length} tabelas encontradas no banco MySQL
                  </CardDescription>
                </div>
                <Button
                  onClick={loadAllMysqlTables}
                  disabled={loadingTables}
                  variant="outline"
                  size="sm"
                >
                  {loadingTables ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTables ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Carregando lista de tabelas...</p>
                </div>
              ) : allMysqlTables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tabela encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allMysqlTables.map((tableName) => {
                    const isSynced = ['Cliente', 'Emissao', 'Usuarios'].includes(tableName);
                    const isSyncing = syncingTable === tableName;
                    return (
                      <div
                        key={tableName}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Database className="h-5 w-5 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium">{tableName}</span>
                            {isSynced && (
                              <span className="text-xs text-muted-foreground">Mapeada</span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSync(tableName)}
                          disabled={loading || isSyncing}
                          size="sm"
                          variant={isSynced ? "default" : "outline"}
                        >
                          {isSyncing ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Sincronizando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3" />
                              Sincronizar
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabelas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Sincronização por Tabela</CardTitle>
              <CardDescription>
                Visualize o status e estatísticas de todas as tabelas MySQL sincronizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tableStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Carregando informações das tabelas...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tabela MySQL</TableHead>
                      <TableHead>Tabela Supabase</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Última Sincronização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erros</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableStats.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell className="font-mono text-sm">{table.supabaseTable}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{table.recordCount} registros</Badge>
                        </TableCell>
                        <TableCell>
                          {table.lastSync ? (
                            format(new Date(table.lastSync), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground">Nunca sincronizado</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(table.status)}</TableCell>
                        <TableCell>
                          {table.errors && Array.isArray(table.errors) ? (
                            <div className="space-y-1">
                              {table.errors.slice(0, 3).map((err: any, idx: number) => (
                                <div key={idx} className="text-xs text-destructive">
                                  {err.error || JSON.stringify(err)}
                                </div>
                              ))}
                              {table.errors.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{table.errors.length - 3} mais
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(table.name)}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                            <span className="ml-2">Sincronizar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
