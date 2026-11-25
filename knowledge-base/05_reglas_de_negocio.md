# Reglas de Negocio

> Fuentes: checklist de Discovery (punto 7, aprobado por el líder), reglas candidatas de las guías de los integrantes, `docs/restricciones-equipo.md`. **Esta es la fuente de verdad**: si una guía dice otra cosa, gana este archivo. Si algo no está acá, se pregunta al líder; no se inventa.

Cada regla tiene un código `RN-{DOMINIO}-{NN}`. Las specs y los tests de cada change deben citar los códigos que cubren.

## Dominio: Acceso y permisos (RN-AU)

- **RN-AU-01**: No hay registro público. Los usuarios los crea el administrador (en el MVP, el seed).
- **RN-AU-02**: Cada usuario tiene un único rol: `ADMIN`, `RECEPCION` o `PROFESIONAL`.
- **RN-AU-03**: Los permisos se controlan en el servidor en cada acción (`requireRol`), según la matriz de `03_actores_y_roles.md`. Ocultar un botón no alcanza.
- **RN-AU-04**: Toda ruta del panel exige sesión válida; sin sesión se redirige a `/login`.
- **RN-AU-05**: Un usuario inactivo no puede operar.

## Dominio: Pacientes (RN-PA) — C02

- **RN-PA-01**: El DNI se guarda normalizado: solo dígitos, 7 u 8. `30.123.456` y `30123456` son el mismo DNI.
- **RN-PA-02**: No puede haber dos pacientes **activos** con el mismo DNI normalizado.
- **RN-PA-03**: Nombre, apellido, DNI, fecha de nacimiento y teléfono son obligatorios. Email, obra social y n.º de afiliado son opcionales.
- **RN-PA-04**: La fecha de nacimiento no puede ser futura.
- **RN-PA-05**: La baja es lógica (`activo = false`): el paciente conserva su historial de turnos.
- **RN-PA-06**: Solo `ADMIN` y `RECEPCION` crean, editan o dan de baja. `PROFESIONAL` solo consulta.

## Dominio: Catálogo (RN-CA) — C03

- **RN-CA-01**: La matrícula del profesional es única.
- **RN-CA-02**: La duración de una prestación es un múltiplo de 5 minutos entre 10 y 240, ambos incluidos.
- **RN-CA-03**: El nombre del sillón/box es único.
- **RN-CA-04**: Profesionales, prestaciones y sillones se desactivan, no se borran: un turno histórico sigue mostrando sus datos.
- **RN-CA-05**: Un elemento inactivo no se ofrece para turnos nuevos; los turnos ya creados no cambian.
- **RN-CA-06**: Solo `ADMIN` crea, edita o desactiva. Los demás roles consultan.

## Dominio: Horarios, bloqueos y disponibilidad (RN-HO) — C04

- **RN-HO-01**: En una franja, la hora desde es anterior a la hora hasta.
- **RN-HO-02**: Las franjas de un mismo profesional y día no se superponen. Una franja que empieza justo cuando termina otra sí se permite (`[desde, hasta)`).
- **RN-HO-03**: Un bloqueo tiene desde < hasta y un motivo obligatorio.
- **RN-HO-04**: Un horario de inicio se ofrece como disponible solo si el intervalo completo `[inicio, inicio + duración)` entra dentro de una franja del profesional y no se superpone con un bloqueo ni con un turno del profesional cuyo estado ocupa agenda.
- **RN-HO-05**: Los inicios disponibles se ofrecen en pasos de 5 minutos dentro de cada franja. **Suposición** (ver SU-03).
- **RN-HO-06**: Solo `ADMIN` carga franjas y bloqueos; todos los roles consultan disponibilidad.

## Dominio: Turnos — creación (RN-TU) — C05

- **RN-TU-01**: Dos intervalos se superponen si `inicioA < finB` y `inicioB < finA` (semiabiertos `[inicio, fin)`). Un turno que empieza justo cuando termina otro **no** se superpone.
- **RN-TU-02**: Un profesional no puede tener dos turnos superpuestos que ocupen agenda.
- **RN-TU-03**: Un sillón no puede tener dos turnos superpuestos que ocupen agenda.
- **RN-TU-04**: Ocupan agenda los estados `RESERVADO`, `CONFIRMADO`, `ATENDIDO` y `AUSENTE`. `CANCELADO` no ocupa agenda.
- **RN-TU-05**: No hay sobreturnos: ningún rol puede saltear RN-TU-02 ni RN-TU-03.
- **RN-TU-06**: RN-TU-02 y RN-TU-03 se validan en el dominio (mensaje claro) **y** las garantiza la base de datos con restricciones de exclusión, incluso ante dos reservas simultáneas. Si la base rechaza, el servidor devuelve el mismo mensaje de conflicto.
- **RN-TU-07**: La hora de fin se calcula: `fin = inicio + duración de la prestación`.
- **RN-TU-08**: Solo se puede dar turno dentro de una franja de atención del profesional y fuera de sus bloqueos.
- **RN-TU-09**: No se pueden crear turnos con inicio en el pasado.
- **RN-TU-10**: Paciente, profesional, prestación y sillón deben estar activos.
- **RN-TU-11**: El turno se crea en estado `RESERVADO` y se registra en el historial (estado anterior nulo) con el usuario que lo creó.
- **RN-TU-12**: Solo `ADMIN` y `RECEPCION` crean turnos.

Mensajes de error acordados: "El profesional ya tiene un turno en ese horario", "El sillón ya está ocupado en ese horario", "El horario está fuera de la atención del profesional", "El profesional tiene un bloqueo en ese horario", "No se pueden dar turnos en el pasado".

## Dominio: Turnos — estados (RN-ES) — C06

- **RN-ES-01**: Transiciones válidas: `RESERVADO → CONFIRMADO`; `RESERVADO | CONFIRMADO → CANCELADO`; `RESERVADO | CONFIRMADO → ATENDIDO | AUSENTE`.
- **RN-ES-02**: `CANCELADO`, `ATENDIDO` y `AUSENTE` son finales: no cambian más.
- **RN-ES-03**: Cancelar exige motivo no vacío. Se puede cancelar en cualquier momento, sin plazo mínimo.
- **RN-ES-04**: Un turno cancelado deja de ocupar agenda: el horario queda libre para otro turno.
- **RN-ES-05**: Atendido o ausente solo se pueden marcar si el turno ya empezó (`inicio ≤ ahora`).
- **RN-ES-06**: Cada transición inserta un `HistorialTurno` con usuario, fecha, estado anterior, estado nuevo y motivo (si lo hay).
- **RN-ES-07**: Confirmar y cancelar: `ADMIN` y `RECEPCION`. Atendido/ausente: `ADMIN` y el `PROFESIONAL` vinculado al profesional del turno.
- **RN-ES-08**: Reprogramar no es una operación del MVP: se cancela con motivo y se crea un turno nuevo.

## Dominio: Excepciones globales (RN-GL)

- **RN-GL-01**: Nunca se usan datos reales de personas: seeds, tests, ejemplos y capturas son ficticios.
- **RN-GL-02**: Ninguna clave, contraseña ni cadena de conexión se versiona; solo `.env.example` con valores vacíos.
- **RN-GL-03**: Las fechas se muestran en hora de Argentina (`America/Argentina/Buenos_Aires`) y se guardan en UTC.
- **RN-GL-04**: Toda la interfaz usa exclusivamente los componentes de `src/components/ui` (regla de ESLint en CI).
- **RN-GL-05**: La lógica de negocio vive en `src/domain/` como funciones puras, testeables sin base de datos.

## Trazabilidad con el Discovery

| Regla del checklist (punto 7) | Códigos |
|---|---|
| 1. Sin sobreturnos (código + base) | RN-TU-02, 03, 05, 06 |
| 2. Intervalos `[inicio, fin)` | RN-TU-01, RN-HO-02 |
| 3. Duración por prestación | RN-TU-07, RN-CA-02 |
| 4. Dentro del horario y fuera de bloqueos | RN-TU-08, RN-HO-04 |
| 5. Cancelación sin plazo con motivo | RN-ES-03, 04 |
| 6. Cancelados no ocupan agenda | RN-TU-04, RN-ES-04 |
| 7. Historial con usuario y fecha | RN-TU-11, RN-ES-06 |
| 8. Permisos en el servidor | RN-AU-03 |
