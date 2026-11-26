-- Verifica en la base real las garantías de la spec integridad-de-agenda (C-01).
-- Lo corre el líder en el SQL Editor de Supabase. Los datos de prueba se crean dentro
-- de un bloque que se deshace al final: no queda nada en la base. Resultado esperado:
-- todas las filas con "OK". Datos inventados.
DROP TABLE IF EXISTS resultado_verificacion;
CREATE TEMP TABLE resultado_verificacion (n int, caso text, esperado text, obtenido text);

DO $$
DECLARE
  p1 uuid := gen_random_uuid();  -- Dr. Joaquín Cortez (ficticio para la prueba)
  p2 uuid := gen_random_uuid();  -- Dr. Joaquín Echenagorria
  s1 uuid := gen_random_uuid();
  s2 uuid := gen_random_uuid();
  pr uuid := gen_random_uuid();
  pa uuid := gen_random_uuid();
  us uuid := gen_random_uuid();
  tc uuid := gen_random_uuid();
  d  date := DATE '2030-01-07';
  r  text;
  res text[] := '{}';
BEGIN
 BEGIN
  INSERT INTO profesional (id, nombre, apellido, matricula, updated_at) VALUES
    (p1, 'Prueba', 'Uno', 'VERIF-0001', now()), (p2, 'Prueba', 'Dos', 'VERIF-0002', now());
  INSERT INTO sillon (id, nombre, updated_at) VALUES (s1, 'Verif Sillón 1', now()), (s2, 'Verif Sillón 2', now());
  INSERT INTO prestacion (id, nombre, duracion_minutos, updated_at) VALUES (pr, 'Verif Consulta', 30, now());
  INSERT INTO paciente (id, nombre, apellido, dni, fecha_nacimiento, telefono, updated_at)
    VALUES (pa, 'Paciente', 'Inventado', '90000001', DATE '1990-01-01', '2610000000', now());
  INSERT INTO usuario (id, email, rol, estado, updated_at) VALUES (us, 'verif@example.com', 'ADMIN', 'ACTIVO', now());

  -- Turno base: profesional 1, sillón 1, 09:00-09:30 (hora de Argentina).
  INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
    VALUES (pa, p1, pr, s1, (d + TIME '09:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
            (d + TIME '09:30') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());

  -- 1. RN-TU-02: mismo profesional superpuesto en otro sillón.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p1, pr, s2, (d + TIME '09:15') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '09:45') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 1, 'Mismo profesional 09:15-09:45 sobre 09:00-09:30', 'rechaza (23P01)', r);

  -- 2. RN-TU-01: mismo profesional contiguo 09:30-10:00.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p1, pr, s2, (d + TIME '09:30') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '10:00') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 2, 'Mismo profesional contiguo 09:30-10:00', 'acepta', r);

  -- 3. RN-TU-03: mismo sillón, otro profesional, superpuesto.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p2, pr, s1, (d + TIME '09:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '09:30') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 3, 'Mismo sillón, otro profesional, 09:00-09:30', 'rechaza (23P01)', r);

  -- 4. Mismo horario en otro sillón y otro profesional.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p2, pr, s2, (d + TIME '09:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '09:30') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 4, 'Otro sillón y otro profesional, mismo horario', 'acepta', r);

  -- 5. RN-TU-04: un cancelado libera el horario.
  INSERT INTO turno (id, paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, estado, motivo_cancelacion, creado_por_id, updated_at)
    VALUES (tc, pa, p2, pr, s2, (d + TIME '11:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
            (d + TIME '12:00') AT TIME ZONE 'America/Argentina/Buenos_Aires', 'CANCELADO', 'El paciente avisó', us, now());
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p2, pr, s2, (d + TIME '11:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '12:00') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 5, 'Reutilizar el horario de un cancelado', 'acepta', r);

  -- 6. Reactivar el cancelado que ahora choca.
  BEGIN
    UPDATE turno SET estado = 'RESERVADO', motivo_cancelacion = NULL WHERE id = tc;
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 6, 'Reactivar un cancelado que choca', 'rechaza (23P01)', r);

  -- 7. Fin anterior al inicio.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, creado_por_id, updated_at)
      VALUES (pa, p1, pr, s1, (d + TIME '16:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '15:30') AT TIME ZONE 'America/Argentina/Buenos_Aires', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 7, 'Turno de 16:00 a 15:30', 'rechaza (23514)', r);

  -- 8. Cancelación sin motivo.
  BEGIN
    INSERT INTO turno (paciente_id, profesional_id, prestacion_id, sillon_id, inicio, fin, estado, creado_por_id, updated_at)
      VALUES (pa, p1, pr, s1, (d + TIME '17:00') AT TIME ZONE 'America/Argentina/Buenos_Aires',
              (d + TIME '17:30') AT TIME ZONE 'America/Argentina/Buenos_Aires', 'CANCELADO', us, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 8, 'Cancelado sin motivo', 'rechaza (23514)', r);

  -- 9. DNI repetido: permitido si el otro está inactivo, rechazado entre activos.
  INSERT INTO paciente (nombre, apellido, dni, fecha_nacimiento, telefono, activo, updated_at)
    VALUES ('Inactivo', 'Inventado', '90000002', DATE '1980-05-05', '2610000001', false, now());
  BEGIN
    INSERT INTO paciente (nombre, apellido, dni, fecha_nacimiento, telefono, updated_at)
      VALUES ('Activo', 'Inventado', '90000002', DATE '1985-05-05', '2610000002', now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 9, 'DNI de un paciente inactivo en uno activo', 'acepta', r);
  BEGIN
    INSERT INTO paciente (nombre, apellido, dni, fecha_nacimiento, telefono, updated_at)
      VALUES ('Otro', 'Inventado', '90000002', DATE '1986-05-05', '2610000003', now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 10, 'DNI repetido entre activos', 'rechaza (23505)', r);

  -- 11. Duración de prestación inválida.
  BEGIN
    INSERT INTO prestacion (nombre, duracion_minutos, updated_at) VALUES ('Verif inválida', 7, now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 11, 'Prestación de 7 minutos', 'rechaza (23514)', r);

  -- 12. PROFESIONAL sin profesional vinculado.
  BEGIN
    INSERT INTO usuario (id, email, rol, estado, updated_at) VALUES (gen_random_uuid(), 'verif2@example.com', 'PROFESIONAL', 'ACTIVO', now());
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 12, 'Usuario PROFESIONAL sin profesional', 'rechaza (23514)', r);

  -- 13. Historial: solo inserción.
  INSERT INTO historial_turno (turno_id, estado_nuevo, usuario_id) VALUES (tc, 'RESERVADO', us);
  BEGIN
    UPDATE historial_turno SET motivo = 'cambiado' WHERE turno_id = tc;
    r := 'acepta';
  EXCEPTION WHEN OTHERS THEN r := 'rechaza (' || SQLSTATE || ')'; END;
  res := res || format('%s|%s|%s|%s', 13, 'Editar el historial', 'rechaza (P0001)', r);
  -- Deshacer todos los datos de prueba.
  RAISE EXCEPTION 'deshacer datos de prueba' USING ERRCODE = 'P0099';
 EXCEPTION WHEN SQLSTATE 'P0099' THEN NULL;
 END;

  INSERT INTO resultado_verificacion
    SELECT split_part(x, '|', 1)::int, split_part(x, '|', 2), split_part(x, '|', 3), split_part(x, '|', 4)
    FROM unnest(res) AS x;
END
$$;

SELECT n, caso, esperado, obtenido, CASE WHEN esperado = obtenido THEN 'OK' ELSE 'FALLA' END AS veredicto
FROM resultado_verificacion ORDER BY n;
