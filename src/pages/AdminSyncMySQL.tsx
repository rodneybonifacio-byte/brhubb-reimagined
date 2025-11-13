import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminSyncMySQL() {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setLoading(true);
    setSyncResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-mysql');

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
        setSyncResult(data);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com MySQL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sincronização MySQL</h1>
        <p className="text-muted-foreground mt-2">
          Conecte e sincronize dados do banco MySQL externo
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configurar Secrets Primeiro</AlertTitle>
        <AlertDescription>
          Antes de testar a conexão, adicione os seguintes secrets no Lovable Cloud:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>MYSQL_HOST</strong>: 69.62.86.39</li>
            <li><strong>MYSQL_USER</strong>: root</li>
            <li><strong>MYSQL_PASSWORD</strong>: 102030@2025</li>
            <li><strong>MYSQL_PORT</strong>: 3306</li>
          </ul>
          <p className="mt-2 text-sm">
            Para adicionar secrets: vá em Settings → Backend → Secrets
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Testar Conexão MySQL
          </CardTitle>
          <CardDescription>
            Conectar ao banco externo e listar bancos de dados e tabelas disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSync}
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Testar Conexão
              </>
            )}
          </Button>

          {syncResult && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Bancos de Dados Disponíveis:</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(syncResult.databases, null, 2)}
                </pre>
              </div>

              {syncResult.tablesInfo && syncResult.tablesInfo.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tabelas e Dados:</h3>
                  <div className="space-y-4">
                    {syncResult.tablesInfo.map((table: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-base">{table.table}</CardTitle>
                          <CardDescription>
                            {table.rowCount} registros (amostra)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <details className="cursor-pointer">
                            <summary className="font-medium mb-2">Ver Colunas</summary>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                              {JSON.stringify(table.columns, null, 2)}
                            </pre>
                          </details>
                          <details className="cursor-pointer mt-2">
                            <summary className="font-medium mb-2">Ver Dados</summary>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                              {JSON.stringify(table.sampleData, null, 2)}
                            </pre>
                          </details>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}