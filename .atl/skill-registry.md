# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

Generado por `skill-registry` el 2026-11-25 para **turnos-odontologia**. Volver a correrlo después de instalar o quitar skills.

> Alcance: skills del proyecto (versionadas en `.claude/skills/` y `.agents/skills/`, las recibe cualquiera que clone) y las skills globales del Active Stack que el flujo del equipo usa. Se excluyen a propósito las skills personales instaladas en la máquina del líder que no aplican al stack (Clerk, HyperFrames, founder-*, media-use): **este proyecto usa Supabase Auth, no Clerk**, y un agente no debe aplicar esas reglas acá.

## Project Skills (en el repo)

| Trigger | Skill | Path |
|---------|-------|------|
| Cualquier tarea con Supabase: Auth, base, Storage, `@supabase/ssr`, claves | supabase | `.claude/skills/supabase/SKILL.md` |
| Antes de escribir o cambiar cualquier cosa en Postgres: esquema, índices, restricciones, consultas | supabase-postgres-best-practices | `.claude/skills/supabase-postgres-best-practices/SKILL.md` |
| Comandos de Prisma: init, generate, migrate, db execute | prisma-cli | `.claude/skills/prisma-cli/SKILL.md` |
| Consultas con Prisma Client: CRUD, filtros, transacciones | prisma-client-api | `.claude/skills/prisma-client-api/SKILL.md` |
| Componentes shadcn/ui en `src/components/ui` | shadcn | `.claude/skills/shadcn/SKILL.md` |
| Next.js App Router: Server Components, Server Actions, layouts, loading | nextjs-app-router-patterns | `.claude/skills/nextjs-app-router-patterns/SKILL.md` |
| Escribir o configurar tests con Vitest | vitest | `.claude/skills/vitest/SKILL.md` |
| Ciclo OPSX: explore, propose, apply, verify, archive, sync, update | openspec-* (7) | `.claude/skills/openspec-*/SKILL.md` |

## User Skills (Active Stack, instaladas por cada integrante con la guía)

| Trigger | Skill | Path |
|---------|-------|------|
| Elegir ODD o SDD para una ficha; identificar integrante y sus fichas | active-delivery | `~/.claude/skills/active-delivery/SKILL.md` |
| Fundación, modo equipo, memoria | active-orchestrator | `~/.claude/skills/active-orchestrator/SKILL.md` |
| Revisar la política visual o el design system | design-system | `~/.claude/skills/design-system/SKILL.md` |
| Animaciones e interacciones de UI | emil-design-eng | `~/.claude/skills/emil-design-eng/SKILL.md` |
| Revisar que una pantalla no se vea genérica | design-taste-frontend | `~/.agents/skills/design-taste-frontend/SKILL.md` |
| Regenerar AGENTS.md / CLAUDE.md | agent-instruction | `~/.claude/skills/agent-instruction/SKILL.md` |

## Compact Rules

### supabase
- Nunca exponer la clave secreta (`sb_secret_…`) ni `service_role` al cliente: en Next.js todo `NEXT_PUBLIC_*` llega al navegador. El cliente usa solo la publishable key.
- La clave secreta se usa solo en el servidor (seed e invitaciones de C-07).
- Nunca decidir permisos con `user_metadata`: lo puede editar el usuario. El rol sale de la tabla `Usuario`.
- Sesión en Next.js con `@supabase/ssr` (cliente de servidor con cookies); validar el usuario en el servidor en cada acción.
- Fijar versiones exactas de los paquetes de Supabase y commitear `package-lock.json`.
- Este proyecto no usa la Data API (PostgREST) ni RLS para la app: el acceso es solo vía Prisma desde el servidor y los permisos de `anon`/`authenticated` están revocados.

### supabase-postgres-best-practices
- Leer la skill antes de tocar el esquema o escribir SQL.
- Índice en toda clave foránea consultada y en columnas de búsqueda (`apellido`, `dni`, `(profesionalId, inicio)`, `(sillonId, inicio)`).
- Las reglas de integridad van en la base además del código: `CHECK`, `EXCLUDE USING gist` con `btree_gist`, índices únicos parciales.
- Usar `timestamptz` para instantes; nunca `timestamp` sin zona.
- Correr Supabase Advisors (Security y Performance) después de cada migración.

### prisma-cli
- Solo el líder corre `prisma migrate deploy` contra la base compartida, con `DIRECT_URL`. Los integrantes nunca migran.
- Acciones destructivas (`migrate reset`, `db push --force-reset`) solo con consentimiento explícito del usuario en este mismo mensaje; nunca inferirlo.
- SQL que Prisma no modela (exclusiones, índices parciales) va en una migración creada con `prisma migrate dev --create-only` y editada a mano.
- Para SQL suelto: `prisma db execute --file ...`.
- Después de cambiar el esquema: `prisma generate`.

### prisma-client-api
- Escrituras que tocan turno e historial juntas: `prisma.$transaction`.
- Capturar errores de restricción (Prisma `P2002` único; Postgres `23P01` exclusión) y traducirlos a mensajes de negocio.
- Seleccionar solo los campos necesarios (`select`) en listados.
- Un solo cliente Prisma compartido (`src/server/db.ts`); nunca instanciar uno por request.

### shadcn
- Los componentes viven solo en `src/components/ui` y los mantiene el líder; los integrantes los usan, no los modifican.
- Componer antes que inventar; usar variantes (`variant`, `size`) antes que estilos propios.
- Colores semánticos y tokens del design system, nunca valores crudos como `bg-blue-500`.
- `className` para layout, no para cambiar colores ni tipografía de un componente.
- `flex` + `gap-*` en lugar de `space-x/y-*`; `size-*` cuando alto y ancho son iguales; `cn()` para clases condicionales.

### nextjs-app-router-patterns
- Server Components por defecto; `'use client'` solo para interactividad.
- Mutaciones con Server Actions en `src/server/<modulo>/`, siempre con sesión, `requireRol` y Zod.
- Nada de hooks en Server Components; no hacer fetch en Client Components.
- Toda ruta con datos lentos tiene `loading.tsx` o `Suspense` (skeleton del design system).
- `revalidatePath` después de cada mutación.

### vitest
- La lógica de dominio (`src/domain/`) se testea pura, sin base de datos ni credenciales.
- Un archivo por módulo en `tests/<modulo>/`; un test por escenario de la spec, con el código `RN-XX-NN` en el nombre.
- Fechas fijas en los tests (`vi.setSystemTime`) y zona `America/Argentina/Buenos_Aires`.
- Datos de prueba siempre ficticios.

### openspec-*
- El estado de los artefactos lo informa el CLI (`openspec status`, `openspec list`); nunca suponerlo.
- No crear la estructura `openspec/` a mano.
- Cada spec: al menos 3 escenarios (feliz, error de negocio, borde) que citen reglas de `knowledge-base/05_reglas_de_negocio.md`.
- Archivar el change antes del PR y sincronizar las specs en `openspec/specs/`.

### emil-design-eng
- Solo animar `transform` y `opacity`, menos de 300 ms, con `--ease-out` de `design-system/tokens.css`.
- Botones con `scale(0.97)` al presionar; nunca animar desde `scale(0)`.
- Nada animado en acciones de teclado; foco instantáneo.
- Respetar `prefers-reduced-motion`.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md / CLAUDE.md | `AGENTS.md`, `CLAUDE.md` | Se generan en la fase `agents` de la fundación |
| Knowledge base | `knowledge-base/README.md` | Fuente de verdad del dominio y las reglas |
| Roadmap | `CHANGES.md` | Fichas, zonas y responsables |
| Design system | `design-system/README.md` | Tokens, componentes y tiempos |
| Restricciones del equipo | `docs/restricciones-equipo.md` | Stack y reglas de trabajo |
| Equipo | `.active-stack/team.json` | Integrantes e ids |

Read the convention files listed above for project-specific patterns and rules.
