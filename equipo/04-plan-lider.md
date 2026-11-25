# Plan del líder — Francisco Diego Valles Adad (52147)

> Responsabilidades según la consigna: conducir la **fundación** (etapas 0 a 5) y el **primer ciclo OPSX**, crear el repo con una rama por integrante, controlar `main` y los PR, dirigir la secuencia y el paralelismo del roadmap, y cerrar con Engram, el video y la entrega.

## Estado de la Mac del líder (auditado el 24/11)

| Herramienta | Estado |
|---|---|
| Git 2.54 · GitHub CLI 2.98 (logueado como `franciscode11`, scopes `repo` y `workflow`) | ✅ |
| `user.name` = Francisco Diego Valles Adad · `user.email` = email público de la cuenta de GitHub | ✅ (configurado) |
| Go 1.27 · Node 26 (LTS) · npm 12 · Homebrew | ✅ |
| Claude Code 2.1 · Codex CLI 0.167 | ✅ |
| OpenSpec 2.1.1 · Engram 3.7.2 | ✅ (instalados al probar Active Stack) |
| Active Stack | ⏳ compilado y probado en un entorno aislado; **falta la instalación real con captura** |

**Hallazgo:** en macOS, Active Stack v0.9 siempre ejecuta `sudo npm install -g` para OpenSpec y falla sin terminal interactiva. El arreglo probado es un `sudo` "de mentira" solo durante la instalación (ver `01-prerequisitos.md`, paso 5, Mac). Vale la pena contarlo en la reflexión como hallazgo técnico real.

---

## Etapa 0 · Preparación (martes 24, a primera hora)

1. **Instalar Active Stack de verdad** (TUI, para la captura obligatoria):

```bash
mkdir -p ~/.as-shim && printf '#!/bin/sh\nexec "$@"\n' > ~/.as-shim/sudo && chmod +x ~/.as-shim/sudo
```

```bash
cd ~/active-stack && PATH="$HOME/.as-shim:$PATH" ./active-stack install
```

   Elegir **Claude Code + Codex**, modo **Full**, permisos **balanceado**. 📸 Captura de la pantalla final con la lista de harnesses → `docs/evidencias/instalacion/valles.png`. Después `rm -rf ~/.as-shim`. En Codex: `/hooks` → confiar en el hook de `active-stack`.

2. ✅ **Repo público creado** (`franciscode11/turnos-odontologia`) con el commit inicial:
   - Protección de `main`: PR obligatorio + 1 aprobación de *code owner* (`.github/CODEOWNERS` = `@franciscode11`), sin force-push ni borrado. Como admin, el líder puede mergear sus propios PR.
   - Merge: solo **"Create a merge commit"** (squash y rebase desactivados), para que en `main` queden los commits individuales de cada integrante. Las ramas no se borran al mergear (trazabilidad).
   - Invitados con permiso *Write*: OctaCrescini, joaco-cortezb, Lautarodeco, joaquin-echenagorria, UlisesLucato. Tienen que aceptar (vence en 7 días).
   - **Ramas de las fichas (creadas el 2026-11-25, al mergear la fundación):** `C-01-base-tecnica`, `C-02-pacientes`, `C-03-catalogo`, `C-04-horarios`, `C-05-crear-turno`, `C-06-estados-turno`, `C-07-equipo`, `C-08-estadisticas` (la consigna pide que el líder cree las ramas; formato `<id>-slug` de Active Stack).
   - **Después del C01:** agregar el check del CI como obligatorio en la protección de `main` (no se puede antes porque el workflow todavía no existe) y actualizar con `main` las ramas C-02 a C-08 (`git merge origin/main` en cada una y push) antes de avisarle al equipo.
3. **Carpeta compartida de Drive** para clips del video y capturas, y mandar el mensaje al grupo (borrador en `../mensaje-whatsapp-equipo.md`, fuera del repo).

## Etapas 1 a 5 · Fundación con `/active-orchestrator` (martes 24)

Como `main` está protegida (y Active Stack además le prohíbe al agente hacer push a `main`), la fundación se hace en la rama **`feat/fundacion`** y entra por PR: `git checkout -b feat/fundacion`. Abrí Claude Code **dentro del repo** (`cd turnos-odontologia && claude`) y ejecutá `/active-orchestrator`. En **cada** etapa: leer lo generado, decidir **Continuar / Ajustar / Parar acá**, anotar la decisión y hacer un commit (`docs(fundacion): etapa N …`). Sacá capturas de al menos un **Ajustar** por etapa importante.

| Etapa | Qué pedir / responder | Revisión obligatoria | Commit |
|---|---|---|---|
| **1 · OpenSpec init** | Dejar que corra `openspec init`. En la bifurcación "¿hacemos estudio de mercado?" → **Sí**. | Existe `openspec/` y `.active-orchestrator-state.json`. Borrar carpetas de agentes que no usamos si las crea (nunca `.git`). | `chore(fundacion): openspec init` |
| **2 · Discovery** | Responder el checklist de 11 puntos con criterio (usar `docs/restricciones-equipo.md`). Después pegar **textual** la "Consigna de investigación para el agente" del enunciado. Pedir que lo guarde en `docs/discovery/informe-discovery.md` con portada, resumen ejecutivo, secciones A–D, verificación de fuentes y referencias. | ≥ 15 sistemas, URL + fecha en cada fuente, "No evidenciado" donde no hay respaldo, distinción comprobado/comercial. Abrir vos 2–3 URL antes de aprobar. Repartir 5 fuentes (una de cada tipo) a los integrantes (Tarea 0). | `docs(discovery): informe y checklist` |
| **2b · PDF** | Pedir al agente que genere `docs/discovery/informe-discovery.pdf` desde el `.md` (por ejemplo con `npx md-to-pdf`). Regenerarlo al final, con la verificación de fuentes consolidada. | Portada con materia, integrantes y fecha. | `docs(discovery): versión PDF` |
| **3 · KB Creator** | "Generá la knowledge-base en modo silencioso a partir de `docs/discovery/` y `docs/restricciones-equipo.md`." | Refleja el Discovery (competidores, MVP, vacíos); reglas de agenda (duración, sillones/boxes, solapamientos); preguntas abiertas = lo "No evidenciado"; stack = el de `restricciones-equipo.md`; matriz de permisos por rol. | `docs(kb): knowledge-base` |
| **Design system** | Política recomendada: **`system-only`** (sistema visual sí, mockups por change no: no hay tiempo). | — | `docs(design): sistema visual` |
| **4 · Roadmap** | Prioridades: "C01 base técnica secuencial (scaffold, esquema Prisma completo del MVP con restricción de exclusión anti-solapamiento, Supabase Auth + roles ADMIN/RECEPCION/PROFESIONAL, layout con carpetas de módulo, Vitest, CI, seed ficticio). Después, en paralelo y sin dependencias entre sí: pacientes; profesionales/prestaciones/sillones; horarios/bloqueos/disponibilidad; crear turno sin solapamientos; cancelar y estados de asistencia. Somos 6: asignar C01 al líder y uno a cada integrante." | Alineado con el MVP de la sección D: nada que el Discovery dejó para después, nada imprescindible afuera. Dependencias, camino crítico y riesgos presentes. | `docs(roadmap): CHANGES.md` |
| **5a · Find skill** | Elegir qué instalar con **una línea de justificación por recomendación** (anotarlas en `docs/decisiones-skills.md`). Sugerencia: skills de Next.js, Prisma y Supabase/Postgres sí; las que no apliquen al stack, no. | — | `chore(skills): skills elegidas` |
| **5b · Skill registry** | Continuar. | Existe `.atl/skill-registry.md`. | `chore(skills): skill-registry` |
| **5c · Agent instruction** | Revisar cada regla candidata. **Agregar a mano** reglas propias: (1) nunca datos reales de pacientes en código, seeds, tests o capturas; (2) solo el líder modifica `prisma/schema.prisma` y aplica migraciones; (3) cada integrante toca solo su módulo; (4) nada se mergea con tests en rojo; (5) nunca leer ni escribir `.env`. | `AGENTS.md` y `CLAUDE.md` idénticos en la raíz. | `docs(agentes): AGENTS.md y CLAUDE.md` |
| **Team mode** | 6 integrantes, con nombres (versionados: sí). Aceptar proteger `main`. | `.active-stack/team.json`, plantilla de PR y `CODEOWNERS` (con `* @franciscode11`). | `chore(equipo): modo equipo` |
| **Memory policy** | **`local`** (Engram Cloud requiere un servidor propio; no vale la pena para 3 días). | — | (incluido arriba) |

Conviene abrir el PR de `feat/fundacion` apenas el informe de Discovery esté aprobado (así los integrantes lo tienen en `main` para la Tarea 0) y otro PR al terminar el resto de las etapas. Al terminar: merge a `main` y avisar al grupo que ya pueden leer `CHANGES.md` y la knowledge-base.

## Supabase (martes 24, antes del apply del C01)

1. Crear cuenta en <https://supabase.com> (con tu email; la contraseña la manejás vos) → **New project** `turnos-odontologia`, región **South America (São Paulo)**, contraseña de base fuerte guardada en tu gestor de contraseñas.
2. *Project Settings → Database → Connection string*:
   - `DATABASE_URL` = **Transaction pooler** (puerto 6543, agregar `?pgbouncer=true`) → la usa la app.
   - `DIRECT_URL` = **Session pooler / directa** (puerto 5432) → solo para migraciones. **Solo la tenés vos.**
3. *Authentication → Sign In / Providers*: dejar **Email** y **desactivar "Allow new users to sign up"** (los usuarios los crea el seed/administrador).
4. *SQL Editor* → cerrar la Data API sobre nuestras tablas (usamos Prisma, no PostgREST; si no, cualquiera con la clave pública podría leer la base):

```sql
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
```

   Volver a correr los dos primeros `revoke` después de cada `prisma migrate deploy` (por las tablas nuevas).

5. Rol **restringido** para los integrantes (pueden leer/escribir datos, **no** pueden crear, alterar ni borrar tablas, así nadie "pisa" la base con un `migrate` por error):

```sql
create role equipo_dev with login password 'GENERAR-UNA-CONTRASEÑA-LARGA';
grant usage on schema public to equipo_dev;
grant select, insert, update, delete on all tables in schema public to equipo_dev;
grant usage, select on all sequences in schema public to equipo_dev;
alter default privileges for role postgres in schema public grant select, insert, update, delete on tables to equipo_dev;
alter default privileges for role postgres in schema public grant usage, select on sequences to equipo_dev;
```

   La cadena de los integrantes usa el usuario `equipo_dev.<project-ref>` en el pooler. Probarla con `psql` antes de repartirla.
6. Repartir el `.env` de los integrantes **por mensaje privado** (nunca en el repo ni en el grupo): `DATABASE_URL` con `equipo_dev`, la URL del proyecto, la **publishable key** (`sb_publishable_…`; en proyectos viejos se llama *anon key*) y los usuarios de prueba ficticios. La **secret key** (`sb_secret_…`, antes *service_role*) y `DIRECT_URL` **solo** las tiene el líder.
7. Después de cada migración: correr *Advisors → Security* en Supabase y revisar que no haya alertas críticas.

## Change C01 · Base técnica (martes 24, noche) — ciclo OPSX completo

Rama `C-01-base-tecnica`. En Claude Code: `/sdd-orchestrator` y explore → propose → **Ajustar** → apply → verify → archive. Requisitos que la spec del C01 tiene que cubrir (son los que asumen las guías de los integrantes):

- Next.js App Router + TypeScript estricto, npm, ESLint, Tailwind. Scripts `dev`, `build`, `lint`, `typecheck`, `test` (Vitest).
- `prisma/schema.prisma` con **todo el modelo del MVP**: `Usuario` (rol), `Paciente`, `Profesional`, `Prestacion`, `Sillon`, `HorarioAtencion`, `Bloqueo`, `Turno` (estado, inicio, fin), `HistorialTurno`. Enum de estados del turno y constante compartida `ESTADOS_QUE_OCUPAN_AGENDA` en `src/domain/shared/`.
- Restricción de exclusión en PostgreSQL (`btree_gist` + `tstzrange`) que impida turnos solapados por profesional y por sillón cuando el estado ocupa agenda (migración SQL manual dentro de Prisma).
- Supabase Auth (email y contraseña) + helper de servidor `requireRol([...])` y matriz de permisos de la knowledge-base. Protección de las rutas de `(panel)` en el servidor (middleware/proxy de Next.js) además de chequear el rol en cada acción.
- **Sistema de componentes compartido** en `src/components/ui` (base shadcn/ui + Radix, personalizado con los tokens del design system): todos los controles de formulario custom y homogéneos — inputs `text`, `password` (con mostrar/ocultar), `email`, `url`, `tel`, `search` (con botón limpiar), `number` (stepper), `range` (slider), `date`, `datetime-local`, `time`, `month`, `week` (pickers propios, no los nativos del navegador), `checkbox`, `radio` (RadioGroup), `file` (dropzone), `color`, botones (`submit`, `reset`, `button`, botón con ícono en lugar de `image`), `hidden` (wrapper para formularios), `Select` con grupos (`optgroup`) y `multiple`, `Combobox` con sugerencias (reemplaza `datalist`) y `Textarea`. Cada uno con `Label`, texto de ayuda, estado de error, `disabled`, `required` y foco accesible; integrados con Zod/react-hook-form (`FormField`). Además `Card`, `Table`, `Dialog`, `Badge`, `Toast`. Página `/dev/componentes` que muestra todos (sirve de catálogo para el equipo y para el video).
- **Regla verificable en CI:** ESLint (`no-restricted-syntax`) prohíbe `<input>`, `<select>`, `<textarea>` y `<button>` crudos fuera de `src/components/ui`. Así nadie arma componentes propios ni distintos.
- Layout con menú y **páginas placeholder** en las rutas de cada módulo: `/pacientes`, `/configuracion/profesionales`, `/configuracion/prestaciones`, `/configuracion/sillones`, `/configuracion/horarios`, `/turnos` (listado del día, solo lectura), `/turnos/nuevo`, `/turnos/[id]`. Carpetas vacías con `.gitkeep` en `src/domain/<modulo>`, `src/server/<modulo>` y `tests/<modulo>` para cada integrante.
- Seed con datos **ficticios** (usuarios de prueba por rol, 2 profesionales, 3 prestaciones, 2 sillones, 5 pacientes inventados).
- Tests de dominio sin base de datos (el README tiene que permitir `npm install && npm test` sin credenciales).
- `.env.example` sin valores. GitHub Actions: lint + typecheck + test en cada PR.
- README: requisitos, instalación, cómo correr tests, cómo levantar la app, estructura de carpetas.

Aplicar la migración con `DIRECT_URL` (`npx prisma migrate deploy`), repetir los `revoke`, correr el seed, PR, CI verde, merge. Después: check del CI obligatorio en `main`, crear las 5 ramas de los integrantes desde `main` y recién ahí avisar: "ya pueden arrancar sus changes".

## Miércoles 25 · Revisar y mergear PRs

**Checklist por PR** (antes de aprobar):

- [ ] CI en verde.
- [ ] Solo toca archivos de su módulo + su carpeta de `openspec/` + `docs/` (pestaña *Files changed*).
- [ ] No hay `.env`, claves, `node_modules`, `.next` ni datos reales.
- [ ] El change está archivado: `openspec/changes/archive/AAAA-MM-DD-<change>/` con proposal, design, tasks y specs, y specs sincronizadas en `openspec/specs/`.
- [ ] La spec tiene ≥ 3 escenarios (feliz, error, borde) y cada uno tiene su test.
- [ ] Commits del propio integrante (su nombre en la pestaña *Commits*).

**Aprobar** (*Review changes → Approve*) y después **Merge** con *Create a merge commit*. Después, en `main`: actualizar el estado del change en `CHANGES.md` (commit `chore(roadmap): C0X completado`) y avisar a los demás que hagan `git merge main` en sus ramas.

**Orden sugerido** (no hay dependencias entre ellos, pero así se reducen conflictos): C03 → C02 → C04 → C05 → C06. Si dos tocan el mismo archivo compartido, mergear uno, pedirle al otro `git merge main` y que su agente resuelva.

## Jueves 26 · Cierre (todo listo antes de las 11:00)

1. `main` actualizado: `npm install && npm test && npm run build` en verde; probar la app de punta a punta con datos ficticios.
2. **Engram (etapa 7):** sesión nueva → preguntar algo de una sesión anterior (ej. "¿qué decidimos sobre los solapamientos y por qué?"). 📸 + grabar para el video.
3. Consolidar la **verificación de fuentes** (`docs/discovery/verificacion/*.md`) en la sección final del informe y regenerar el PDF.
4. **Reflexión escrita** (1 a 2 páginas, `docs/reflexion.md` + PDF): redactada por nosotros, con el párrafo de cada integrante. Preguntas de la consigna: qué del Discovery fue incorrecto o inventado y cómo se detectó; dónde usamos Ajustar y qué habría pasado con Continuar; spec aprobada vs prompt suelto; qué parte de la fundación aportó más y menos valor; qué hizo cada integrante.
5. README final (instalación + tests reproducibles), tag `v1.0`.
6. Video: editar, subir **Público**, probar el link en incógnito.
7. Controles finales:

```bash
gh repo view --json visibility -q .visibility
```

```bash
git ls-files | grep -iE '(^|/)\.env($|\.)|node_modules|\.next/' || echo "OK: nada prohibido versionado"
```

```bash
git log --all -p | grep -iE 'service_role|sb_secret|postgres(ql)?://[^ ]*:[^ ]*@' || echo "OK: sin secretos en el historial"
```

8. Subir `apellido_nombre_legajo.txt` a la tarea de la comisión 3K09 (borrador fuera del repo: `../vallesadad_francisco_52147.txt`) **antes de las 12:00**.

## Opcional (si sobra tiempo)

- Una skill propia del dominio creada con `skill-creator` (por ejemplo, un revisor de conflictos de turnos) y referenciada en `AGENTS.md`, como hizo el grupo del video de referencia.
- Mostrar una consulta real a Context7 durante un apply.
