# Turnos Odontología

Sistema de gestión de turnos y agenda de pacientes para consultorios odontológicos del mercado argentino. Su diferencial: **nunca permite turnos superpuestos por profesional ni por sillón** (lo valida el dominio y lo garantiza la base de datos) y **todo cambio de estado queda en un historial**.

Trabajo Global de **Desarrollo de Software** (UTN FRM), comisión **3K09**. Lo construimos con **Spec-Driven Development**: OpenSpec, Active Stack (fundación con `/active-orchestrator` y ciclo OPSX) y Engram como memoria del agente. **No escribimos código a mano**: cada funcionalidad se especifica, se aprueba y recién después la implementa un agente de IA contra esa especificación.

**Aplicación publicada:** https://turnos-odontologia-beige.vercel.app (datos ficticios; los usuarios de prueba los reparte el líder por privado).

**Video del trabajo:** https://www.youtube.com/watch?v=PIBwSXwy9kg

## Dónde está cada entregable de la consigna

| Etapa de la consigna | Dónde está |
|---|---|
| 0 · Entorno y Active Stack Full | Capturas en [`docs/evidencias/instalacion/`](docs/evidencias/instalacion/) |
| 1 · `/active-orchestrator` y `openspec init` | [`.active-orchestrator-state.json`](.active-orchestrator-state.json) y [`openspec/`](openspec/) |
| 2 · Discovery | [`docs/discovery/informe-discovery.md`](docs/discovery/informe-discovery.md), su [PDF](docs/discovery/informe-discovery.pdf), el [checklist de 11 puntos](docs/discovery/checklist-discovery.md), las [notas por sistema](docs/discovery/sources/) y la [verificación de 5 fuentes](docs/discovery/verificacion/) |
| 3 · Base de conocimiento | [`knowledge-base/`](knowledge-base/) (10 archivos canónicos) |
| 4 · Roadmap | [`CHANGES.md`](CHANGES.md) |
| 5 · Skills y reglas del agente | [`docs/decisiones-skills.md`](docs/decisiones-skills.md), [`.atl/skill-registry.md`](.atl/skill-registry.md), [`AGENTS.md`](AGENTS.md) y [`CLAUDE.md`](CLAUDE.md) |
| 6 · Ciclo OPSX | Changes archivados en [`openspec/changes/archive/`](openspec/changes/archive/), specs vigentes en [`openspec/specs/`](openspec/specs/), relevamientos en [`docs/explore/`](docs/explore/), tests en [`tests/`](tests/) y evidencias de Ajustar y verify en [`docs/evidencias/`](docs/evidencias/) |
| 7 · Memoria (Engram) | Consulta en vivo en el video (decisiones guardadas en el proyecto `turnos-odontologia` de Engram) |
| Bitácora de decisiones | [`docs/evidencias/bitacora-fundacion.md`](docs/evidencias/bitacora-fundacion.md) |
| Reflexión escrita | [`docs/reflexion.md`](docs/reflexion.md) |

## Equipo

| Integrante | Legajo | Rol |
|---|---|---|
| Francisco Diego Valles Adad | 52147 | Líder: fundación, base técnica (C-01), equipo (C-07), estadísticas (C-08), integración y merges |
| Octavio Crescini | 51949 | C-02 Gestión de pacientes |
| Joaquín Cortez Badaloni | 51948 | C-03 Profesionales, prestaciones y sillones |
| Lautaro de Coninck | 51954 | C-04 Horarios de atención, bloqueos y disponibilidad |
| Joaquín Echenagorria | 51964 | C-05 Crear turno sin solapamientos |
| Ulises Iván Lucato Flores | 52021 | C-06 Cancelar turno y estados de asistencia |

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript 5.9 estricto · Tailwind CSS 4 · sistema de componentes propio en `src/components/ui` (Radix) · react-hook-form + Zod · PostgreSQL en Supabase con `btree_gist` · Prisma 7 · Supabase Auth · Vitest · GitHub Actions. Detalle en [`knowledge-base/02_descripcion_general.md`](knowledge-base/02_descripcion_general.md).

## Requisitos

- Node.js 20.9 o superior (el CI usa Node 24) y npm.
- Git y GitHub CLI (`gh`).
- Para levantar la app: el archivo `.env` que reparte el líder **por privado**. Para correr los tests no hace falta.

## Instalación y tests (sin credenciales)

```bash
git clone https://github.com/franciscode11/turnos-odontologia.git
cd turnos-odontologia
npm install
npm test
```

`npm install` también genera el cliente de Prisma. Los tests son de dominio puro: no tocan la base ni la red.

| Script | Qué hace |
|---|---|
| `npm run dev` | App en <http://localhost:3000> (necesita `.env`) |
| `npm run lint` | ESLint, incluida la regla que prohíbe controles nativos fuera de `src/components/ui` |
| `npm run typecheck` | Genera los tipos de rutas de Next y corre `tsc` |
| `npm test` | Vitest |
| `npm run build` | Build de producción |

El CI (`.github/workflows/ci.yml`) corre lint, typecheck y tests en cada PR.

## Levantar la app

1. Copiá `.env.example` como `.env` y pegá los valores que te pasó el líder.
2. `npm run dev` y abrí <http://localhost:3000>.
3. Entrás con un usuario del seed. Uno por rol:
   - **Administrador:** `francisco.valles@example.com`
   - **Recepción:** `octavio.crescini@example.com` o `ulises.lucato@example.com`
   - **Profesional:** `joaquin.cortez@example.com`, `lautaro.deconinck@example.com` o `joaquin.echenagorria@example.com`

   La contraseña la pasa el líder por privado.

## Base de datos (solo el líder)

```bash
npx prisma migrate deploy   # aplica prisma/migrations con DIRECT_URL
npx prisma db seed          # 6 usuarios del equipo, catálogo, pacientes inventados y turnos de ejemplo
npx tsx scripts/datos-demo.ts   # opcional: 5 semanas de turnos ficticios para estadísticas
```

- La migración inicial incluye SQL manual que Prisma no modela: restricciones `EXCLUDE` por profesional y por sillón, `CHECK`, índice único parcial de DNI, historial de solo inserción, RLS y cierre de la Data API.
- `scripts/verificar-restricciones.sql` comprueba esas garantías en la base real sin dejar datos (pegarlo en el SQL Editor de Supabase).
- `scripts/permisos-equipo-dev.sql` da permisos al rol de los integrantes después de crearlo o de cada migración con tablas nuevas.
- Integrantes: **nunca** modifiquen `prisma/schema.prisma` ni migren. Pídanle el cambio al líder.

## Estructura

```
prisma/                  esquema, migraciones (con SQL manual) y seed
scripts/                 SQL de verificación y permisos (los corre el líder)
src/
  app/
    login/ activar-cuenta/ salir/      rutas públicas
    (panel)/                           layout con menú por rol y páginas de cada módulo
      turnos/                          agenda del día (C-01); nuevo/ (C-05); [id]/ (C-06)
      pacientes/ configuracion/ equipo/ estadisticas/
      dev/componentes/                 catálogo del sistema de componentes (no aparece en el menú)
  components/ui/          sistema de componentes (solo el líder lo modifica)
  domain/<modulo>/        reglas de negocio puras con tests (shared/: estados, solapamiento, fechas)
  server/<modulo>/        Server Actions (sesión + requireRol + Zod); auth/ y db.ts del C-01
  proxy.ts                exige sesión en el panel (Next 16, antes middleware)
tests/<modulo>/           Vitest
design-system/            tokens, componentes y pantallas de referencia
knowledge-base/           fuente de verdad del dominio
openspec/                 specs y changes (ciclo OPSX)
```

## Para el equipo

Si sos integrante, empezá por [`equipo/00-LEEME-PRIMERO.md`](equipo/00-LEEME-PRIMERO.md). Tu agente lee [`AGENTS.md`](AGENTS.md) / `CLAUDE.md` y tu ficha en [`CHANGES.md`](CHANGES.md).
