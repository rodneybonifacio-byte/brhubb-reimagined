-- Habilitar realtime para as tabelas de dados sincronizados
ALTER TABLE mysql_clientes REPLICA IDENTITY FULL;
ALTER TABLE mysql_emissoes REPLICA IDENTITY FULL;
ALTER TABLE mysql_usuarios REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE mysql_clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE mysql_emissoes;
ALTER PUBLICATION supabase_realtime ADD TABLE mysql_usuarios;