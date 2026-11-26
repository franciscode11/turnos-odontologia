# Tasks

> Todo dentro de la Zona de C-04: `src/domain/horarios/`, `src/server/horarios/`, `src/app/(panel)/configuracion/horarios/`, `tests/horarios/`. No se modifican `prisma/schema.prisma`, `src/components/ui/`, `src/domain/shared/` ni el layout. TDD: en cada tarea, primero el test del escenario (rojo), después la implementación mínima (verde). Requiere C-01 mergeado en `main`.

## 1. Preparación

- [x] 1.1 Actualizar la rama con `main` (con C-01 mergeado) y confirmar las firmas de C-01 que usa el design (`seSuperponen`, `ESTADOS_QUE_OCUPAN_AGENDA`, `ocupaAgenda`, `aInstante`, `rangoDelDia`, `formatearHora`, `requireRol`, `src/server/resultado.ts`, componentes de `src/components/ui`). Verificación: `npm install && npm test` en verde antes de empezar; si alguna firma difiere, anotarlo en `design.md` antes de seguir.

## 2. Dominio de franjas (RN-HO-01, RN-HO-02)

- [x] 2.1 `src/domain/horarios/constantes.ts` y `horas.ts` (`parsearHora`, `formatearMinutos`, formato `HH:mm` 00:00-23:59). Verificación: `tests/horarios/horas.test.ts` con `"09:30"` → 570, `"24:00"` y `"9:5"` inválidos, en verde.
- [x] 2.2 `validarFranja` en `src/domain/horarios/franjas.ts`. Verificación: tests "Franja válida", "Franja invertida" y "Franja de duración cero" (RN-HO-01) en verde.
- [x] 2.3 `franjasSeSuperponen` y `validarFranjaContraExistentes` reutilizando `seSuperponen`. Verificación: tests "Franja superpuesta el mismo día", "Franja contigua", "Mismo horario en otro día o de otro profesional", "Franja contenida en otra", "Extender una franja" y "Edición que genera superposición" (RN-HO-02) en verde.

## 3. Dominio de bloqueos (RN-HO-03)

- [x] 3.1 `validarBloqueo` en `src/domain/horarios/bloqueos.ts`. Verificación: tests "Bloqueo válido de un día", "Bloqueo sin motivo" (motivo con solo espacios), "Bloqueo con hasta anterior o igual a desde" y "Bloqueo de varios días" (RN-HO-03) en verde.

## 4. Dominio de disponibilidad (RN-HO-04, RN-HO-05, RN-TU-04)

- [x] 4.1 `diaSemanaIso` (C-01 ya lo expone en `src/domain/shared/fechas.ts`: se reutiliza y no se crea `src/domain/horarios/dia-semana.ts`). Verificación: `tests/horarios/dia-semana.test.ts` con 30/11/2026 → 1 y 01/12/2026 → 2, en verde con `TZ=UTC` y `TZ=Europe/Madrid`.
- [x] 4.2 `calcularDisponibilidad` con franjas, paso de 5 minutos y duración. Verificación: tests "Lunes sin turnos ni bloqueos" (31 inicios), "Duración que ocupa la franja entera", "Duración mayor que la franja", "Dos franjas en el mismo día" y "Turno que cruzaría dos franjas contiguas" (RN-HO-04, RN-HO-05) en verde.
- [x] 4.3 Descarte por bloqueos. Verificación: tests "Bloqueo de 10:00 a 11:00", "Bloqueo de todo el día" y "Bloqueo que empieza el día anterior" (RN-HO-04, RN-TU-01) en verde.
- [x] 4.4 Descarte por turnos que ocupan agenda con `ocupaAgenda`. Verificación: tests "Turno reservado", "Turno cancelado no resta", "Turno ausente sigue restando", "Sillón ocupado por otro profesional" y "Turnos de otro día no afectan" (RN-TU-04, IN-05) en verde.
- [x] 4.5 Escenario de zona horaria. Verificación: test "Servidor en otra zona horaria" (primer inicio 2026-11-30T12:00:00Z) en verde con `TZ=UTC` y `TZ=Europe/Madrid` (RN-GL-03).

## 5. Esquemas de validación

- [x] 5.1 `src/domain/horarios/esquemas.ts` con los esquemas Zod de franja, bloqueo y consulta (duración múltiplo de 5 entre 10 y 240, fecha `AAAA-MM-DD`, motivo con `trim`). Verificación: `tests/horarios/esquemas.test.ts` con "Duración inválida" (7 minutos, RN-CA-02), fecha `2026-13-45` y motivo vacío, en verde.

## 6. Server Actions (RN-HO-06, RN-AU-03)

- [x] 6.1 `src/server/horarios/franjas.ts` ("use server", delega en `crearAccionesHorarios` de `acciones.ts`): `crearFranja`, `editarFranja`, `eliminarFranja` con `requireRol(["ADMIN"])`, Zod, transacción y dominio. Verificación: tests con dependencias simuladas en `tests/horarios/acciones-franjas.test.ts` (doble en memoria `tests/horarios/doble-repositorio.ts`) para "ADMIN carga una franja", "RECEPCION intenta cargar una franja" ("Sin permisos"), "Acción sin sesión" ("No autenticado") y rechazo por superposición sin escritura, en verde.
- [x] 6.2 `src/server/horarios/bloqueos.ts`: `crearBloqueo`, `editarBloqueo`, `eliminarBloqueo` con `requireRol(["ADMIN"])` y conversión con `aInstante`. Verificación: tests con dependencias simuladas para "ADMIN carga un bloqueo", "PROFESIONAL intenta cargar un bloqueo", "Guardado en UTC" (10:00 → 13:00Z), "Bloqueo que termina a la medianoche" y "Modificación que deja el motivo vacío", en verde.
- [x] 6.3 `src/server/horarios/disponibilidad.ts`: `consultarDisponibilidad` con `requireRol(["ADMIN", "RECEPCION", "PROFESIONAL"])`, verificación de profesional activo y carga de turnos filtrados por `ESTADOS_QUE_OCUPAN_AGENDA` en `rangoDelDia`. Verificación: tests con dependencias simuladas para "PROFESIONAL consulta la agenda de un colega", "Profesional inactivo", "Consulta sin sesión" y "Profesional que no atiende ese día", en verde.
- [x] 6.4 `src/server/horarios/consultas.ts` (profesionales activos, franjas por profesional, bloqueos). Verificación: `npm run typecheck` sin errores.

## 7. Pantalla `/configuracion/horarios`

- [ ] 7.1 Reemplazar el placeholder de `src/app/(panel)/configuracion/horarios/page.tsx` por el Server Component con selector de profesional y sección "Horario semanal" (Table por día, Dialog de alta, edición y eliminación con FormField y selector de hora; controles solo para ADMIN) y `loading.tsx` con Skeleton. Verificación: `npm run lint` sin errores (regla de controles nativos, RN-GL-04); con el seed, ADMIN carga lunes 12:00-14:00 junto a 09:00-12:00 y ve ambas; carga 11:00-14:00 y ve el error de superposición.
- [ ] 7.2 Sección "Bloqueos" (Table con fechas en hora de Argentina, Dialog con selector fecha-hora y motivo). Verificación: con el seed, ADMIN carga "Congreso de endodoncia" el 30/11/2026 10:00-11:00 y lo ve en la lista; un usuario RECEPCION ve la lista sin controles de edición.
- [ ] 7.3 Sección "Disponibilidad del día" (profesional, fecha, duración o prestación para precargarla, inicios agrupados por franja y estados vacíos). Verificación: con el seed, un usuario PROFESIONAL consulta un lunes con 30 minutos y ve los inicios sin los que pisan el bloqueo de 10:00-11:00; un martes sin franjas muestra "El profesional no atiende ese día".

> **Estado del apply (2026-11-25):** 7.1, 7.2 y 7.3 están implementadas (página, `loading.tsx` y `_componentes/`) y pasan lint, typecheck y build, pero quedan sin marcar porque su verificación pide el seed en una base real y un navegador con sesión de ADMIN, RECEPCION y PROFESIONAL (este apply se hizo sin `.env` ni base). 8.2 queda sin marcar porque la captura de `docs/evidencias/` necesita la pantalla corriendo con datos; además el `main` local de este worktree no está actualizado, así que `git diff --stat main` lista todo C-01: el alcance se revisó con `git status` (solo archivos de la Zona de C-04, `openspec/changes/horarios-disponibilidad/` y `docs/explore/`).

## 8. Verificación integral

- [x] 8.1 Correr `npm test`, `npm run lint` y `npm run typecheck`. Verificación: los tres en verde y cada escenario de `specs/` tiene un test con su código RN en el nombre (tabla escenario → test en el verify).
- [ ] 8.2 Revisar el alcance con `git diff --stat main`. Verificación: solo aparecen archivos de la Zona de C-04, `openspec/changes/horarios-disponibilidad/`, `docs/explore/` y `docs/evidencias/`; captura de la pantalla guardada en `docs/evidencias/`.

## Workflow follow-up

- Lautaro y el líder confirman las decisiones por defecto D1 (pasos de 5 minutos), D2 (sin filtro por sillón), D3, D4 y D11 antes de apply; si cambian, se ajustan specs y tasks con "Ajustar".
- Archivar el change después de la revisión del líder (sin modificar `CHANGES.md` ni `.active-orchestrator-state.json`).
- Abrir el PR de `C-04-horarios` solo cuando Lautaro lo autorice.
