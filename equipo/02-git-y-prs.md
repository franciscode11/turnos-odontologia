# Cómo trabajamos con Git, ramas y Pull Requests

> Leelo una vez entero. Después usalo como "machete" cada vez que tengas que subir algo.

## La idea en 30 segundos

```
main  ●────────●────────────●──────────●──────▶   (versión oficial, la mergea el líder)
        \                  /            /
C-02     ●──●──●──────────●  (PR #3)   /          (rama de Octavio)
          \                            /
C-05       ●──●──●──●─────────────────●  (PR #5)  (rama de Joaquín E.)
```

- `main` es la versión oficial. **Nadie trabaja directo en `main`** (GitHub lo bloquea).
- Cada uno crea **su rama**, hace commits ahí y abre un **Pull Request (PR)**: un pedido de "por favor sumá mis cambios a `main`".
- El líder revisa el PR. Si está bien y los tests pasan, hace **Merge**. Tus commits quedan en la historia de `main` **con tu nombre**.

## Nombres de rama

| Para qué | Formato | Ejemplo |
|---|---|---|
| Tarea 0 (verificación de fuente + captura) | `docs/<apellido>-verificacion` | `docs/crescini-verificacion` |
| Tu change (**la crea el líder**, vos solo la usás) | `<id>-<nombre-corto>` (formato de Active Stack) | `C-02-pacientes` |
| Corrección que pidió el líder | misma rama del PR | (seguís en la misma) |

## El ciclo completo, comando por comando

> Todos los comandos se ejecutan **dentro de la carpeta del repo** (`turnos-odontologia`), en la **Terminal** (Mac) o en **Git Bash** (Windows). Si no sabés dónde estás, ejecutá `pwd`.

**1. Traer lo último de `main`:**

```bash
git checkout main
```

```bash
git pull
```

**2. Pasarte a tu rama.**

- Si es **tu rama del change** (ya la creó el líder en GitHub):

```bash
git fetch origin
```

```bash
git checkout C-02-pacientes
```

```bash
git merge main
```

- Si es una rama **nueva** tuya (por ejemplo la de la Tarea 0), creala con `-b`:

```bash
git checkout -b docs/crescini-verificacion
```

**3. Trabajar** (tu IA crea y modifica archivos).

**4. Ver qué cambió:**

```bash
git status
```

Revisá la lista: **no** tiene que aparecer `.env`, `node_modules/` ni `.next/`. Si aparecen, frená y avisá al líder.

**5. Guardar un commit** (una "foto" de tus cambios con un mensaje):

```bash
git add .
```

```bash
git commit -m "feat(pacientes): propuesta del change con escenarios"
```

Hacé **varios commits chicos** a lo largo del change (después de propose, después de apply, después de archive). La cátedra quiere ver **el proceso**, no un único commit gigante.

**6. Subir tu rama a GitHub** (la primera vez):

```bash
git push -u origin C-02-pacientes
```

Las siguientes veces alcanza con `git push`.

**7. Abrir el Pull Request:**

```bash
gh pr create --base main --fill --reviewer franciscode11
```

Después completá la descripción en GitHub (la plantilla te guía).

**8. Esperar la revisión.** GitHub no deja mergear sin la aprobación del líder (*code owner*). Si el líder te pide cambios: los hacés en **la misma rama**, `git add .`, `git commit -m "fix: ..."` y `git push`. El PR se actualiza solo.

**9. Cuando el líder mergea:** volvé a `main` y traé lo nuevo:

```bash
git checkout main
```

```bash
git pull
```

## Mensajes de commit

Formato: `tipo(módulo): qué hiciste`.

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `docs` | Documentación, verificación de fuentes, capturas | `docs(discovery): verificación de la fuente de Dentalink` |
| `spec` | Artefactos de OpenSpec (proposal, design, specs, tasks) | `spec(pacientes): propuesta con 4 escenarios` |
| `feat` | Funcionalidad nueva (lo que hace el apply) | `feat(pacientes): alta y búsqueda de pacientes` |
| `test` | Tests | `test(pacientes): escenario de DNI duplicado` |
| `fix` | Corrección | `fix(pacientes): normalizar DNI con puntos` |
| `chore` | Archivado, tareas de mantenimiento | `chore(openspec): archivar change c02-pacientes` |

## Pedirle a tu IA que haga el commit y el PR

Podés hacerlo vos con los comandos de arriba, o pegarle esto a tu agente:

```text
Revisá `git status`. Confirmá que no se va a subir .env, node_modules, .next ni ningún secreto.
Hacé commit de los cambios con un mensaje en formato "tipo(módulo): descripción" en español.
Subí mi rama actual a origin y abrí un Pull Request contra main con `gh pr create`,
usando la plantilla del repo, y asigná como reviewer a franciscode11.
No hagas push a main. Mostrame el link del PR.
```

## Si `main` avanzó mientras trabajabas (traer cambios a tu rama)

Es normal: otros compañeros mergean antes que vos. Para actualizar tu rama:

```bash
git checkout main && git pull
```

```bash
git checkout C-02-pacientes
```

```bash
git merge main
```

- Si dice **"Already up to date"** o se mergea solo: listo, `git push`.
- Si dice **CONFLICT**: no te asustes. Pedile a tu IA:

```text
Tengo conflictos de merge al traer main a mi rama. Mostrame qué archivos tienen conflicto
y explicame cada uno. Resolvelos conservando los cambios de main Y los míos.
No toques archivos de otros módulos ni prisma/schema.prisma ni CHANGES.md sin preguntarme.
Después corré npm test y, si da verde, hacé el commit del merge.
```

## Lo que NO hay que hacer nunca

- ❌ `git push` estando en `main`.
- ❌ `git push --force` (borra trabajo de otros).
- ❌ Subir `.env`, claves, contraseñas o capturas con datos reales.
- ❌ Mergear tu propio PR (lo hace el líder).
- ❌ Editar archivos de módulos de otros compañeros.

## Glosario rápido

| Palabra | Qué significa |
|---|---|
| **Repositorio (repo)** | La carpeta del proyecto con todo su historial. |
| **Clonar** | Bajarte una copia del repo a tu compu. |
| **Rama (branch)** | Una línea de trabajo paralela, para no romper `main`. |
| **Commit** | Una "foto" guardada de tus cambios, con un mensaje. |
| **Push** | Subir tus commits a GitHub. |
| **Pull** | Bajar los commits nuevos de GitHub a tu compu. |
| **Pull Request (PR)** | Pedido para sumar tu rama a `main`. Ahí se revisa y se discute. |
| **Merge** | Unir una rama con otra. |
| **Conflicto** | Dos personas cambiaron la misma línea; hay que elegir cómo queda. |
