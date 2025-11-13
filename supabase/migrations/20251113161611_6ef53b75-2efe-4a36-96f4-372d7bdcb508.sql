-- Habilitar realtime para a tabela sync_logs
ALTER TABLE sync_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_logs;