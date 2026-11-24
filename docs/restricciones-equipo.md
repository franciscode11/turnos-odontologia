# Restricciones y decisiones del equipo (insumo para Discovery y knowledge-base)

> Documento escrito por el equipo **antes** de la fundación. Es contexto para `discovery-research`, `kb-creator` y `roadmap-generator`: no reemplaza al Discovery, lo acota.

## 1. Contexto del trabajo

- Producto: sistema de gestión de turnos y agenda de pacientes para consultorios odontológicos, mercado argentino.
- Equipo de **6 personas** (1 líder + 5 integrantes) que trabajan **en paralelo y de forma remota**, cada una en su propia rama y con su propio agente de IA (Claude Code o Codex).
- Plazo: entrega el **jueves 26/11/2026 a las 12:00**. Hay que priorizar un MVP chico, terminado y probado, antes que muchas funcionalidades a medias.
- Cada integrante tiene que poder demostrar **un change propio** completo (explore → propose → apply → verify → archive) con sus propios commits y su propio PR.

## 2. Restricciones técnicas decididas por el equipo

| Tema | Decisión | Motivo |
|---|---|---|
| Estructura | **Un solo proyecto** con front end y back end juntos | La cátedra exige que front y back residan en el mismo repositorio/proyecto. |
| Framework | **Next.js (App Router) + TypeScript estricto** | Front y back en un único proyecto; muy bien soportado por los agentes. |
| Base de datos | **PostgreSQL gestionado en Supabase** | Nadie instala bases locales ni Docker: 6 personas comparten un entorno remoto. |
| ORM y migraciones | **Prisma** | Migraciones versionadas en el repo. **Solo el líder aplica migraciones** a la base compartida. |
| Autenticación | **Supabase Auth** (email + contraseña), sin registro público | Los usuarios del consultorio los da de alta el administrador. |
| Autorización | Roles propios: `ADMIN`, `RECEPCION`, `PROFESIONAL` | Matriz de permisos definida en la knowledge-base y aplicada en el servidor. |
| Validación | Zod | Mismo esquema para formularios y servidor. |
| Tests | **Vitest**. La lógica de dominio es pura (sin base de datos) y se testea sin credenciales | El README debe permitir clonar y correr los tests sin secretos. |
| Backend | **El mismo Next.js** (Server Actions y Route Handlers en `src/server/`). Sin backend separado (Go, Express, etc.) | Un solo proyecto, un solo deploy, una sola sesión de auth y un solo lenguaje para todo el equipo. Un backend aparte duplica auth, tipos y deploy sin aportar al MVP. |
| Archivos | **Supabase Storage** (buckets privados, acceso por rol) | Ya viene con Supabase; nada que instalar. |
| Contenedores | **Sin Docker** | Base, auth y storage están en Supabase (nube); Vercel compila el proyecto solo. Docker sería un prerrequisito más para 6 personas sin beneficio. |
| Deploy | **Vercel** (plan gratuito) conectado al repo + Supabase en la nube; dominio propio barato opcional | Cada PR genera una URL de preview; `main` queda publicado. |
| UI | Tailwind CSS + **sistema de componentes único** en `src/components/ui` (base shadcn/ui + Radix), definido en la fundación con el design system | Todos los controles de formulario (los 22 tipos de `<input>`, `select`/`optgroup`/`option`, sugerencias tipo `datalist` y `textarea`) son componentes propios, homogéneos y accesibles. **Prohibido** usar controles HTML crudos o crear componentes propios fuera de esa carpeta (regla de ESLint en CI). Si falta un componente, lo agrega el líder. |
| CI | GitHub Actions: lint + typecheck + tests en cada PR | Nada se mergea en rojo. |
| Gestor de paquetes | npm | Es el que ya trae Node; un paso menos para el equipo. |

## 3. Reglas de trabajo en equipo (para el roadmap y las reglas del agente)

- `main` está protegida: todo entra por Pull Request y lo mergea el líder.
- El roadmap debe tener **un change base secuencial** (scaffold, modelo de datos completo del MVP, autenticación y roles, CI) y después **changes independientes que se puedan hacer en paralelo**, uno por integrante, cada uno en su propia carpeta de módulo para no pisarse.
- El esquema de base de datos (`prisma/schema.prisma`) lo define el change base. Un integrante que necesite cambiarlo se lo pide al líder: no lo modifica en su rama.
- `CHANGES.md` y `.active-orchestrator-state.json` los actualiza solo el líder (evita conflictos de merge).
- `src/components/ui/` y los tokens del design system los mantiene solo el líder: los integrantes los usan, no los modifican.

## 4. Restricciones de dominio y datos

- **Nunca** usar datos reales de pacientes: todos los ejemplos, seeds, tests y capturas usan datos ficticios.
- Ninguna clave, contraseña ni cadena de conexión se sube al repositorio. Solo `.env.example` con valores vacíos.
- Los datos de salud son sensibles: el diseño tiene que contemplar control de acceso por rol y trazabilidad de cambios en los turnos.
