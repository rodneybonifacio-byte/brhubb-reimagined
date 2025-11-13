-- Tabela para armazenar clientes sincronizados do MySQL
CREATE TABLE IF NOT EXISTS public.mysql_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mysql_id TEXT NOT NULL UNIQUE,
  nome TEXT,
  email TEXT,
  cpf_cnpj TEXT,
  telefone TEXT,
  endereco JSONB,
  plano_id TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar emissões sincronizadas do MySQL
CREATE TABLE IF NOT EXISTS public.mysql_emissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mysql_id TEXT NOT NULL UNIQUE,
  cliente_id TEXT,
  codigo_objeto TEXT,
  codigo_rastreio TEXT,
  status TEXT,
  valor_frete NUMERIC,
  transportadora TEXT,
  servico TEXT,
  destinatario JSONB,
  remetente JSONB,
  dimensoes JSONB,
  data_emissao TIMESTAMP WITH TIME ZONE,
  data_postagem TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar usuários sincronizados do MySQL
CREATE TABLE IF NOT EXISTS public.mysql_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mysql_id TEXT NOT NULL UNIQUE,
  nome TEXT,
  email TEXT,
  cpf TEXT,
  telefone TEXT,
  cliente_id TEXT,
  role TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para log de sincronização
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running',
  performed_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mysql_clientes_mysql_id ON public.mysql_clientes(mysql_id);
CREATE INDEX IF NOT EXISTS idx_mysql_clientes_cpf_cnpj ON public.mysql_clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_mysql_emissoes_mysql_id ON public.mysql_emissoes(mysql_id);
CREATE INDEX IF NOT EXISTS idx_mysql_emissoes_cliente_id ON public.mysql_emissoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mysql_emissoes_codigo_objeto ON public.mysql_emissoes(codigo_objeto);
CREATE INDEX IF NOT EXISTS idx_mysql_usuarios_mysql_id ON public.mysql_usuarios(mysql_id);
CREATE INDEX IF NOT EXISTS idx_mysql_usuarios_email ON public.mysql_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sync_logs_table_name ON public.sync_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at DESC);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_mysql_clientes_updated_at
  BEFORE UPDATE ON public.mysql_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mysql_emissoes_updated_at
  BEFORE UPDATE ON public.mysql_emissoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mysql_usuarios_updated_at
  BEFORE UPDATE ON public.mysql_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.mysql_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mysql_emissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mysql_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os dados sincronizados
CREATE POLICY "Admins can view all synced clientes"
  ON public.mysql_clientes FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all synced emissoes"
  ON public.mysql_emissoes FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all synced usuarios"
  ON public.mysql_usuarios FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can view all sync logs"
  ON public.sync_logs FOR SELECT
  USING (is_admin());

-- Sistema pode inserir/atualizar dados sincronizados
CREATE POLICY "System can manage synced clientes"
  ON public.mysql_clientes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage synced emissoes"
  ON public.mysql_emissoes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage synced usuarios"
  ON public.mysql_usuarios FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage sync logs"
  ON public.sync_logs FOR ALL
  USING (true)
  WITH CHECK (true);