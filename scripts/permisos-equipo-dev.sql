-- Permisos del rol de los integrantes (equipo_dev): solo datos (DML), sin DDL.
-- Lo corre SOLO el líder en el SQL Editor de Supabase, después de crear el rol
-- (ver equipo/04-plan-lider.md) y después de cada migración que agregue tablas.
-- Es idempotente.
GRANT USAGE ON SCHEMA public TO equipo_dev;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO equipo_dev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO equipo_dev;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations' LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS equipo_dev_acceso ON %I', t);
    EXECUTE format('CREATE POLICY equipo_dev_acceso ON %I FOR ALL TO equipo_dev USING (true) WITH CHECK (true)', t);
  END LOOP;
END
$$;

-- El historial sigue siendo de solo inserción por el trigger historial_turno_sin_cambios.
