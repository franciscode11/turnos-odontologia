# Arquitectura Propuesta

> Fuentes: `docs/restricciones-equipo.md`, `equipo/04-plan-lider.md` (Supabase y C01), carpetas de módulo de las guías de los integrantes.

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| Dominio puro | `src/domain/<modulo>/` | Reglas testeables con Vitest sin base ni credenciales. |
| Server Actions como capa de aplicación | `src/server/<modulo>/` | Un solo lugar para sesión, rol, validación y persistencia. |
| Esquema único de validación (Zod) | Formularios y servidor | Mismo contrato en ambos lados. |
| Defensa en profundidad para la agenda | Dominio + restricción de exclusión de Postgres | El dominio da el mensaje claro; la base garantiza la integridad ante concurrencia. |
| Historial append-only | `HistorialTurno` | Trazabilidad de datos de salud. |
| Baja lógica | Paciente y catálogo | Conservar la historia de los turnos. |
| Carpeta por módulo | Rutas, dominio, servidor y tests | 5 personas en paralelo sin conflictos de merge. |
| Sistema de componentes único | `src/components/ui` | Interfaz homogénea; ESLint lo hace cumplir. |

## Estructura de directorios

```
turnos-odontologia/
├── prisma/
│   ├── schema.prisma            # solo el líder
│   ├── migrations/              # incluye SQL manual: btree_gist + EXCLUDE + índice parcial DNI
│   └── seed.ts                  # datos ficticios
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── (panel)/
│   │   │   ├── layout.tsx       # menú (solo el líder)
│   │   │   ├── pacientes/                        # C02
│   │   │   ├── configuracion/profesionales/      # C03
│   │   │   ├── configuracion/prestaciones/       # C03
│   │   │   ├── configuracion/sillones/           # C03
│   │   │   ├── configuracion/horarios/           # C04
│   │   │   └── turnos/
│   │   │       ├── page.tsx                      # C01 (listado del día)
│   │   │       ├── nuevo/                        # C05
│   │   │       └── [id]/                         # C06
│   │   └── dev/componentes/                      # C01
│   ├── components/ui/           # solo el líder
│   ├── domain/
│   │   ├── shared/              # estados, solapamiento de intervalos, fechas (C01)
│   │   ├── pacientes/  catalogo/  horarios/
│   │   └── turnos/              # crear-* y solapamiento* (C05); estados-* (C06)
│   ├── server/
│   │   ├── auth/                # sesión, requireRol (C01)
│   │   ├── db.ts                # cliente Prisma (C01)
│   │   └── pacientes/ catalogo/ horarios/ turnos/
│   └── middleware.ts            # sesión en (panel)
├── tests/<modulo>/              # Vitest
├── design-system/               # tokens y referencia visual
├── knowledge-base/              # este directorio
├── openspec/                    # specs y changes
└── .github/workflows/ci.yml
```

`src/domain/shared/` (C01) expone `seSuperponen(a, b)` para intervalos `[inicio, fin)` y `ESTADOS_QUE_OCUPAN_AGENDA`, de modo que C04 y C05 usen la misma definición sin depender uno del otro.

## Seguridad

- **Autenticación**: Supabase Auth con email y contraseña, registro público desactivado, sesión por cookies (`@supabase/ssr`).
- **Autorización**: rol propio en la tabla `Usuario`; `requireRol([...])` en cada Server Action; middleware que exige sesión en `(panel)`.
- **Acceso a datos**: solo vía Prisma desde el servidor. La Data API de Supabase (PostgREST) queda cerrada con `revoke` para `anon` y `authenticated` (repetir después de cada migración).
- **Base compartida**: los integrantes usan el rol `equipo_dev` (DML sin DDL); solo el líder tiene `DIRECT_URL` y migra.
- **Validación de entrada**: Zod en el servidor siempre, aunque el cliente ya haya validado.
- **Secretos**: solo `.env.example` versionado y vacío; los valores se reparten por privado. Nunca leer ni escribir `.env` desde el agente.
- **Datos de salud**: solo ficticios; historial de cambios de turnos; acceso por rol.
- **Revisión**: Supabase Advisors → Security después de cada migración.

## Variables de entorno

| Variable | Descripción | Ejemplo | Sensible |
|---|---|---|---|
| `DATABASE_URL` | Pooler de transacciones (puerto 6543, `?pgbouncer=true`). Integrantes: usuario `equipo_dev`. | `postgresql://…:6543/postgres?pgbouncer=true` | Y |
| `DIRECT_URL` | Conexión directa para migraciones. **Solo el líder.** | `postgresql://…:5432/postgres` | Y |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. | `https://<ref>.supabase.co` | N |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (`sb_publishable_…`). | `sb_publishable_…` | N (pública, pero no se versiona) |
| `SUPABASE_SECRET_KEY` | Clave secreta (`sb_secret_…`), solo para el seed de usuarios. **Solo el líder.** | `sb_secret_…` | Y |

## Calidad y CI

- Scripts: `dev`, `build`, `lint`, `typecheck`, `test`.
- GitHub Actions en cada PR: `npm ci`, lint, typecheck, test. Sin secretos: los tests no tocan la base.
- `main` protegida: PR obligatorio, aprobación del code owner, CI obligatorio después del C01, merge commit.
