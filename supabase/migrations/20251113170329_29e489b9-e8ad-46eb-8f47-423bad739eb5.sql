-- Criar tabela genérica para sincronizar quaisquer tabelas MySQL
CREATE TABLE IF NOT EXISTS public.mysql_sync_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  mysql_id TEXT NOT NULL,
  data JSONB NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_name, mysql_id)
);

-- Enable RLS
ALTER TABLE public.mysql_sync_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can view all synced data"
ON public.mysql_sync_data
FOR SELECT
USING (is_admin());

CREATE POLICY "System can manage synced data"
ON public.mysql_sync_data
FOR ALL
USING (true)
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mysql_sync_data_table_name ON public.mysql_sync_data(table_name);
CREATE INDEX IF NOT EXISTS idx_mysql_sync_data_mysql_id ON public.mysql_sync_data(mysql_id);
CREATE INDEX IF NOT EXISTS idx_mysql_sync_data_synced_at ON public.mysql_sync_data(synced_at);

-- Trigger para updated_at
CREATE TRIGGER update_mysql_sync_data_updated_at
BEFORE UPDATE ON public.mysql_sync_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mysql_sync_data;