-- Temporariamente desabilitar RLS para inserir o primeiro admin
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Adicionar role admin para todos os usuários existentes
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
ON CONFLICT DO NOTHING;

-- Re-habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar uma policy que permite service_role inserir roles (para usar via código)
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);