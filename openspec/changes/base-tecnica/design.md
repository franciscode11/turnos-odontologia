# Design

## Context

Repo sin código (ver proposal.md, Why). Las fuentes de verdad son `knowledge-base/` (modelo en 04, roles en 03, arquitectura en 08), el design system en `design-system/` y las decisiones DD-17 y DD-18. Las versiones vigentes y sus cambios de configuración están relevados en `docs/explore/base-tecnica.md` §3. Restricciones duras de `AGENTS.md`: el agente no lee ni escribe `.env`; solo el líder migra; nada de datos reales de pacientes.

## Goals / Non-Goals

**Goals**
- Que C-02 a C-08 puedan trabajar en paralelo sin tocar archivos compartidos.
- Que `npm install && npm test` y el CI pasen sin credenciales ni base.
- Que las reglas de agenda tengan una sola definición en el dominio y una garantía en la base.

**Non-Goals**
- Pantallas de ABM (son de C-02 a C-06), invitaciones (C-07), estadísticas (C-08).
- Tests contra la base de datos en el CI.
- Modo oscuro, internacionalización, deploy.

## Decisions

### 1. Estructura y herramientas
Next.js 16 App Router con `src/`, TypeScript 5.9 estricto (`strict`, `noUncheckedIndexedAccess`), Tailwind 4 configurado en `globals.css` con `@theme` a partir de `design-system/tokens.css`, ESLint 10 flat config, Vitest 5 con entorno `node` para el dominio. Versiones exactas en `package.json` y `package-lock.json` versionado.
*Alternativas:* TypeScript 7 (descartado por compatibilidad no comprobada con el plazo, DD-18).

### 2. Prisma 7 con Supabase
- `prisma.config.ts` en la raíz toma `DIRECT_URL` (conexión directa, puerto 5432) para migrar. Si la variable no existe, usa una URL vacía de relleno para que `prisma generate` funcione en el CI sin secretos.
- Generador `prisma-client` con salida en `src/generated/prisma` (ignorada por git; se genera en `postinstall`).
- En runtime, `src/server/db.ts` crea un único cliente con `@prisma/adapter-pg` sobre `DATABASE_URL` (pooler de transacciones, 6543) y lo reutiliza en desarrollo con `globalThis`.
- Tablas y columnas en `snake_case` con `@@map`/`@map`; modelos en PascalCase como en la KB.
*Alternativas:* Supabase JS para datos (descartado: la KB fija acceso solo vía Prisma y Data API cerrada).

### 3. SQL que Prisma no modela
La primera migración se crea con `prisma migrate dev --create-only` y se le agrega a mano: `CREATE EXTENSION IF NOT EXISTS btree_gist`, las dos restricciones `EXCLUDE USING gist (... WITH =, tstzrange(inicio, fin, '[)') WITH &&) WHERE (estado <> 'CANCELADO')`, los `CHECK` de intervalos, motivo y duración, el índice único parcial `(dni) WHERE activo` y los `REVOKE` de `anon` y `authenticated` sobre el esquema `public`. Después de aplicarla, `prisma migrate diff` debe quedar sin diferencias.
*Alternativa:* validar solo en código (descartado, RN-TU-06).

### 4. Dominio compartido
`src/domain/shared/`: `estados.ts` (`ESTADOS_QUE_OCUPAN_AGENDA`, `ESTADOS_FINALES`, `ocupaAgenda`), `intervalos.ts` (`seSuperponen` sobre `{ inicio: Date; fin: Date }`), `fechas.ts` (zona `America/Argentina/Buenos_Aires` con `Intl`, sin librerías: `aInstante(fecha, hora)`, `formatearFecha`, `formatearHora`, `rangoDelDia`). Funciones puras con tests en `tests/shared/`. La fecha actual se inyecta como parámetro para poder fijarla en tests.

### 5. Autenticación y autorización
- `@supabase/ssr`: cliente de servidor con cookies en `src/server/auth/supabase.ts`; el cliente de navegador solo usa la publishable key.
- `src/proxy.ts` refresca la sesión y redirige a `/login` toda ruta que no sea `/login`, `/activar-cuenta` o estática. Verifica con `getClaims()` (valida la firma del JWT), nunca con la sesión sin verificar.
- `src/server/auth/sesion.ts`: `obtenerUsuarioActual()` lee el id verificado y carga la fila de `Usuario`; si falta o no es `ACTIVO`, cierra sesión.
- `src/server/auth/permisos.ts`: `requireRol(roles)` devuelve el usuario o lanza un error tipado (`NoAutenticado` / `SinPermisos`); la matriz de 03 vive en `src/server/auth/matriz.ts` y también alimenta el menú. La parte pura (decidir si un rol puede) se testea sin base.
- Resultado estándar de las acciones: `{ ok: true, data } | { ok: false, error, campos? }` en `src/server/resultado.ts`.
- Activación: el enlace de invitación de Supabase llega a `/activar-cuenta` con `token_hash` y `type=invite`; la página verifica el token (`verifyOtp`), pide nombre y contraseña (Zod: 10 caracteres y un número), llama a `updateUser({ password })` y marca el `Usuario` como `ACTIVO`. C-07 solo agrega el envío.
*Alternativa:* RLS de Supabase (descartado: el acceso es solo por Prisma desde el servidor).

### 6. Sistema de componentes
Componentes de shadcn/ui (Radix) copiados a `src/components/ui` y reescritos con las clases y tokens de `design-system/ui.css`; Geist con `geist/font`. `FormField` une react-hook-form, Zod y el control. Los pickers de fecha y hora son propios (popover + grilla), no los nativos. `Avatar` recibe el nombre de archivo y cae a un ícono neutro si falta o falla la carga. Los avatares se copian de `design-system/assets/avatars/` a `public/avatars/`. Orden de entrega por D4 (DD-18): primero lo que usan C-02 a C-08; `range`, `color`, `file`, `month`, `week`, `url` y `hidden` al final.
La regla de ESLint `no-restricted-syntax` con selectores `JSXOpeningElement[name.name=/^(input|select|textarea|button)$/]` aplica a `src/**` y se desactiva en `src/components/ui/**`.

### 7. Layout, rutas y carpetas por módulo
`src/app/(panel)/layout.tsx` con el sidebar de `design-system/screens/panel-turnos.html` (248/60 px, colapsable) filtrado por la matriz. Placeholders con estado vacío en `/pacientes`, `/configuracion/{profesionales,prestaciones,sillones,horarios}`, `/turnos/nuevo`, `/turnos/[id]`, `/equipo`, `/estadisticas`, cada uno con su verificación de rol. Carpetas con `.gitkeep`: `src/domain/{pacientes,catalogo,horarios,turnos,equipo,estadisticas}`, igual en `src/server/` y `tests/`.

### 8. Agenda del día
Server Component que lee `?fecha=AAAA-MM-DD` (inválida → hoy), calcula `rangoDelDia`, consulta con `select` mínimo los turnos y profesionales activos y arma la grilla de 88 px por hora y la vista Lista. `loading.tsx` con Skeleton.

### 9. Seed
`prisma/seed.ts` (corre solo el líder): crea los 6 usuarios en Supabase Auth con la API de administración (`SUPABASE_SECRET_KEY`) y la contraseña de `SEED_PASSWORD` del `.env`, y luego las filas de dominio de la KB 04 (DD-17), con avatares fijos. Es idempotente (upsert por email, matrícula y nombre). Los turnos de ejemplo se ubican en el día de ejecución y el siguiente, para que la agenda tenga datos en la demo.

### 10. CI
`.github/workflows/ci.yml` en `pull_request` y `push` a `main`: Node 24, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`. Sin secretos.

## UI Mockups

- Design system revision: 3
- Decision: no (project policy)
- Mockups: no aplica (modo `system-only`); referencia visual en `design-system/screens/` y `design-system/components.html`.

## Risks / Trade-offs

- [Prisma 7 con el pooler de Supabase rechaza prepared statements] → el adapter `pg` no usa prepared statements con nombre; si aparece el error, sumar `?pgbouncer=true` y probar la conexión antes de repartir el `.env`.
- [`prisma migrate dev` detecta las restricciones manuales como drift] → aplicar en la base compartida solo con `migrate deploy`, y verificar con `migrate diff`.
- [Los escenarios de la base no corren en el CI] → `scripts/verificar-restricciones.sql` los ejercita dentro de una transacción con `ROLLBACK`; el líder lo corre en verify y deja la salida en `docs/evidencias/`.
- [Catálogo de componentes extenso con poco tiempo] → orden de D4: se mergea apenas estén los que desbloquean al equipo.
- [Los integrantes adelantaron explore/propose sin este código] → al mergear, el líder actualiza las ramas y avisa; sus specs se ajustan en apply si algo no coincide.

## Migration Plan

1. El líder completa su `.env` local (URL, publishable key, secret key, `DATABASE_URL`, `DIRECT_URL`, `SEED_PASSWORD`).
2. `npx prisma migrate deploy` contra Supabase y luego `npx prisma db seed`.
3. Supabase Advisors → Security sin alertas críticas; correr `scripts/verificar-restricciones.sql`.
4. PR a `main`, CI verde, merge. Check de CI obligatorio en `main`. Actualizar las ramas C-02 a C-08 con `main`.
Rollback: la base es nueva; ante un error se puede resetear el proyecto de Supabase con consentimiento explícito del líder y volver a migrar.

## Open Questions

- Si el límite de emails de Supabase gratuito alcanza para la demo de invitaciones (P-06): se resuelve en C-07 y no cambia este change.
