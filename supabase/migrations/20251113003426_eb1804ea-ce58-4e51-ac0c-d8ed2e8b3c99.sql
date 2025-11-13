-- Tabela para configurações globais do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para system_settings
CREATE POLICY "Admins can view all settings"
ON public.system_settings
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage settings"
ON public.system_settings
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('default_credits', '{"amount": 100}', 'Créditos padrão para novos clientes'),
('default_markup_percentage', '{"percentage": 15}', 'Porcentagem de markup padrão sobre o frete'),
('min_credits_warning', '{"amount": 50}', 'Valor mínimo de créditos para exibir aviso'),
('new_user_auto_approve', '{"enabled": true}', 'Auto-aprovar novos usuários')
ON CONFLICT (setting_key) DO NOTHING;