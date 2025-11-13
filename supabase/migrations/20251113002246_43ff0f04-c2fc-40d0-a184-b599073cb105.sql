-- Remover todas as policies problemáticas da tabela user_roles
DROP POLICY IF EXISTS "Admins and bootstrap can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

-- Criar policies simples SEM usar is_admin() para evitar recursão
-- 1. Qualquer um pode ver roles (necessário para o sistema funcionar)
CREATE POLICY "Anyone can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- 2. Apenas para INSERT/UPDATE/DELETE, vamos usar uma abordagem diferente
-- Vamos permitir apenas via service_role
CREATE POLICY "Only service role can modify roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 3. Policy especial para service_role (usado em edge functions)
CREATE POLICY "Service role full access"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Criar constraint única antes de inserir
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- Adicionar o usuário atual como admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('a931a3cf-2332-400c-940a-3c8dd656fe46', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;