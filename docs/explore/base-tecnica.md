# Explore: C-01 base-tecnica

- **Fecha:** 2026-11-25
- **Responsable:** francisco-valles (líder)
- **Rama:** `C-01-base-tecnica` (desde `main` en `f0b498d`)
- **Modo:** SDD (ciclo OPSX). Governance: CRÍTICO (auth, esquema que todo referencia).
- **Fuentes leídas:** ficha C-01 de `CHANGES.md`, `equipo/04-plan-lider.md` §Change C01, `knowledge-base/03`, `04`, `05` §RN-AU/RN-TU-04/RN-GL, `08`, `10`, `design-system/README.md`. Versiones consultadas en el registro de npm el 2026-11-25.

## 1. Qué pide la ficha

Resultado verificable:
1. En un clon limpio, `npm install && npm test` pasa **sin credenciales**.
2. Con el `.env` del líder, los 3 roles del seed inician sesión y cada uno ve solo el menú de su rol.
3. `/dev/componentes` muestra todos los componentes.
4. El CI corre lint, typecheck y tests en cada PR.

No depende de ninguna ficha. Todo lo demás (C-02 a C-08) depende de esta.

## 2. Estado actual del repo

No hay código: no existen `package.json`, `src/` ni `prisma/`. Sí existen `openspec/` (sin changes), `design-system/` (Revision 2 aprobada), la knowledge base y las skills del stack. Es un scaffold desde cero.

## 3. Versiones vigentes (npm, 2026-11-25) y lo que cambian

| Paquete | Versión estable | Impacto en el C-01 |
|---|---|---|
| next | 16.4.6 | En Next 16 `middleware.ts` pasó a llamarse **`proxy.ts`** (la función se exporta como `proxy`). La ficha dice `src/middleware.ts`: hay que usar `src/proxy.ts`. Requiere Node ≥ 20.9. |
| react / react-dom | 19.3.1 | Sin impacto. |
| prisma / @prisma/client | **7.10.1** | El tag `latest` de `prisma` apunta a una RC de la 8 (`8.0.0-rc.35`): fijar 7.10.1 en ambos. Prisma 7 usa `prisma.config.ts` en la raíz (la URL de la base sale de ahí, no del `schema.prisma`), generador `prisma-client` con `output` explícito y **driver adapter** obligatorio en runtime (`@prisma/adapter-pg` 7.10.1). |
| typescript | 7.0.2 (`latest`) | TS 7 es el compilador nativo nuevo. Para no arriesgar compatibilidad con Next, ESLint y Vitest en 1 día, conviene fijar **5.9.x**. A confirmar en design. |
| tailwindcss | 4.3.5 | Configuración en CSS (`@theme`), sin `tailwind.config.js`. Los tokens de `design-system/tokens.css` se mapean ahí. |
| @supabase/ssr / supabase-js | 0.12.7 / 2.119.2 | Cliente de servidor con cookies; `getUser()` (o `getClaims()`) en el servidor, nunca confiar en la sesión del cliente. |
| zod / react-hook-form / @hookform/resolvers | 4.6.7 / 7.92.0 / 7.0.9 | Zod 4. |
| vitest | 5.1.2 | Sin impacto. |
| eslint | 10.15.0 | Flat config (`eslint.config.mjs`). |
| shadcn (CLI) / radix-ui | 4.23.1 / 1.8.1 | Componentes copiados a `src/components/ui`, personalizados con los tokens. |
| geist | 1.9.2 | `geist/font/sans` y `geist/font/mono`. |

Node local del líder: v26.7.0. Para el CI: Node 24 LTS. `engines.node >= 20.9`.

## 4. Lo que el C-01 deja para los demás (contrato con C-02 a C-08)

| Pieza | Dónde | Quién la usa |
|---|---|---|
| Esquema completo del MVP + restricciones SQL | `prisma/schema.prisma`, `prisma/migrations/` | Todos |
| Cliente Prisma único | `src/server/db.ts` | Todas las Server Actions |
| Sesión y `requireRol([...])` | `src/server/auth/` | Todas las Server Actions |
| `ESTADOS_QUE_OCUPAN_AGENDA`, `ESTADOS_FINALES`, `seSuperponen`, utilidades de fecha AR | `src/domain/shared/` | C-04, C-05, C-06, C-08 |
| Componentes de UI | `src/components/ui/` | Todos (ESLint lo exige) |
| Layout con sidebar por rol + páginas placeholder | `src/app/(panel)/` | Todos |
| Carpetas `.gitkeep` por módulo | `src/domain/<m>`, `src/server/<m>`, `tests/<m>` | Cada integrante |
| Seed ficticio con franjas y turnos | `prisma/seed.ts` | C-04, C-05, C-06, C-08 (prueban sin esperar a otros) |

## 5. Reglas de negocio que aplican

- **RN-AU** (autenticación y roles): un rol por usuario, sin registro público, solo `ACTIVO` opera, rol leído de la tabla `Usuario` (nunca de `user_metadata`).
- **RN-TU-04**: sin turnos superpuestos por profesional ni por sillón en estados que ocupan agenda (EXCLUDE en la base + `seSuperponen` en el dominio, intervalo `[inicio, fin)`).
- **RN-GL**: fechas en UTC y visualización en `America/Argentina/Buenos_Aires`, baja lógica, datos ficticios.

## 6. Huecos y decisiones antes del propose

| # | Tema | Propuesta | Decide |
|---|---|---|---|
| D1 | `middleware.ts` → `proxy.ts` (Next 16) | Usar `src/proxy.ts` y corregir la Zona de la ficha y la KB 08. | Líder |
| D2 | Archivos de raíz que la Zona no lista | Sumar a la Zona: `prisma.config.ts`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `postcss.config.mjs`, `components.json`, `public/`, `src/app/globals.css`, `src/app/(panel)/page.tsx`, las páginas placeholder de cada módulo, `tests/shared/` y las carpetas `.gitkeep`. | Líder |
| D3 | TypeScript 7 vs 5.9 | Fijar 5.9.x (menos riesgo con el plazo). | Líder |
| D4 | Alcance de componentes (22 tipos de input + pickers propios) | Es lo más largo del C-01. Propuesta: el C-01 entrega **todos los que usan C-02 a C-08** (text, email, tel, search, number, password, textarea, select, combobox, checkbox, radio, date, time, datetime, botones, Card, Table, Dialog, Badge, Toast, Tooltip, Skeleton, estado vacío, FormField) y deja `range`, `color`, `file`, `month`, `week`, `url` y `hidden` en el catálogo como segunda tanda dentro del mismo change si el tiempo alcanza. | Líder |
| D5 | Proyecto de Supabase | Para escribir código y que pasen los tests **no hace falta**. Sí hace falta para migrar, correr el seed y comprobar el login (resultado 2). El líder crea el proyecto (São Paulo) y comparte solo el project ref; las claves van al `.env` local, nunca al chat. | Líder |
| D6 | Pregunta Alta de la KB 10 (franjas en el seed) | Ya resuelta en la KB 04: el seed carga franjas de lunes a viernes. Se confirma. | Líder |
| D7 | Activar cuenta | La ficha incluye `src/app/activar-cuenta/` pero la invitación es de C-07. Propuesta: C-01 deja solo la página de activación (definir contraseña con el token de Supabase); C-07 envía las invitaciones. | Líder |

## 7. Riesgos

- **Plazo:** el C-01 bloquea a 5 personas. Conviene mergear una primera versión funcional (esquema, auth, layout, componentes de formulario básicos, CI) lo antes posible y no esperar a pulir todo el catálogo.
- **Prisma 7 + Supabase pooler:** el adapter `pg` con el pooler de transacciones (6543) necesita desactivar prepared statements; las migraciones van por `DIRECT_URL` (5432) desde `prisma.config.ts`.
- **SQL manual de exclusión:** Prisma no lo modela; `prisma migrate dev` podría intentar "corregir" el drift. Hay que crear la migración con `--create-only` y verificar que `migrate diff` quede limpio.
- **Lint de controles crudos:** la regla `no-restricted-syntax` sobre JSX tiene que excluir `src/components/ui/**`, si no los propios componentes fallan.
