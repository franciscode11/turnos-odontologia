# Descripción General

> Fuentes: `docs/restricciones-equipo.md` (sección 2), `equipo/04-plan-lider.md` (Supabase y C01).

## Stack tecnológico

| Capa | Tecnologías | Versión mínima / nota |
|---|---|---|
| Lenguaje | TypeScript estricto | 5.x |
| Framework (front + back) | Next.js App Router: Server Components, Server Actions y Route Handlers | 15+ (la que instale `create-next-app` al hacer el C01) |
| Runtime | Node.js LTS + npm | Node 20+ |
| Estilos | Tailwind CSS + tokens de `design-system/tokens.css` | 4.x |
| Componentes de UI | Sistema propio en `src/components/ui` (base shadcn/ui + Radix) | Único permitido |
| Formularios y validación | react-hook-form + Zod (mismo esquema en cliente y servidor) | — |
| Base de datos | PostgreSQL gestionado en Supabase (región us-west-2, Oregón; se planificó São Paulo y el proyecto quedó creado en esa región) con extensión `btree_gist` | Postgres 15+ |
| ORM y migraciones | Prisma | Migraciones versionadas en `prisma/migrations/` |
| Autenticación | Supabase Auth (email + contraseña, registro público desactivado) | `@supabase/ssr` |
| Archivos | Supabase Storage (buckets privados) | Sin uso funcional en el MVP |
| Tests | Vitest (dominio puro, sin base de datos) | — |
| CI | GitHub Actions: lint + typecheck + test en cada PR | — |
| Deploy | Vercel (plan gratuito) + Supabase en la nube; dominio propio opcional | — |
| Contenedores | Ninguno (sin Docker) | — |

## Arquitectura general

Un único proyecto Next.js contiene la interfaz y el servidor. No hay backend separado.

```
Navegador ──► Next.js (Vercel)
               ├─ src/app/(panel)/…        páginas (Server Components) + formularios cliente
               ├─ src/server/<modulo>/     Server Actions: auth + rol + validación Zod + Prisma
               ├─ src/domain/<modulo>/     reglas de negocio puras (sin I/O, testeadas con Vitest)
               └─ proxy (src/proxy.ts)      exige sesión en las rutas del panel
                        │
                        ├──► Supabase Auth     (sesión por cookies)
                        └──► PostgreSQL (Supabase) vía Prisma
                               └─ restricciones de exclusión anti-solapamiento
```

**Justificación.** La consigna exige front y back en el mismo proyecto. Un solo lenguaje, un solo deploy y una sola sesión de auth reducen la carga para 6 personas en 3 días. La lógica de dominio pura permite correr los tests sin credenciales. La base de datos es la última garantía de integridad de la agenda (ver DD-03 en `09_decisiones_y_supuestos.md`).

## Integraciones externas

| Servicio | Propósito | Tipo |
|---|---|---|
| Supabase Auth | Sesiones, credenciales e invitaciones por email (`inviteUserByEmail`) | SDK (`@supabase/ssr`, admin API solo en el servidor) |
| Supabase PostgreSQL | Persistencia | Conexión Postgres vía Prisma (pooler) |
| Vercel | Hosting y previews por PR | Integración con GitHub |

No hay integraciones con WhatsApp, pasarelas de pago, ARCA ni obras sociales en el MVP.

## API del servidor

No se expone una API REST pública. Las operaciones son **Server Actions** agrupadas por módulo en `src/server/<modulo>/`. Cada acción: (1) obtiene la sesión, (2) llama a `requireRol([...])`, (3) valida la entrada con Zod, (4) aplica la regla de dominio, (5) persiste con Prisma, y (6) devuelve un resultado tipado `{ ok: true, data } | { ok: false, error }`.

| Módulo | Acciones principales | Change |
|---|---|---|
| `auth` | iniciar sesión, cerrar sesión, `requireRol` | C01 |
| `pacientes` | crear, buscar, editar, dar de baja | C02 |
| `catalogo` | ABM de profesionales, prestaciones y sillones; desactivar | C03 |
| `horarios` | ABM de franjas y bloqueos; calcular disponibilidad | C04 |
| `turnos` (creación) | crear turno | C05 |
| `turnos` (estados) | confirmar, cancelar, marcar atendido, marcar ausente | C06 |
| `equipo` | invitar, reenviar o revocar invitación, cambiar rol, desactivar usuario, activar cuenta | C07 |
| `estadisticas` | calcular indicadores del período (solo lectura) | C08 |
