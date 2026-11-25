# Decisiones y Supuestos

> Fuentes: `docs/restricciones-equipo.md`, checklist e informe de Discovery, `docs/evidencias/bitacora-fundacion.md`, respuestas del líder durante el Discovery (2026-11-25).

## Decisiones documentadas

### DD-01 — Un solo proyecto Next.js, sin backend separado
**Decisión**: front y back en Next.js (Server Actions y Route Handlers en `src/server/`).
**Contexto**: el líder evaluó un backend en Go.
**Alternativas consideradas**: Go, Express/NestJS aparte.
**Justificación**: la cátedra pide front y back en el mismo proyecto; un backend aparte duplica auth, tipos y deploy sin aportar al MVP.
**Trade-offs aceptados**: el backend queda acoplado al framework.

### DD-02 — Supabase + Prisma, sin Docker
**Decisión**: PostgreSQL, Auth y Storage en Supabase; Prisma como ORM y migraciones; nada local en contenedores.
**Contexto**: 6 personas con máquinas distintas y 3 días.
**Alternativas consideradas**: Postgres local con Docker; Supabase con su cliente JS en lugar de Prisma.
**Justificación**: cero instalación de base; migraciones versionadas; Vercel compila solo.
**Trade-offs aceptados**: base compartida entre todos (mitigado con DD-10).

### DD-03 — Integridad de agenda garantizada en la base de datos
**Decisión**: restricciones de exclusión (`btree_gist` + `tstzrange '[)'`) por profesional y por sillón, sobre los turnos que no están cancelados, además de la validación en el dominio.
**Contexto**: el Discovery mostró que ningún competidor garantiza a la vez profesional y sillón (informe C.2, C.4).
**Alternativas consideradas**: solo validación en código; bloqueo con `SELECT … FOR UPDATE`.
**Justificación**: es el diferencial del producto y resiste reservas simultáneas.
**Trade-offs aceptados**: SQL manual en una migración de Prisma; Prisma no lo modela en el esquema.

### DD-04 — Sin sobreturnos
**Decisión**: ningún rol puede forzar un turno superpuesto. Respuesta del líder: "No, nunca".
**Alternativas consideradas**: sobreturno con permiso de ADMIN (como Odonthia, Bilog o AgendaPro).
**Justificación**: coherente con DD-03 y con el MVP mínimo.
**Trade-offs aceptados**: un consultorio que necesite sobreturnar debe usar otro horario.

### DD-05 — Los turnos los carga solo el consultorio
**Decisión**: sin reserva online ni usuario paciente en el MVP.
**Justificación**: la reserva online exige portal público, validación de identidad y reglas de anticipación; no entra en el plazo (informe D.3).

### DD-06 — Cancelación sin plazo y con motivo obligatorio
**Decisión**: se cancela en cualquier momento; el motivo es obligatorio y queda en el turno y en el historial. Respuesta del líder: "Sin plazo, con motivo".
**Justificación**: trazabilidad (solo Dentally la tiene comprobada) sin agregar reglas de anticipación.

### DD-07 — Sistema de componentes único con ESLint en CI
**Decisión**: todos los controles en `src/components/ui` (shadcn/ui + Radix + tokens); prohibidos los controles HTML crudos fuera de esa carpeta.
**Contexto**: el líder pidió que nadie haga sus propios componentes.
**Justificación**: interfaz homogénea con 6 agentes de IA trabajando en paralelo; la regla es verificable.
**Trade-offs aceptados**: el líder es cuello de botella para componentes nuevos.

### DD-08 — Baja lógica
**Decisión**: pacientes, profesionales, prestaciones y sillones se desactivan.
**Justificación**: un turno histórico debe seguir mostrando sus datos.

### DD-09 — Estados del turno y estados que ocupan agenda
**Decisión**: `RESERVADO` (inicial), `CONFIRMADO`, `CANCELADO`, `ATENDIDO`, `AUSENTE`. Ocupan agenda todos menos `CANCELADO`.
**Contexto**: el plan del C01 pedía la constante `ESTADOS_QUE_OCUPAN_AGENDA` sin definir su contenido (ver IN-04).
**Justificación**: un turno atendido o ausente consumió ese horario; liberarlo permitiría crear turnos en el pasado con el mismo recurso.

### DD-10 — Solo el líder migra; los integrantes usan un rol sin DDL
**Decisión**: `prisma/schema.prisma` y las migraciones son del líder; los integrantes se conectan con `equipo_dev`.
**Justificación**: evita que un `migrate` accidental pise la base compartida.

### DD-11 — Deploy en Vercel
**Decisión**: Vercel gratuito conectado al repo, previews por PR; dominio propio barato opcional.

### DD-12 — Alcance acotado a la consigna
**Decisión del líder**: "todo lo que no sea parte de la consigna" queda fuera; nada que complejice el proyecto.

### DD-13 — Design system sin mockups por change
**Decisión**: política `system-only`: sistema visual aprobado una vez, sin mockups por cada change.
**Justificación**: no hay tiempo para un gate de mockups por change; la homogeneidad la da el sistema de componentes.

### DD-14 — Memoria de equipo local
**Decisión**: política de memoria `local` (Engram personal de cada integrante).
**Justificación**: Engram Cloud requiere un servidor propio; no vale la pena para 3 días.

### DD-15 - Un consultorio con invitaciones (no SaaS)
**Decisión**: un único consultorio por instalación. El dueño es ADMIN (creado por el seed) e invita al equipo por email con un rol; el invitado activa su cuenta. Sin registro público. Respuesta del líder: "Un consultorio + invitaciones".
**Alternativas consideradas**: solo seed sin pantalla; SaaS multi-consultorio con registro propio.
**Justificación**: cumple "sin registro público" de las restricciones, es realista para un consultorio y suma poco trabajo. El SaaS obligaría a agregar el consultorio a todas las tablas.
**Trade-offs aceptados**: depende del envío de emails de Supabase (límite bajo en el plan gratuito, ver P-06).

### DD-16 - Estadísticas simples para el dueño
**Decisión**: sección `/estadisticas` solo para ADMIN, calculada de los turnos existentes, sin tablas nuevas. Respuesta del líder: "Sí, versión simple".
**Justificación**: el dueño necesita ver ocupación, ausentismo y cancelaciones; el historial de estados ya tiene los datos.
**Trade-offs aceptados**: un change más (C08) a cargo del líder.

### DD-17 - Personal con los nombres del equipo y avatares 3D
**Decisión**: en el seed, las capturas y el design system, el personal del consultorio usa los nombres de los integrantes (Francisco ADMIN; Octavio y Ulises RECEPCION; Joaquín C., Lautaro y Joaquín E. PROFESIONAL) y todas las fotos de perfil son los 15 avatares 3D aportados por el líder, también para pacientes. Pedido del líder (2026-11-25).
**Justificación**: la demo y el video se entienden mejor con el equipo real como personal; las iniciales se veían pobres.
**Trade-offs aceptados**: los nombres del equipo quedan en un repo público (ya figuraban en las guías). Los pacientes siguen siendo inventados; el personal no lleva DNI ni datos personales reales. El seed pasa a 3 profesionales y 3 sillones.

### DD-18 - Ajustes técnicos del C01 por las versiones vigentes
**Decisión** (aprobada por el líder el 2026-11-25, D1 a D7 del explore): Next.js 16 con `src/proxy.ts` (antes `middleware.ts`); Prisma 7.10.1 fijo con `prisma.config.ts` y adapter `pg`; TypeScript 5.9; el C01 entrega primero los componentes que usan C02 a C08 y deja `range`, `color`, `file`, `month`, `week`, `url` y `hidden` para el final del mismo change; el seed carga franjas de lunes a viernes; el C01 deja la página de activar cuenta y el C07 envía las invitaciones.
**Justificación**: las versiones publicadas cambiaron nombres y configuración respecto de lo que asumía la KB; el plazo pide priorizar lo que desbloquea al equipo.
**Trade-offs aceptados**: no se usa TypeScript 7 ni Prisma 8 (RC). Detalle en `docs/explore/base-tecnica.md`.

## Supuestos inferidos

### SU-01 — Un único consultorio
**Supuesto**: no hay multi-sucursal ni multi-tenant.
**Origen**: informe D.3 (multi-sucursal fuera del MVP).
**Riesgo si es falso**: habría que agregar `consultorioId` a casi todas las tablas.
**Cómo validar**: confirmado por el alcance; revisar si se suma multi-sucursal.

### SU-02 — Zona horaria fija
**Supuesto**: todo el consultorio opera en `America/Argentina/Buenos_Aires` (UTC−3, sin horario de verano).
**Origen**: mercado argentino (restricciones del equipo).
**Riesgo si es falso**: errores de una hora en franjas y turnos.
**Cómo validar**: tests de dominio con fechas en esa zona.

### SU-03 — Granularidad de 5 minutos
**Supuesto**: la disponibilidad ofrece inicios cada 5 minutos.
**Origen**: las duraciones de prestación son múltiplos de 5 (RN-CA-02).
**Riesgo si es falso**: demasiadas opciones en pantalla; se puede cambiar a 15 sin tocar el modelo.
**Cómo validar**: definirlo en la spec del C04.

### SU-04 — La duración del turno la fija la prestación
**Supuesto**: recepción no edita la hora de fin; se guarda la calculada y no cambia si después se modifica la prestación.
**Origen**: checklist, regla 3; guía del C05.
**Riesgo si es falso**: haría falta un campo de duración editable.

### SU-05 — Un usuario PROFESIONAL está vinculado a un solo profesional
**Supuesto**: `Usuario.profesionalId` único.
**Origen**: regla "el PROFESIONAL dueño del turno" (guía del C06).
**Riesgo si es falso**: no se podría saber qué turnos son propios.

### SU-06 - Gestión de usuarios (resuelto)
Resuelto por DD-15: pantalla Equipo con invitaciones (C07).
