-- Criar tabela para endereços de origem dos clientes
CREATE TABLE public.client_origins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  localidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  is_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para busca eficiente
CREATE INDEX idx_client_origins_user_id ON public.client_origins(user_id);
CREATE INDEX idx_client_origins_client_id ON public.client_origins(client_id);

-- Habilitar RLS
ALTER TABLE public.client_origins ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios endereços
CREATE POLICY "Users can view their own origins"
ON public.client_origins
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Usuários podem criar seus próprios endereços
CREATE POLICY "Users can create their own origins"
ON public.client_origins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios endereços
CREATE POLICY "Users can update their own origins"
ON public.client_origins
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios endereços
CREATE POLICY "Users can delete their own origins"
ON public.client_origins
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Admins podem ver todos os endereços
CREATE POLICY "Admins can view all origins"
ON public.client_origins
FOR SELECT
USING (is_admin());

-- Policy: Admins podem gerenciar todos os endereços
CREATE POLICY "Admins can manage all origins"
ON public.client_origins
FOR ALL
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_client_origins_updated_at
BEFORE UPDATE ON public.client_origins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();