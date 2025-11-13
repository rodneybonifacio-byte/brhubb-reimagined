-- Remover a policy restritiva
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Criar nova policy que permite:
-- 1. Admins gerenciarem todas as roles
-- 2. Usuários sem role criarem sua própria role (bootstrap)
CREATE POLICY "Admins and bootstrap can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Admin pode fazer tudo
  is_admin()
  OR
  -- Usuário pode criar sua própria role se não tiver nenhuma
  (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- Admin pode fazer tudo
  is_admin()
  OR
  -- Usuário pode criar apenas sua própria role como admin (bootstrap)
  (
    auth.uid() = user_id
    AND role = 'admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);

-- Garantir que o usuário atual tenha role de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
)
LIMIT 1;