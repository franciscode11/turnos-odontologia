# Actores y Roles

> Fuentes: checklist de Discovery (punto 2), `docs/restricciones-equipo.md`, reglas candidatas de las guías de los integrantes (`equipo/integrantes/`).

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|---|---|---|
| ADMIN | Responsable del consultorio. | Configura catálogo, horarios, bloqueos y usuarios. Puede hacer todo lo que hace recepción y marcar asistencia de cualquier turno. |
| RECEPCION | Personal administrativo. | Gestiona pacientes; crea, confirma y cancela turnos. |
| PROFESIONAL | Odontólogo con usuario propio vinculado a un registro de `Profesional`. | Consulta agenda, pacientes y disponibilidad; marca atendido/ausente **solo en sus propios turnos**. |
| Paciente | Persona atendida. | No tiene usuario en el MVP. |
| Sistema | Base de datos y servidor. | Rechaza solapamientos aunque la interfaz falle; registra el historial. |

Un usuario tiene **un solo rol**. No hay registro público: el primer ADMIN (dueño) lo crea el seed y el resto del equipo entra por **invitación** del ADMIN desde Equipo.

## RBAC: matriz de permisos

C = crear · R = consultar · U = editar · D = desactivar/baja lógica · - = sin acceso. Se controla **en el servidor** (`requireRol` en cada Server Action), no solo ocultando botones.

| Recurso / acción | ADMIN | RECEPCION | PROFESIONAL |
|---|---|---|---|
| Usuarios e invitaciones (Equipo) | CRUD (invitar, cambiar rol, desactivar) | - | - |
| Estadísticas | R | - | - |
| Pacientes | CRUD | CRUD | R |
| Profesionales | CRUD | R | R |
| Prestaciones | CRUD | R | R |
| Sillones | CRUD | R | R |
| Horarios de atención | CRUD | R | R |
| Bloqueos | CRUD | R | R |
| Disponibilidad | R | R | R |
| Turnos: listar y ver detalle | R | R | R |
| Turnos: crear | C | C | - |
| Turnos: confirmar | ✔ | ✔ | - |
| Turnos: cancelar (con motivo) | ✔ | ✔ | - |
| Turnos: marcar atendido / ausente | ✔ (cualquier turno) | - | ✔ (solo turnos propios) |
| Historial del turno | R | R | R |
| Catálogo de componentes `/dev/componentes` | R | R | R |

## Rutas públicas

- `/login`: inicio de sesión.
- `/activar-cuenta`: activación desde el enlace de invitación (solo con un token válido).
- Recursos estáticos de Next.js.

Todo lo demás (grupo de rutas `(panel)`) exige sesión válida en el proxy (`src/proxy.ts`) y, además, rol en cada acción.

## Rutas del panel

| Ruta | Contenido | Change |
|---|---|---|
| `/` | Inicio del panel (redirige a `/turnos`) | C01 |
| `/pacientes` | Listado, búsqueda, alta y edición | C02 |
| `/configuracion/profesionales` | ABM profesionales | C03 |
| `/configuracion/prestaciones` | ABM prestaciones | C03 |
| `/configuracion/sillones` | ABM sillones | C03 |
| `/configuracion/horarios` | Franjas, bloqueos y disponibilidad del día | C04 |
| `/turnos` | Turnos del día (solo lectura) | C01 |
| `/turnos/nuevo` | Crear turno | C05 |
| `/turnos/[id]` | Detalle, acciones de estado e historial | C06 |
| `/equipo` | Miembros, roles e invitaciones (solo ADMIN) | C07 |
| `/estadisticas` | Indicadores del consultorio (solo ADMIN) | C08 |
| `/dev/componentes` | Catálogo del sistema de componentes | C01 |
