import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateEmailRequest {
  userId: string
  newEmail: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autenticado')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Token inválido')
    }

    // Verificar se é admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Sem permissão de administrador')
    }

    const { userId, newEmail } = await req.json() as UpdateEmailRequest

    console.log('Atualizando email do usuário:', { userId, newEmail })

    // Atualizar email usando service_role
    const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { 
        email: newEmail,
        email_confirm: true 
      }
    )

    if (updateError) {
      console.error('Erro ao atualizar email:', updateError)
      throw updateError
    }

    if (!updatedUser.user) {
      throw new Error('Falha ao atualizar email')
    }

    console.log('Email atualizado com sucesso:', updatedUser.user.email)

    // Atualizar client_name na tabela de créditos
    const { error: creditsUpdateError } = await supabaseClient
      .from('client_credits')
      .update({ client_name: newEmail })
      .eq('client_id', userId)

    if (creditsUpdateError) {
      console.warn('Aviso ao atualizar client_name:', creditsUpdateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro na função:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
