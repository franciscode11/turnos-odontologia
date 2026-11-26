-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "rol" AS ENUM ('ADMIN', 'RECEPCION', 'PROFESIONAL');

-- CreateEnum
CREATE TYPE "estado_usuario" AS ENUM ('INVITADO', 'ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "estado_turno" AS ENUM ('RESERVADO', 'CONFIRMADO', 'CANCELADO', 'ATENDIDO', 'AUSENTE');

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "rol" "rol" NOT NULL,
    "estado" "estado_usuario" NOT NULL DEFAULT 'INVITADO',
    "invitado_por_id" UUID,
    "invitado_en" TIMESTAMPTZ(3),
    "ultimo_ingreso" TIMESTAMPTZ(3),
    "profesional_id" UUID,
    "avatar" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paciente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "obra_social" TEXT,
    "numero_afiliado" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesional" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "especialidad" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "precio_referencia" DECIMAL(12,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "prestacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sillon" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sillon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario_atencion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profesional_id" UUID NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_desde" TEXT NOT NULL,
    "hora_hasta" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "horario_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profesional_id" UUID NOT NULL,
    "desde" TIMESTAMPTZ(3) NOT NULL,
    "hasta" TIMESTAMPTZ(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bloqueo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "prestacion_id" UUID NOT NULL,
    "sillon_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fin" TIMESTAMPTZ(3) NOT NULL,
    "estado" "estado_turno" NOT NULL DEFAULT 'RESERVADO',
    "motivo_cancelacion" TEXT,
    "creado_por_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_turno" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "turno_id" UUID NOT NULL,
    "estado_anterior" "estado_turno",
    "estado_nuevo" "estado_turno" NOT NULL,
    "motivo" TEXT,
    "usuario_id" UUID NOT NULL,
    "fecha" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_profesional_id_key" ON "usuario"("profesional_id");

-- CreateIndex
CREATE INDEX "paciente_apellido_idx" ON "paciente"("apellido");

-- CreateIndex
CREATE INDEX "paciente_dni_idx" ON "paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "profesional_matricula_key" ON "profesional"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "sillon_nombre_key" ON "sillon"("nombre");

-- CreateIndex
CREATE INDEX "horario_atencion_profesional_id_dia_semana_idx" ON "horario_atencion"("profesional_id", "dia_semana");

-- CreateIndex
CREATE INDEX "bloqueo_profesional_id_desde_idx" ON "bloqueo"("profesional_id", "desde");

-- CreateIndex
CREATE INDEX "turno_profesional_id_inicio_idx" ON "turno"("profesional_id", "inicio");

-- CreateIndex
CREATE INDEX "turno_sillon_id_inicio_idx" ON "turno"("sillon_id", "inicio");

-- CreateIndex
CREATE INDEX "turno_inicio_idx" ON "turno"("inicio");

-- CreateIndex
CREATE INDEX "turno_paciente_id_idx" ON "turno"("paciente_id");

-- CreateIndex
CREATE INDEX "historial_turno_turno_id_fecha_idx" ON "historial_turno"("turno_id", "fecha");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_invitado_por_id_fkey" FOREIGN KEY ("invitado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_atencion" ADD CONSTRAINT "horario_atencion_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueo" ADD CONSTRAINT "bloqueo_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_prestacion_id_fkey" FOREIGN KEY ("prestacion_id") REFERENCES "prestacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_sillon_id_fkey" FOREIGN KEY ("sillon_id") REFERENCES "sillon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_turno" ADD CONSTRAINT "historial_turno_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_turno" ADD CONSTRAINT "historial_turno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- =============================================================================
-- SQL manual: garantías de integridad que Prisma no modela (RN-TU-06, DD-03).
-- No borrar al regenerar: cualquier migración nueva se crea con --create-only.
-- =============================================================================

-- Supabase instala las extensiones en el esquema "extensions".
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- Turnos: sin superposición por profesional ni por sillón en estados que ocupan agenda
-- (RN-TU-02, RN-TU-03, RN-TU-04). Intervalos semiabiertos [inicio, fin) (RN-TU-01).
ALTER TABLE "turno"
  ADD CONSTRAINT "turno_sin_solapamiento_profesional"
  EXCLUDE USING gist ("profesional_id" WITH =, tstzrange("inicio", "fin", '[)') WITH &&)
  WHERE ("estado" <> 'CANCELADO');

ALTER TABLE "turno"
  ADD CONSTRAINT "turno_sin_solapamiento_sillon"
  EXCLUDE USING gist ("sillon_id" WITH =, tstzrange("inicio", "fin", '[)') WITH &&)
  WHERE ("estado" <> 'CANCELADO');

ALTER TABLE "turno"
  ADD CONSTRAINT "turno_fin_posterior_al_inicio" CHECK ("fin" > "inicio"),
  ADD CONSTRAINT "turno_cancelado_con_motivo"
    CHECK ("estado" <> 'CANCELADO' OR ("motivo_cancelacion" IS NOT NULL AND btrim("motivo_cancelacion") <> ''));

-- Bloqueos
ALTER TABLE "bloqueo"
  ADD CONSTRAINT "bloqueo_hasta_posterior_a_desde" CHECK ("hasta" > "desde"),
  ADD CONSTRAINT "bloqueo_motivo_obligatorio" CHECK (btrim("motivo") <> '');

-- Prestaciones: duración entre 10 y 240 minutos, múltiplo de 5.
ALTER TABLE "prestacion"
  ADD CONSTRAINT "prestacion_duracion_valida"
    CHECK ("duracion_minutos" BETWEEN 10 AND 240 AND "duracion_minutos" % 5 = 0);

-- Franjas semanales: día ISO 1-7, horas "HH:mm" y desde < hasta.
ALTER TABLE "horario_atencion"
  ADD CONSTRAINT "horario_dia_semana_valido" CHECK ("dia_semana" BETWEEN 1 AND 7),
  ADD CONSTRAINT "horario_horas_formato"
    CHECK ("hora_desde" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "hora_hasta" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT "horario_desde_anterior_a_hasta" CHECK ("hora_desde" < "hora_hasta");

-- Pacientes: DNI de 7 u 8 dígitos, único entre pacientes activos.
ALTER TABLE "paciente"
  ADD CONSTRAINT "paciente_dni_formato" CHECK ("dni" ~ '^[0-9]{7,8}$');
CREATE UNIQUE INDEX "paciente_dni_activo_key" ON "paciente" ("dni") WHERE "activo";

-- Usuarios: un PROFESIONAL siempre tiene profesional vinculado; los demás roles no.
ALTER TABLE "usuario"
  ADD CONSTRAINT "usuario_profesional_segun_rol"
    CHECK (("rol" = 'PROFESIONAL') = ("profesional_id" IS NOT NULL));

-- Historial de turnos: solo se inserta, nunca se edita ni se borra.
CREATE OR REPLACE FUNCTION "historial_turno_solo_insercion"() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'El historial de turnos no se puede modificar ni borrar';
END;
$$;
CREATE TRIGGER "historial_turno_sin_cambios"
  BEFORE UPDATE OR DELETE ON "historial_turno"
  FOR EACH ROW EXECUTE FUNCTION "historial_turno_solo_insercion"();

-- Data API de Supabase cerrada: la app accede solo con Prisma desde el servidor.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
  END IF;
END
$$;

-- RLS activado en todas las tablas (Supabase Advisors lo exige en el esquema public).
-- Prisma se conecta como dueño de las tablas y no lo afecta. El rol de los integrantes
-- (equipo_dev, DML sin DDL) recibe una política explícita; si el rol todavía no existe,
-- correr scripts/permisos-equipo-dev.sql después de crearlo.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['usuario','paciente','profesional','prestacion','sillon','horario_atencion','bloqueo','turno','historial_turno'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'equipo_dev') THEN
      EXECUTE format('DROP POLICY IF EXISTS equipo_dev_acceso ON %I', t);
      EXECUTE format('CREATE POLICY equipo_dev_acceso ON %I FOR ALL TO equipo_dev USING (true) WITH CHECK (true)', t);
    END IF;
  END LOOP;
END
$$;

-- La tabla de control de Prisma también queda con RLS (sin políticas: solo el dueño la usa).
ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
