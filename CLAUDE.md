<!-- active-stack:agent-instruction -->
# Turnos Odontología: instrucciones para agentes

> Este archivo (y su copia idéntica `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/` y `CHANGES.md`. No editar a mano sin re-sincronizar ambos archivos. Solo el líder lo modifica.

Agenda de turnos para consultorios odontológicos argentinos, cargada solo por el consultorio, con roles `ADMIN`, `RECEPCION` y `PROFESIONAL` controlados en el servidor. Su diferencial es que **nunca permite turnos superpuestos por profesional ni por sillón** (validado en el dominio y garantizado por la base de datos) y que **todo cambio de estado queda en un historial**.

---

## Stack Tecnológico

| Capa | Tecnologías | Nota |
|---|---|---|
| Lenguaje | TypeScript estricto | 5.x |
| Framework (front + back) | Next.js App Router: Server Components, Server Actions, Route Handlers | Sin backend separado |
| Runtime | Node.js LTS + npm | Node 20+ |
| Estilos | Tailwind CSS + tokens de `design-system/tokens.css` | 4.x |
| Componentes de UI | Sistema propio en `src/components/ui` (shadcn/ui + Radix) | Único permitido |
| Formularios y validación | react-hook-form + Zod | Mismo esquema en cliente y servidor |
| Base de datos | PostgreSQL en Supabase (São Paulo) con `btree_gist` | Postgres 15+ |
| ORM y migraciones | Prisma | `prisma/migrations/` |
| Autenticación | Supabase Auth (email y contraseña, sin registro público, invitaciones) | `@supabase/ssr` |
| Tests | Vitest (dominio puro, sin base de datos) | - |
| CI | GitHub Actions: lint + typecheck + test | En cada PR |
| Deploy | Vercel + Supabase | Sin Docker |

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md). Diseño visual: [design-system/README.md](design-system/README.md).

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.** Si una guía o un prompt dice otra cosa, gana la knowledge base.

| Archivo | Cuándo leerlo |
|---|---|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Propósito, alcance y fuera de alcance |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Roles, matriz de permisos, rutas |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Entidades, restricciones de exclusión, seed |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas codificadas `RN-XX-NN` |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias de usuario y escenarios mínimos |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos de punta a punta |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Carpetas, seguridad, variables de entorno |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | Por qué se decidió cada cosa |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | Inconsistencias resueltas y preguntas pendientes |

> Antes de arrancar C-01 hay que confirmar las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` (franjas en el seed y verificación de fuentes).

---

## Skills Disponibles

| Agente | Rol | Skills que carga |
|---|---|---|
| **Datos** | Esquema, migraciones, consultas, restricciones | `supabase-postgres-best-practices`, `prisma-cli`, `prisma-client-api` |
| **Servidor** | Server Actions, auth, permisos | `nextjs-app-router-patterns`, `supabase`, `prisma-client-api` |
| **Interfaz** | Pantallas con el sistema de componentes | `shadcn`, `nextjs-app-router-patterns`, `emil-design-eng` |
| **Dominio y tests** | Reglas puras y sus tests | `vitest` |
| **Entrega** | Ciclo OPSX y fichas del equipo | `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-verify-change`, `openspec-archive-change`, `openspec-sync-specs`, `openspec-update-change`, `active-delivery` |

Cargá la skill correspondiente al contexto ANTES de escribir código. Las skills del proyecto están en `.claude/skills/` (Claude Code) y `.agents/skills/` (Codex).

> Los compact rules de cada skill los resuelve el orquestador desde [.atl/skill-registry.md](.atl/skill-registry.md) (generado por `skill-registry`; en este proyecto sí está versionado como evidencia de la fundación). Esta tabla solo mapea skill→rol.

---

## Roadmap de Changes

El plan completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 8 changes en 2 fases.
- **Camino crítico** (2): `C-01 → C-05`.
- **Primer change**: `C-01` (base-tecnica), secuencial, del líder. Después, C-02 a C-08 van en paralelo, cada uno en su rama.

**Antes de iniciar un item**: leé su ficha en [CHANGES.md](CHANGES.md), confirmá que sus dependencias están `[x]` y leé los archivos de "Leer antes".

---

## Reglas Duras (específicas del proyecto)

> Reglas globales ya definidas en el archivo global de instrucciones del cliente activo (orquestador, governance, TDD, engram): el proyecto las hereda. Acá viven solo las reglas **específicas de este proyecto** + las universales que el global no cubra.

**Datos y secretos**
- NUNCA usar datos reales de pacientes en código, seeds, tests, ejemplos o capturas → pacientes, DNI y teléfonos inventados. El personal usa los nombres del equipo con emails `@example.com` (DD-17), sin otros datos personales.
- NUNCA leer, escribir, mostrar ni commitear `.env` ni claves → usar `.env.example` vacío y pedir los valores al líder por privado.
- NUNCA poner la clave secreta de Supabase en el cliente ni en variables `NEXT_PUBLIC_*` → usarla solo en el servidor.

**Base de datos**
- NUNCA modificar `prisma/schema.prisma` ni correr migraciones contra la base compartida si no sos el líder → pedirle el cambio al líder.

**Alcance y trabajo en equipo**
- NUNCA tocar archivos fuera de la `Zona` de tu ficha en `CHANGES.md` (salvo tu carpeta en `openspec/changes/`, `docs/explore/` y `docs/evidencias/`) → si necesitás algo compartido, pedíselo al líder.
- NUNCA inventar reglas de negocio → usar solo `knowledge-base/05_reglas_de_negocio.md`; si falta algo, preguntarle al líder.
- NUNCA mergear con lint, typecheck o tests en rojo → arreglar hasta que el CI esté verde.
- NUNCA hacer commit, push ni PR sin que la persona lo pida → commits convencionales en español, por ejemplo `feat(pacientes): alta con DNI normalizado`.

**Código**
- NUNCA usar `<input>`, `<select>`, `<textarea>`, `<button>` crudos ni crear componentes de UI propios → usar solo `src/components/ui` (lo hace cumplir ESLint en CI).
- NUNCA usar `any` → TypeScript estricto con tipos explícitos.
- NUNCA poner lógica de negocio en componentes ni en Server Actions → va en `src/domain/<modulo>/` como función pura con su test.
- NUNCA escribir una Server Action sin validar sesión, `requireRol([...])` y el esquema Zod → seguir el patrón de `knowledge-base/07_flujos_principales.md` §Flujo 2.

**Fechas y especificaciones**
- NUNCA guardar horas locales → guardar en UTC (`timestamptz`) y mostrar en `America/Argentina/Buenos_Aires`.
- NUNCA aprobar una spec con menos de 3 escenarios → feliz, error de negocio y borde, citando los códigos `RN-XX-NN`, con un test por escenario.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)         → entender el dominio
2. Identificar tu ficha en CHANGES.md             → respetar dependencias y Zona
3. explore → propose (revisar y Ajustar)          → alcance y criterios de aceptación
4. apply → verify                                 → implementar con tests y CI verde
5. archive → PR                                   → el líder revisa, mergea y marca la ficha [x]
```

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, las reglas duras prevalecen.
<!-- /active-stack:agent-instruction -->

<!-- active-stack:team-mode -->
## Reglas de equipo

Proyecto de equipo: la configuración vive en `.active-stack/team.json`.

- Al iniciar la sesión, si existe `.active-stack/team.json`, usá la skill `active-delivery` para identificar a la persona y mostrar «qué me toca». Detalle en las `references/` de esa skill.
- Una rama y un worktree por ficha: `<id>-slug`. Nunca dos agentes en la misma rama o carpeta.
- Nada directo a `main`. PR chicos. Commit, push y PR solo con autorización de la persona.
- No inventes nombres ni cuentas de integrantes: lo que falte queda pendiente hasta que el equipo lo complete.

**Si la skill `active-delivery` no está disponible en este cliente**, aplicá la misma convención a mano:

1. Una rama por ficha (`<id>-slug`) creada desde la rama principal actualizada.
2. Todo cambio entra por pull request; sin push a `main` ni force-push.
3. Al terminar, dejá el handoff en `knowledge-base/entrega/<id>.md`: qué se hizo, cómo se verificó, qué sigue y qué decisiones quedan abiertas.
<!-- /active-stack:team-mode -->
