-- Tabela para configurações de clientes (transportadoras e markup)
CREATE TABLE IF NOT EXISTS public.client_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL UNIQUE,
  client_name text NOT NULL,
  enabled_carriers jsonb NOT NULL DEFAULT '["CORREIOS", "RODONAVES"]'::jsonb,
  markup_percentage numeric NOT NULL DEFAULT 15.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can view all client settings"
ON public.client_settings
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage client settings"
ON public.client_settings
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_client_settings_updated_at
BEFORE UPDATE ON public.client_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão para o cliente atual
INSERT INTO public.client_settings (client_id, client_name, enabled_carriers, markup_percentage)
VALUES 
  ('a7408b8c-9059-4cd3-b173-f12a3830b5e7', 'financeiro@brhubb.com.br', '["CORREIOS", "RODONAVES"]'::jsonb, 15.00)
ON CONFLICT (client_id) DO NOTHING;