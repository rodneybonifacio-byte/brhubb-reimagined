-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');

-- Criar tabela de roles de usuário (separada por segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função de segurança para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role)
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Criar tabela de créditos dos clientes
CREATE TABLE public.client_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL UNIQUE,  -- ID do cliente na API externa
    client_name TEXT NOT NULL,
    credits DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.client_credits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para client_credits
CREATE POLICY "Admins can view all credits"
ON public.client_credits
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can manage credits"
ON public.client_credits
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Criar tabela de transações de crédito (histórico)
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ADD', 'REMOVE', 'CONSUME', 'REFUND')),
    amount DECIMAL(10, 2) NOT NULL,
    previous_balance DECIMAL(10, 2) NOT NULL,
    new_balance DECIMAL(10, 2) NOT NULL,
    description TEXT,
    emission_id TEXT,  -- ID da emissão que consumiu crédito, se aplicável
    performed_by UUID,  -- ID do admin que fez a transação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para credit_transactions
CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "System can insert transactions"
ON public.credit_transactions
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Qualquer usuário autenticado pode registrar transação (sistema)

-- Criar tabela de ajustes de custo de etiquetas
CREATE TABLE public.shipping_cost_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_id TEXT NOT NULL UNIQUE,  -- ID da emissão na API externa
    original_cost DECIMAL(10, 2) NOT NULL,
    adjusted_cost DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    adjusted_by UUID NOT NULL,  -- ID do admin que fez o ajuste
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.shipping_cost_adjustments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shipping_cost_adjustments
CREATE POLICY "Admins can view all adjustments"
ON public.shipping_cost_adjustments
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can manage adjustments"
ON public.shipping_cost_adjustments
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_credits_updated_at
BEFORE UPDATE ON public.client_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_client_credits_client_id ON public.client_credits(client_id);
CREATE INDEX idx_credit_transactions_client_id ON public.credit_transactions(client_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_shipping_adjustments_emission_id ON public.shipping_cost_adjustments(emission_id);