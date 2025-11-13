import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting MySQL data sync...');

    // Verificar autenticação e permissão admin
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

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Sem permissão de administrador');
    }

    // Criar log de sincronização
    const { data: syncLog, error: logError } = await supabaseClient
      .from('sync_logs')
      .insert({
        sync_type: 'full',
        table_name: 'all',
        performed_by: user.id,
        status: 'running'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating sync log:', logError);
    }

    // Conectar ao MySQL
    const mysqlClient = await new Client().connect({
      hostname: Deno.env.get('MYSQL_HOST') ?? '',
      username: Deno.env.get('MYSQL_USER') ?? '',
      password: Deno.env.get('MYSQL_PASSWORD') ?? '',
      port: parseInt(Deno.env.get('MYSQL_PORT') ?? '3306'),
      db: Deno.env.get('MYSQL_DATABASE') ?? 'dbhomol',
    });

    console.log('Connected to MySQL database:', Deno.env.get('MYSQL_DATABASE') ?? 'dbhomol');

    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    const errors: any[] = [];

    // Sincronizar Clientes
    try {
      console.log('Syncing Clientes...');
      const clientes = await mysqlClient.query(`
        SELECT 
          id,
          nome,
          email,
          cpfCnpj,
          telefone,
          planoId
        FROM Cliente
        LIMIT 100
      `);

      for (const cliente of clientes) {
        try {
          totalProcessed++;
          
          const { error } = await supabaseClient
            .from('mysql_clientes')
            .upsert({
              mysql_id: cliente.id,
              nome: cliente.nome,
              email: cliente.email,
              cpf_cnpj: cliente.cpfCnpj,
              telefone: cliente.telefone,
              plano_id: cliente.planoId,
              ativo: true, // Default como ativo
              synced_at: new Date().toISOString()
            }, {
              onConflict: 'mysql_id'
            });

          if (error) {
            totalFailed++;
            errors.push({ table: 'Cliente', id: cliente.id, error: error.message });
          } else {
            totalSuccess++;
          }
        } catch (err) {
          totalFailed++;
          errors.push({ table: 'Cliente', id: cliente.id, error: String(err) });
        }
      }
      
      console.log(`Clientes synced: ${totalSuccess}/${totalProcessed}`);
    } catch (error) {
      console.error('Error syncing Clientes:', error);
      errors.push({ table: 'Cliente', error: String(error) });
    }

    // Sincronizar Emissões
    try {
      console.log('Syncing Emissoes...');
      const emissoes = await mysqlClient.query(`
        SELECT 
          id,
          clienteId,
          codigoObjeto,
          status,
          valorFrete,
          transportadora,
          servico,
          destinatario,
          remetente,
          embalagem,
          createdAt,
          dataPostagem
        FROM Emissao
        ORDER BY createdAt DESC
        LIMIT 500
      `);

      for (const emissao of emissoes) {
        try {
          totalProcessed++;
          
          const { error } = await supabaseClient
            .from('mysql_emissoes')
            .upsert({
              mysql_id: emissao.id,
              cliente_id: emissao.clienteId,
              codigo_objeto: emissao.codigoObjeto,
              codigo_rastreio: emissao.codigoObjeto, // Usar codigoObjeto como rastreio
              status: emissao.status,
              valor_frete: emissao.valorFrete,
              transportadora: emissao.transportadora,
              servico: emissao.servico,
              destinatario: emissao.destinatario ? JSON.parse(emissao.destinatario) : null,
              remetente: emissao.remetente ? JSON.parse(emissao.remetente) : null,
              dimensoes: emissao.embalagem ? JSON.parse(emissao.embalagem) : null,
              data_emissao: emissao.createdAt,
              data_postagem: emissao.dataPostagem,
              synced_at: new Date().toISOString()
            }, {
              onConflict: 'mysql_id'
            });

          if (error) {
            totalFailed++;
            errors.push({ table: 'Emissao', id: emissao.id, error: error.message });
          } else {
            totalSuccess++;
          }
        } catch (err) {
          totalFailed++;
          errors.push({ table: 'Emissao', id: emissao.id, error: String(err) });
        }
      }
      
      console.log(`Emissoes synced: ${totalSuccess}/${totalProcessed}`);
    } catch (error) {
      console.error('Error syncing Emissoes:', error);
      errors.push({ table: 'Emissao', error: String(error) });
    }

    // Sincronizar Usuários
    try {
      console.log('Syncing Usuarios...');
      const usuarios = await mysqlClient.query(`
        SELECT 
          id,
          nome,
          email,
          telefone,
          clienteId,
          role,
          ativo
        FROM Usuarios
        LIMIT 100
      `);

      for (const usuario of usuarios) {
        try {
          totalProcessed++;
          
          const { error } = await supabaseClient
            .from('mysql_usuarios')
            .upsert({
              mysql_id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              cpf: null, // CPF não existe na tabela MySQL
              telefone: usuario.telefone,
              cliente_id: usuario.clienteId,
              role: usuario.role,
              ativo: usuario.ativo === 1,
              synced_at: new Date().toISOString()
            }, {
              onConflict: 'mysql_id'
            });

          if (error) {
            totalFailed++;
            errors.push({ table: 'Usuarios', id: usuario.id, error: error.message });
          } else {
            totalSuccess++;
          }
        } catch (err) {
          totalFailed++;
          errors.push({ table: 'Usuarios', id: usuario.id, error: String(err) });
        }
      }
      
      console.log(`Usuarios synced: ${totalSuccess}/${totalProcessed}`);
    } catch (error) {
      console.error('Error syncing Usuarios:', error);
      errors.push({ table: 'Usuarios', error: String(error) });
    }

    await mysqlClient.close();

    // Atualizar log de sincronização
    if (syncLog) {
      await supabaseClient
        .from('sync_logs')
        .update({
          records_processed: totalProcessed,
          records_success: totalSuccess,
          records_failed: totalFailed,
          error_details: errors.length > 0 ? errors : null,
          completed_at: new Date().toISOString(),
          status: totalFailed === 0 ? 'completed' : 'completed_with_errors'
        })
        .eq('id', syncLog.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: totalProcessed,
          total_success: totalSuccess,
          total_failed: totalFailed,
          errors: errors.slice(0, 10) // Retornar apenas primeiros 10 erros
        },
        message: totalFailed === 0 
          ? 'Sincronização completa com sucesso!' 
          : `Sincronização concluída com ${totalFailed} erros.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na função sync-mysql-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false,
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
