# Decisiones de skills (find-skill, 2026-11-25)

Recomendaciones de `find-skill` según el stack de `docs/restricciones-equipo.md`. El líder aprobó las 4 opciones. Se instalaron **a nivel proyecto** (`.agents/skills/` para Codex y copia real en `.claude/skills/` para Claude Code) para que cada integrante las reciba al clonar.

| Skill | Origen | Decisión | Justificación (una línea) |
|---|---|---|---|
| supabase | supabase/agent-skills (oficial) | Instalada | Auth con `@supabase/ssr` y manejo seguro de claves, que usa C-01 y C-07. |
| supabase-postgres-best-practices | supabase/agent-skills (oficial) | Instalada | Restricciones e índices en Postgres, incluida la exclusión anti-solapamiento. |
| prisma-cli | prisma/skills (oficial) | Instalada | Migraciones con SQL manual y la regla de no correr acciones destructivas sin consentimiento. |
| prisma-client-api | prisma/skills (oficial) | Instalada | Consultas y transacciones de turno + historial. |
| shadcn | shadcn-ui/ui (oficial) | Instalada | Base del sistema de componentes de `src/components/ui`. |
| nextjs-app-router-patterns | wshobson/agents (comunidad) | Instalada | Server Components, Server Actions y estados de carga en App Router. |
| vitest | antfu/skills (comunidad) | Instalada | Tests de dominio puros, que exige la consigna. |
| nextjs-on-cloudflare | cloudflare/skills | No | Desplegamos en Vercel, no en Cloudflare. |
| clerk-nextjs-patterns y demás Clerk | clerk/skills | No | Usamos Supabase Auth; además se excluyeron del registro para que ningún agente las aplique. |
| prisma-postgres, prisma-database-setup | prisma/skills | No | Son para Prisma Postgres; nuestra base es Supabase. |

## Hallazgo

El instalador (`npx skills add`) crea las skills de Claude Code como **enlaces simbólicos** a `.agents/skills/`. Las de OpenSpec que ya estaban versionadas también lo eran. En Windows, git suele bajar los enlaces como archivos de texto y Claude Code no encuentra las skills. Se reemplazaron por copias reales. Si se reinstala una skill, repetir el reemplazo.
