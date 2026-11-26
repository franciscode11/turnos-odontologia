# Explore: C-04 horarios-bloqueos-disponibilidad

- **Fecha:** 2026-11-25
- **Responsable:** lautaro-de-coninck (legajo 51954). Relevamiento preparado con IA para que Lautaro lo revise.
- **Rama de trabajo:** `lautaro-c04-local` (local, sin upstream). La rama del equipo es `C-04-horarios`.
- **Modo:** SDD (ciclo OPSX). Governance: MEDIO (lógica de negocio con checkpoints).
- **Change OpenSpec:** `horarios-disponibilidad`.
- **Fuentes leídas:** ficha `[C-04]` de `CHANGES.md`, `AGENTS.md`, `equipo/integrantes/lautaro-de-coninck.md`, `knowledge-base/03`, `04` §HorarioAtencion/§Bloqueo/§Turno, `05` §RN-HO/§RN-TU/§RN-GL, `06` US-030/US-031, `07` Flujo 2 y Flujo 4, `08`, `09` SU-03, `10` IN-02/IN-05/P-04, y el change `openspec/changes/base-tecnica/` (proposal, design, tasks y specs).

## 1. Qué pide la ficha y de qué depende

**Resultado verificable (ficha C-04):**
1. El ADMIN carga franjas semanales y bloqueos por profesional en `/configuracion/horarios`.
2. Una franja superpuesta se rechaza y una contigua se acepta.
3. La disponibilidad de un lunes 09:00-12:00 para 30 minutos devuelve inicios de 09:00 a 11:30 y excluye bloqueos y turnos que ocupan agenda.
4. Los tests pasan.

**Scope de la ficha:**
- Dominio puro: `validarFranja`, `franjasSeSuperponen`, `calcularDisponibilidad(franjas, bloqueos, turnos, fecha, duracion)` usando `seSuperponen` y `ESTADOS_QUE_OCUPAN_AGENDA` de `src/domain/shared/`.
- Server Actions: ABM de franjas y bloqueos (solo ADMIN) y consulta de disponibilidad (todos los roles).
- Pantalla: horario semanal por profesional, lista de bloqueos y vista de disponibilidad del día.
- Tests: disponibilidad feliz, franja superpuesta, franja contigua (borde), bloqueo, turnos cancelados no restan. US-030 y US-031.

**Zona permitida:** `src/app/(panel)/configuracion/horarios/`, `src/domain/horarios/`, `src/server/horarios/`, `tests/horarios/` (más `openspec/changes/horarios-disponibilidad/`, `docs/explore/` y `docs/evidencias/`).

**Dependencias:** solo C-01 (`base-tecnica`), que hoy está `[ ]` y se implementa en paralelo. Todavía no existen `src/` ni `prisma/` en el repo: este relevamiento se basa en el **contrato** de las specs de C-01, no en código. Al mergear C-01 hay que repasar que los nombres coincidan (riesgo ya anotado en el design de C-01).

**Fuera de alcance:** crear turnos (C-05), validar franjas al crear un turno (C-05 lo hace con su propia función, IN-02), estados de turno (C-06), modificar el esquema, los componentes compartidos o el menú.

## 2. Reglas de negocio que aplican

| Código | Regla (resumen) | Dónde se cubre |
|---|---|---|
| RN-HO-01 | En una franja, desde < hasta. | `validarFranja` + Zod |
| RN-HO-02 | Franjas del mismo profesional y día no se superponen; contigua `[desde, hasta)` sí se permite. | `franjasSeSuperponen` |
| RN-HO-03 | Bloqueo con desde < hasta y motivo obligatorio. | `validarBloqueo` + Zod |
| RN-HO-04 | Un inicio es disponible solo si `[inicio, inicio + duración)` entra entero en una franja y no se superpone con un bloqueo ni con un turno que ocupa agenda. | `calcularDisponibilidad` |
| RN-HO-05 | Inicios en pasos de 5 minutos dentro de cada franja (suposición SU-03). | `calcularDisponibilidad` |
| RN-HO-06 | Solo ADMIN carga franjas y bloqueos; todos los roles consultan disponibilidad. | `requireRol` en cada Server Action |
| RN-TU-01 | Superposición de intervalos semiabiertos: `inicioA < finB` y `inicioB < finA`. | `seSuperponen` (C-01) |
| RN-TU-04 | Ocupan agenda RESERVADO, CONFIRMADO, ATENDIDO y AUSENTE; CANCELADO no. | `ESTADOS_QUE_OCUPAN_AGENDA` (C-01) |
| RN-AU-03 / RN-AU-04 / RN-AU-05 | Permisos en el servidor, sesión obligatoria, solo usuarios activos. | `requireRol` (C-01) |
| RN-CA-02 | Duración múltiplo de 5 entre 10 y 240 (para validar la duración pedida). | Zod de la consulta |
| RN-CA-05 | Un elemento inactivo no se ofrece para turnos nuevos. | Selector de profesionales activos |
| RN-GL-01, 03, 04, 05 | Datos ficticios; UTC y hora de Argentina; solo `src/components/ui`; lógica en `src/domain/`. | Todo el change |

Matriz de permisos (KB 03): "Horarios de atención: ADMIN CRUD, RECEPCION R, PROFESIONAL R". La ruta `/configuracion/horarios` muestra franjas, bloqueos y disponibilidad del día.

## 3. Qué reutiliza de C-01 (según su contrato)

| Pieza de C-01 | Uso en C-04 |
|---|---|
| Modelo `HorarioAtencion` (`profesionalId`, `diaSemana` 1-7 ISO, `horaDesde`/`horaHasta` `"HH:mm"`) | Persistencia de franjas. Sin `activo`: la baja de una franja es física (no tiene turnos asociados). |
| Modelo `Bloqueo` (`profesionalId`, `desde`/`hasta` timestamptz, `motivo`) con `CHECK desde < hasta` | Persistencia de bloqueos; la base es la segunda barrera de RN-HO-03. Baja física (no tiene turnos asociados). |
| Modelo `Turno` (`inicio`, `fin`, `estado`) | Lectura de los turnos del profesional en el día para restar disponibilidad. |
| Modelo `Profesional` (`activo`) | Selector de profesional (solo activos para disponibilidad, RN-CA-05). |
| `src/domain/shared/intervalos.ts` → `seSuperponen({inicio, fin}, {inicio, fin})` | Única definición de superposición (RN-TU-01). Las franjas `"HH:mm"` se convierten a minutos o a instantes para reutilizarla. |
| `src/domain/shared/estados.ts` → `ESTADOS_QUE_OCUPAN_AGENDA`, `ocupaAgenda` | Filtrar turnos que restan disponibilidad (RN-TU-04). |
| `src/domain/shared/fechas.ts` → `aInstante(fecha, hora)`, `formatearFecha`, `formatearHora`, `rangoDelDia` | Convertir la franja del día a instantes UTC, mostrar horas en Argentina y consultar bloqueos y turnos del día. |
| `src/server/auth/permisos.ts` → `requireRol(roles)` (errores `NoAutenticado` / `SinPermisos`) | Primer paso de cada Server Action (Flujo 2). |
| `src/server/resultado.ts` → `{ ok: true, data } \| { ok: false, error, campos? }` | Resultado estándar de las acciones. |
| `src/server/db.ts` (cliente Prisma) | Lectura y escritura. |
| `src/components/ui` (FormField, Select, selector de hora y fecha-hora propios, Textarea, Button, Card, Table, Dialog, Badge, Toast, Skeleton, estado vacío, Avatar) | Toda la pantalla, sin controles nativos (RN-GL-04, regla de ESLint). |
| Placeholder `src/app/(panel)/configuracion/horarios/` con verificación de rol, menú "Horarios" en el layout | Se reemplaza el placeholder dentro de la Zona; el menú no se toca. |
| Carpetas `src/domain/horarios`, `src/server/horarios`, `tests/horarios` con `.gitkeep` | Destino de los archivos nuevos. |
| Seed con franjas de lunes a viernes para los 3 profesionales y turnos de ejemplo | Datos para probar la pantalla sin cargar nada. |

**Hueco detectado en el contrato:** `fechas.ts` de C-01 no declara una función para obtener el día de la semana ISO de una fecha calendario. C-04 la resuelve con una función pura propia en `src/domain/horarios/` (calcula el día a partir de `AAAA-MM-DD`, sin depender de la zona del servidor), sin tocar `src/domain/shared/`.

## 4. Dudas abiertas

Las dos preguntas abiertas de la KB se resuelven con la propuesta que ya trae la KB como valor por defecto. **Todas quedan a confirmar por Lautaro y el líder.**

| # | Duda | Valor por defecto propuesto | Fuente |
|---|---|---|---|
| D1 | ¿Pasos de 5 o de 15 minutos para los inicios disponibles? | **5 minutos**, como constante `PASO_MINUTOS = 5` en `src/domain/horarios/` para poder cambiarla a 15 sin tocar el modelo. | SU-03, RN-HO-05 · **a confirmar por Lautaro y el líder** |
| D2 | ¿La disponibilidad filtra también por sillón libre? | **No**: solo profesional (franjas, bloqueos y turnos del profesional). Si el sillón está ocupado, C-05 rechaza al crear con "El sillón ya está ocupado en ese horario". | IN-05, P-04 · **a confirmar por Lautaro y el líder** |
| D3 | ¿Se ofrecen inicios ya pasados si se consulta el día de hoy? | **Sí se listan** (RN-HO-04 no menciona el pasado; RN-TU-09 aplica al crear el turno, en C-05). | No definido en la KB · a confirmar por Lautaro y el líder |
| D4 | ¿Se puede cargar un bloqueo que se superpone con turnos ya reservados? | **Sí**: la KB no lo prohíbe; los turnos existentes no cambian y la pantalla no los cancela. | No definido en la KB · a confirmar por Lautaro y el líder |
| D5 | ¿Se permite modificar o borrar una franja que deja turnos existentes fuera del horario? | **Sí**, sin efecto sobre los turnos existentes (la franja no tiene relación con el turno). | No definido en la KB · a confirmar por Lautaro y el líder |
| D6 | ¿Pueden superponerse dos bloqueos del mismo profesional? | **Sí**: RN-HO-03 solo exige desde < hasta y motivo; ambos restan disponibilidad. | No definido en la KB · a confirmar por Lautaro y el líder |
| D7 | ¿La duración de la consulta de disponibilidad se elige libre o por prestación? | Se ingresa la **duración en minutos** (opcionalmente precargada eligiendo una prestación activa), validada con el rango de RN-CA-02 (10 a 240, múltiplo de 5). | Flujo 4 dice "duración"; RN-CA-02 · a confirmar por Lautaro y el líder |
| D8 | Formato y límites de `"HH:mm"`: ¿una franja puede terminar a las 24:00? | `"HH:mm"` de `00:00` a `23:59`; una franja no cruza la medianoche. | KB 04 (franja en hora local) · a confirmar por Lautaro y el líder |
| D9 | ¿Borrado físico o lógico de franjas y bloqueos? | **Físico**: los modelos no tienen `activo` ni turnos asociados; la regla de baja lógica aplica a entidades con turnos. | KB 04 §Convenciones · a confirmar con el líder |
| D11 | Con franjas contiguas (09:00-12:00 y 12:00-14:00), ¿se ofrece un inicio que cruza el límite (11:45 para 30 minutos)? | **No**: lectura literal de RN-HO-04 ("entra dentro de una franja"). Si se quiere unir franjas contiguas, hay que ajustar la regla en la KB. | RN-HO-04 · a confirmar por Lautaro y el líder |
| D10 | Concurrencia: dos ADMIN cargando franjas superpuestas a la vez | Se valida en el dominio dentro de una transacción; la base no tiene restricción de exclusión para franjas (la KB dice "validado en dominio, C04"). Riesgo bajo (un solo ADMIN típico). | KB 04 · a confirmar con el líder si hace falta más |

Además: como C-01 todavía no está mergeado, los nombres exactos (`aInstante`, `requireRol`, `ocupaAgenda`, componentes de UI) se verifican al actualizar la rama con `main`; si difieren, se ajusta la spec en apply.

## 5. Próximo paso

PROPOSE con `openspec new change horarios-disponibilidad`: proposal, specs (franjas, bloqueos, disponibilidad), design (incluye `## UI Mockups` con `Decision: no (project policy)`, modo `system-only`, Revision 3) y tasks dentro de la Zona.
