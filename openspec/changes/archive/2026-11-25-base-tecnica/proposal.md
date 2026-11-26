# Proposal

## Why

El repositorio no tiene código y cinco integrantes esperan una base común para trabajar en paralelo (C-02 a C-06), más los dos changes del líder (C-07 y C-08). Sin un esquema completo, un acceso por rol controlado en el servidor, una definición única de "turno superpuesto" y un sistema de componentes compartido, cada módulo reinventaría esas piezas y los merges chocarían. Es el único change del camino crítico que bloquea a todos (ficha C-01 de `CHANGES.md`).

## What Changes

- Proyecto Next.js 16 (App Router) con TypeScript estricto, Tailwind 4, ESLint, Vitest y scripts `dev`, `build`, `lint`, `typecheck`, `test`. `npm install && npm test` funciona sin credenciales.
- Esquema de datos completo del MVP (los 9 modelos de `knowledge-base/04_modelo_de_datos.md`, con el campo `avatar`) y una migración con las garantías de integridad en la base: `btree_gist`, exclusión por profesional y por sillón, `CHECK` de intervalos, motivo de cancelación y duración de prestación, e índice único parcial de DNI activo.
- Definición compartida de solapamiento `[inicio, fin)`, de los estados que ocupan agenda y de las utilidades de fecha en hora de Argentina, con tests.
- Inicio de sesión con email y contraseña (Supabase Auth), protección de todo el panel, verificación de rol en el servidor (`requireRol`) y menú filtrado por rol. Página para activar una cuenta invitada (definir nombre y contraseña); el envío de invitaciones queda para C-07.
- Sistema de componentes en `src/components/ui` según el design system (Revision 3), con avatares 3D en lugar de iniciales, catálogo en `/dev/componentes` y una regla de ESLint que prohíbe controles nativos fuera de ese directorio.
- Layout del panel con el sidebar del design system, páginas placeholder por módulo y carpetas por módulo para cada integrante.
- `/turnos`: turnos del día en solo lectura.
- Seed con pacientes inventados y el personal con los nombres del equipo (DD-17).
- CI en GitHub Actions (lint, typecheck, test), `.env.example` vacío y README de instalación.

Fuera de alcance: envío de invitaciones y gestión del equipo (C-07), estadísticas (C-08), ABM de pacientes, catálogo, horarios y turnos (C-02 a C-06), modo oscuro, deploy en Vercel.

## Capabilities

### New Capabilities

- `autenticacion`: inicio y cierre de sesión, protección de las rutas del panel, activación de una cuenta invitada y bloqueo de usuarios no activos.
- `autorizacion-por-rol`: verificación del rol en el servidor según la matriz de permisos y menú visible por rol.
- `integridad-de-agenda`: definición de solapamiento de intervalos, estados que ocupan agenda y garantía en la base de datos de que no haya turnos superpuestos por profesional ni por sillón.
- `fechas-y-zona-horaria`: guardado en UTC y presentación en hora de Argentina.
- `sistema-de-componentes`: componentes compartidos de interfaz, catálogo visible, avatares y regla que impide controles propios.
- `agenda-del-dia`: consulta en solo lectura de los turnos de un día.

### Modified Capabilities

Ninguna (no hay specs previas en `openspec/specs/`).

## Impact

- **Código nuevo:** todo el scaffold (ver Zona de la ficha C-01 en `CHANGES.md`).
- **Base de datos:** primera migración sobre el proyecto Supabase del líder (São Paulo). Solo el líder la aplica, con `DIRECT_URL`.
- **Dependencias:** next 16.4, react 19.3, typescript 5.9, tailwindcss 4.3, prisma y @prisma/client 7.10.1 con @prisma/adapter-pg, @supabase/ssr 0.12, zod 4, react-hook-form 7, vitest 5, eslint 10, radix-ui y geist.
- **Equipo:** al mergear, el líder actualiza las ramas C-02 a C-08 con `main`, hace obligatorio el check de CI y reparte el `.env` por privado.
- **Decisiones:** DD-17 y DD-18 de `knowledge-base/09_decisiones_y_supuestos.md`; explore en `docs/explore/base-tecnica.md`.
