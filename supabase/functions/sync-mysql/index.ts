import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting MySQL sync...');

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Token inválido');
    }

    // Verificar se é admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Sem permissão de administrador');
    }

    // Conectar ao MySQL
    // ATENÇÃO: Credenciais temporárias APENAS PARA TESTE
    // TODO: Mover para secrets assim que possível
    const mysqlClient = await new Client().connect({
      hostname: '69.62.86.39',
      username: 'root',
      password: '102030@2025',
      port: 3306,
    });

    console.log('Connected to MySQL');

    // Listar todos os bancos de dados disponíveis
    const databases = await mysqlClient.query('SHOW DATABASES');
    console.log('Available databases:', databases);

    // Listar tabelas do primeiro banco (excluindo system databases)
    const systemDbs = ['information_schema', 'mysql', 'performance_schema', 'sys'];
    const userDatabases = databases.filter((db: any) => 
      !systemDbs.includes(db.Database?.toLowerCase())
    );

    let tablesInfo = [];

    if (userDatabases.length > 0) {
      const firstDb = userDatabases[0].Database;
      await mysqlClient.execute(`USE ${firstDb}`);
      console.log(`Using database: ${firstDb}`);

      const tables = await mysqlClient.query('SHOW TABLES');
      console.log('Available tables:', tables);

      // Para cada tabela, pegar uma amostra de dados
      for (const table of tables) {
        const tableName = Object.values(table)[0] as string;
        try {
          const sampleData = await mysqlClient.query(`SELECT * FROM ${tableName} LIMIT 5`);
          const columns = await mysqlClient.query(`SHOW COLUMNS FROM ${tableName}`);
          
          tablesInfo.push({
            table: tableName,
            columns: columns,
            sampleData: sampleData,
            rowCount: sampleData.length
          });
        } catch (error) {
          console.error(`Error reading table ${tableName}:`, error);
        }
      }
    }

    await mysqlClient.close();

    return new Response(
      JSON.stringify({
        success: true,
        databases: userDatabases,
        tablesInfo: tablesInfo,
        message: 'Conexão MySQL estabelecida com sucesso. Revise os dados antes de sincronizar.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na função sync-mysql:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});