import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  role: 'admin' | 'cliente'
  initialCredits?: number
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

    const { email, password, role, initialCredits } = await req.json() as CreateUserRequest

    console.log('Criando usuário:', { email, role, initialCredits })

    // Buscar configurações padrão se não fornecido créditos
    let creditsToAssign = initialCredits
    
    if (role === 'cliente' && !initialCredits) {
      const { data: settingData } = await supabaseClient
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'default_credits')
        .single()
      
      if (settingData) {
        creditsToAssign = settingData.setting_value.amount
        console.log('Usando créditos padrão do sistema:', creditsToAssign)
      } else {
        creditsToAssign = 100 // Fallback
      }
    }

    // Criar usuário usando service_role
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      throw createError
    }

    if (!newUser.user) {
      throw new Error('Falha ao criar usuário')
    }

    console.log('Usuário criado:', newUser.user.id)

    // Criar role
    const { error: roleInsertError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
      })

    if (roleInsertError) {
      console.error('Erro ao criar role:', roleInsertError)
      throw new Error('Falha ao atribuir permissões')
    }

    console.log('Role criada:', role)

    // Se for cliente, criar créditos
    if (role === 'cliente') {
      const { error: creditsError } = await supabaseClient
        .from('client_credits')
        .insert({
          client_id: newUser.user.id,
          client_name: email,
          credits: creditsToAssign,
        })

      if (creditsError) {
        console.error('Erro ao criar créditos:', creditsError)
        throw new Error('Falha ao criar créditos')
      }

      console.log('Créditos criados:', creditsToAssign)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role,
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
