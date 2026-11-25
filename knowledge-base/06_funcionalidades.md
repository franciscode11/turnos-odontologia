# Funcionalidades

> Fuentes: checklist de Discovery (puntos 3 y 5), informe D.3, guías de los integrantes (alcance y escenarios sugeridos). Cada épica corresponde a un change del roadmap. Los escenarios son los mínimos: la spec de cada change puede agregar más, nunca menos de 3 (feliz, error de negocio, borde).

## Épica 1: Base técnica, acceso y componentes (C01 · líder)

### US-001 — Iniciar sesión
**Como** usuario del consultorio **quiero** entrar con email y contraseña **para** acceder solo a lo que mi rol permite.

**Criterios de aceptación**:
- [ ] Con credenciales válidas entra al panel; con inválidas ve un error genérico.
- [ ] Sin sesión, cualquier ruta del panel redirige a `/login`.
- [ ] Una acción llamada con un rol no permitido se rechaza en el servidor.

**Reglas**: RN-AU-01 a RN-AU-05.

### US-002 — Usar un sistema de componentes único
**Como** integrante del equipo **quiero** un catálogo de componentes en `/dev/componentes` **para** construir todas las pantallas con los mismos controles.

**Criterios de aceptación**:
- [ ] Están todos los controles definidos en el C01 (22 tipos de input, Select con grupos y múltiple, Combobox, Textarea, botones, Card, Table, Dialog, Badge, Toast), con label, ayuda, error, disabled, required y foco visible.
- [ ] ESLint falla si aparece `<input>`, `<select>`, `<textarea>` o `<button>` crudo fuera de `src/components/ui`.

**Reglas**: RN-GL-04.

### US-003 — Ver los turnos del día
**Como** cualquier rol **quiero** ver el listado de turnos de hoy **para** saber quién viene, con quién y en qué sillón.

**Criterios de aceptación**:
- [ ] Muestra hora, paciente, profesional, prestación, sillón y estado, ordenado por hora.
- [ ] Es solo lectura; cada fila lleva al detalle.

## Épica 2: Pacientes (C02 · Octavio Crescini)

### US-010 — Registrar paciente
**Como** recepción **quiero** dar de alta un paciente **para** poder darle turnos.

**Criterios de aceptación**:
- [ ] **Feliz:** con datos obligatorios válidos queda guardado y aparece al buscar por apellido.
- [ ] **Error:** con un DNI ya usado por un paciente activo se rechaza con "Ya existe un paciente con ese DNI".
- [ ] **Borde:** `30.123.456` se rechaza si existe `30123456` (DNI normalizado).
- [ ] **Permisos:** un PROFESIONAL no puede crear pacientes.

**Reglas**: RN-PA-01 a RN-PA-04, RN-PA-06.

### US-011 — Buscar, editar y dar de baja pacientes
**Como** recepción **quiero** buscar por apellido o DNI, editar y dar de baja **para** mantener el padrón al día.

**Criterios de aceptación**:
- [ ] Búsqueda por apellido (parcial) o DNI, con listado paginado.
- [ ] La baja es lógica y el paciente deja de aparecer para turnos nuevos.

**Reglas**: RN-PA-05, RN-PA-06.

## Épica 3: Catálogo (C03 · Joaquín Cortez Badaloni)

### US-020 — Gestionar profesionales, prestaciones y sillones
**Como** admin **quiero** cargar profesionales, prestaciones con duración y sillones **para** configurar el consultorio.

**Criterios de aceptación**:
- [ ] **Feliz:** crear la prestación "Limpieza" de 30 minutos la deja activa y disponible para turnos.
- [ ] **Error:** una prestación de 7 minutos se rechaza (múltiplo de 5 entre 10 y 240).
- [ ] **Borde:** una prestación de exactamente 240 minutos se acepta.
- [ ] **Error:** una matrícula repetida se rechaza.
- [ ] Desactivar no borra; los turnos existentes siguen mostrando el dato.

**Reglas**: RN-CA-01 a RN-CA-06.

## Épica 4: Horarios y disponibilidad (C04 · Lautaro de Coninck)

### US-030 — Cargar horarios de atención y bloqueos
**Como** admin **quiero** definir franjas semanales y bloqueos por profesional **para** que solo se ofrezcan horarios reales.

**Criterios de aceptación**:
- [ ] **Error:** una franja de 11:00 a 14:00 se rechaza si existe otra de 09:00 a 12:00 el mismo día.
- [ ] **Borde:** una franja de 12:00 a 14:00 se acepta junto a una de 09:00 a 12:00.

**Reglas**: RN-HO-01 a RN-HO-03, RN-HO-06.

### US-031 — Consultar disponibilidad
**Como** recepción **quiero** ver los inicios libres de un profesional para una fecha y duración **para** ofrecer turnos posibles.

**Criterios de aceptación**:
- [ ] **Feliz:** lunes 09:00–12:00 sin turnos y 30 minutos → inicios de 09:00 a 11:30.
- [ ] **Bloqueo:** con un bloqueo de 10:00 a 11:00 no se ofrece ningún inicio que lo pise.
- [ ] Los turnos cancelados no restan disponibilidad.

**Reglas**: RN-HO-04, RN-HO-05, RN-TU-04.

## Épica 5: Crear turno (C05 · Joaquín Echenagorria)

### US-040 — Crear turno sin solapamientos
**Como** recepción **quiero** crear un turno eligiendo paciente, profesional, prestación, sillón e inicio **para** reservar la atención sin pisar otro turno.

**Criterios de aceptación**:
- [ ] **Feliz:** turno de 10:00 con prestación de 30 minutos queda creado con fin 10:30, en `RESERVADO`, con historial.
- [ ] **Error:** con un turno del profesional de 10:00 a 10:30, otro de 10:15 a 10:45 se rechaza con "El profesional ya tiene un turno en ese horario".
- [ ] **Borde:** otro de 10:30 a 11:00 se acepta.
- [ ] **Sillón:** mismo sillón y horario con otro profesional se rechaza por sillón ocupado.
- [ ] **Cancelados:** un turno cancelado en ese horario no impide crear uno nuevo.
- [ ] Fuera de franja, sobre un bloqueo o en el pasado se rechaza.

**Reglas**: RN-TU-01 a RN-TU-12.

## Épica 6: Estados del turno (C06 · Ulises Lucato Flores)

### US-050 — Confirmar, cancelar y marcar asistencia
**Como** recepción o profesional **quiero** cambiar el estado de un turno **para** reflejar lo que pasó y liberar el horario si se cancela.

**Criterios de aceptación**:
- [ ] **Feliz:** cancelar un turno reservado con motivo "Paciente avisó" lo deja `CANCELADO`, registra el historial y libera el horario.
- [ ] **Error:** un turno atendido no se puede cancelar (estado final).
- [ ] **Borde:** un turno que empieza exactamente ahora se puede marcar atendido.
- [ ] **Error:** cancelar sin motivo se rechaza pidiendo el motivo.
- [ ] El detalle muestra solo las acciones permitidas para el estado y el rol, y el historial completo.

**Reglas**: RN-ES-01 a RN-ES-08.

## Épica 7: Equipo e invitaciones (C07 · líder)

### US-060 - Invitar al equipo
**Como** admin **quiero** invitar personas por email con un rol **para** que usen el sistema sin registro público.

**Criterios de aceptación**:
- [ ] **Feliz:** invitar a un email nuevo como Recepción lo deja `INVITADO` y envía el email de activación.
- [ ] **Error:** invitar como Profesional sin elegir profesional vinculado se rechaza.
- [ ] **Borde:** no se puede desactivar ni cambiar el rol del último ADMIN activo.
- [ ] Activar la cuenta con una contraseña válida deja al usuario `ACTIVO` y lo lleva a la agenda.

**Reglas**: RN-EQ-01 a RN-EQ-07, RN-AU-01, RN-AU-05.

## Épica 8: Estadísticas (C08 · líder)

### US-070 - Ver estadísticas del consultorio
**Como** dueño (ADMIN) **quiero** ver turnos, ocupación, ausentismo y cancelaciones del período **para** tomar decisiones sobre el consultorio.

**Criterios de aceptación**:
- [ ] **Feliz:** con 10 atendidos y 2 ausentes en el mes, el ausentismo es 16,7%.
- [ ] **Borde:** sin turnos atendidos ni ausentes, el ausentismo se muestra como "Sin datos", no como 0%.
- [ ] **Permisos:** RECEPCION y PROFESIONAL no acceden a `/estadisticas`.
- [ ] Cada indicador muestra la variación contra el período anterior.

**Reglas**: RN-ST-01 a RN-ST-07.
