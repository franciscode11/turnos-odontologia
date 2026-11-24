# Octavio Crescini — Legajo 51949

## Tu change: **C02 · Gestión de pacientes**

> Nombre e ID planificados. Cuando el líder mergee `CHANGES.md`, buscá ahí el change equivalente (puede tener otro número). Si no lo encontrás o el alcance es distinto, **avisale al líder antes de empezar**.

### ¿Qué es y por qué importa?

Permite que la recepción del consultorio **registre, busque y edite pacientes**. Sin pacientes cargados no se puede dar ningún turno: es la puerta de entrada del sistema.

### Qué incluye (alcance sugerido)

- Alta de paciente: nombre, apellido, DNI, fecha de nacimiento, teléfono (obligatorio, se usa para recordatorios), email opcional, obra social/prepaga y n.º de afiliado opcionales.
- Búsqueda por apellido o por DNI y listado paginado.
- Edición de datos.
- Baja **lógica** (se desactiva, no se borra), para no perder el historial de turnos.

### Reglas de negocio candidatas

Estas son reglas **candidatas**. La fuente de verdad es la knowledge-base (`knowledge-base/` → reglas de negocio). Si la knowledge-base dice otra cosa, gana la knowledge-base; si algo no está en ninguna de las dos, se pregunta, **no se inventa**.

1. El DNI es único: no puede haber dos pacientes activos con el mismo DNI.
2. El DNI se guarda normalizado (solo dígitos, 7 u 8): `30.123.456` y `30123456` son el mismo DNI.
3. La fecha de nacimiento no puede ser futura.
4. Solo `ADMIN` y `RECEPCION` crean, editan o dan de baja. `PROFESIONAL` solo consulta.

### Escenarios mínimos (para tu especificación)

La cátedra exige **al menos 3**: uno feliz, uno de error de negocio y uno de borde. Estos son los que te sugiero:

- **Feliz:** DADO un usuario de recepción, CUANDO registra un paciente con todos los datos obligatorios válidos, ENTONCES el paciente queda guardado y aparece en la búsqueda por apellido.
- **Error de negocio:** DADO un paciente activo con DNI 30123456, CUANDO se intenta registrar otro paciente con DNI 30123456, ENTONCES el sistema rechaza el alta con el mensaje "Ya existe un paciente con ese DNI".
- **Borde:** DADO un paciente activo con DNI 30123456, CUANDO se intenta registrar otro con DNI "30.123.456", ENTONCES también se rechaza porque el DNI normalizado es el mismo.
- **Permisos:** DADO un usuario con rol PROFESIONAL, CUANDO intenta crear un paciente, ENTONCES el sistema lo rechaza por falta de permisos.

### Dónde trabajás (y dónde NO)

✅ **Solo** podés crear o modificar archivos en tu módulo **pacientes** (pantalla en `/pacientes`):

- `src/app/(panel)/pacientes/`
- `src/domain/pacientes/`
- `src/server/pacientes/`
- `tests/pacientes/`

Más la carpeta de tu change dentro de `openspec/changes/`, tu resumen de explore en `docs/explore/` y tu captura en `docs/evidencias/`.

❌ **No toques:** `prisma/schema.prisma`, `CHANGES.md`, `.active-orchestrator-state.json`, `AGENTS.md`, `CLAUDE.md`, el layout/menú general, los componentes compartidos de `src/components/ui` ni los módulos de otros compañeros. Si necesitás algo ahí, pedíselo al líder.

**Dependencias:** Solo de la base técnica (C01): el modelo `Paciente` ya existe en el esquema.

---

## Tarea 0 (martes) · Verificar una fuente del Discovery + tu primer PR

El profesor exige que el equipo abra y compruebe **personalmente** al menos 5 fuentes del informe de Discovery. A vos te toca el **sitio oficial** de uno de los sistemas del informe. El líder te dice por WhatsApp **qué sistema** verificar.

1. `git checkout main && git pull` y después `git checkout -b docs/crescini-verificacion`.
2. Abrí tu agente en la carpeta del repo (`claude` o `codex`) y pegale:

```text
Leé docs/discovery/informe-discovery.md. Listame textualmente todo lo que el informe afirma
sobre el sistema <NOMBRE DEL SISTEMA QUE TE PASÓ EL LÍDER> y qué URL cita como fuente para cada afirmación.
No abras las URLs ni corrijas nada: solo listá las afirmaciones y sus fuentes.
```

3. **Abrí vos la URL en tu navegador** (esto lo tenés que hacer vos, no la IA) y comprobá si lo que dice el informe está realmente ahí. Sacá una captura de la página.
4. Creá el archivo `docs/discovery/verificacion/crescini.md` con este contenido (completalo **con tus palabras**):

```markdown
# Verificación de fuente — Octavio Crescini (51949)

- **Sistema:**
- **Tipo de fuente:** (sitio oficial / precios / centro de ayuda / video oficial / reseña)
- **URL:**
- **Fecha de consulta:** AAAA-MM-DD (el día que la abriste vos)
- **Qué afirma el informe:** (copiá la afirmación)
- **Qué encontré en la URL:**
- **Resultado:** ✅ Respaldado / ⚠️ Parcialmente / ❌ No respaldado
- **Corrección que propongo:** (si no estaba respaldado, qué debería decir: "No evidenciado", otro dato, etc.)
- **Captura:** docs/evidencias/verificacion/crescini.png
```

5. Guardá tu captura de la verificación como `docs/evidencias/verificacion/crescini.png` y la **captura del instalador de Active Stack** como `docs/evidencias/instalacion/crescini.png`.
6. Commit, push y PR (ver [`../02-git-y-prs.md`](../02-git-y-prs.md)):

```bash
git add .
```

```bash
git commit -m "docs(discovery): verificación de fuente y captura de instalación (crescini)"
```

```bash
git push -u origin docs/crescini-verificacion
```

```bash
gh pr create --base main --fill --reviewer franciscode11
```

---

## Tarea principal (miércoles) · Tu change con el ciclo OPSX

> 📸 **Grabá la pantalla o sacá capturas de cada fase**, sobre todo del momento en que revisás la propuesta y usás **Ajustar**: es lo que más vale en el video.

### Paso 1 — Preparar tu rama

```bash
git checkout main && git pull
```

```bash
git fetch origin
```

```bash
git checkout feat/c02-pacientes
```

```bash
git merge main
```

La rama `feat/c02-pacientes` **ya la creó el líder** en GitHub (la consigna pide que el líder cree una rama por integrante). Si `git checkout` dice que no existe, avisale al líder.

```bash
npm install
```

```bash
npm test
```

Los tests tienen que dar verde **antes** de empezar (así sabés que lo que rompas después es tuyo).

### Paso 2 — Abrir tu agente con el orquestador SDD

Desde la carpeta del repo:

| Claude Code | Codex |
|---|---|
| Ejecutá `claude` y como primer mensaje escribí `/sdd-orchestrator` | Ejecutá `codex` y como primer mensaje escribí `$sdd-orchestrator` |

Si el agente te pregunta **quién sos** (modo equipo de Active Stack), respondé: `Soy Octavio Crescini, legajo 51949`.

> Si la conversación se hace muy larga y el agente "compacta" el contexto, **volvé a escribir `/sdd-orchestrator`** (o `$sdd-orchestrator`) antes de seguir.

### Paso 3 — EXPLORE

```text
Soy Octavio Crescini (legajo 51949). Mi change asignado es "Gestión de pacientes" (C02 en el plan del equipo;
buscá su ID real en CHANGES.md).
Vamos con la fase EXPLORE de ese change.
Leé CHANGES.md, la knowledge-base (actores, modelos de datos, reglas de negocio, features, flujos,
arquitectura y decisiones), openspec/specs/ y el código actual de la base técnica.
Devolveme:
1) qué dice el roadmap de mi change y de qué depende;
2) qué ya existe en el código que debo reutilizar (modelos de Prisma, helpers de autenticación y roles, layout, estados);
3) qué reglas de negocio de la knowledge-base aplican;
4) huecos o dudas que tengamos que decidir antes de proponer.
Restricciones: todavía no escribas código. Solo voy a tocar mi módulo (pacientes).
No modifiques prisma/schema.prisma, CHANGES.md ni .active-orchestrator-state.json.
Guardá un resumen del relevamiento en docs/explore/pacientes.md.
```

👀 **Leé lo que encontró.** ¿Coincide con lo que dice esta guía? Si hay diferencias, preguntale al líder.

### Paso 4 — PROPOSE

```text
Vamos con PROPOSE de mi change. Generá proposal.md, design.md, specs/ y tasks.md.
Requisitos obligatorios de la cátedra:
- En proposal.md justificá en 2 o 3 líneas por qué elegimos este change (pertenece al MVP recomendado
  en la sección D del informe de Discovery).
- Escenarios en formato DADO / CUANDO / ENTONCES, verificables, como mínimo: uno feliz, uno de error
  de negocio y uno de borde. Tomá como base estos escenarios del equipo:
  * Feliz: DADO un usuario de recepción, CUANDO registra un paciente con todos los datos obligatorios válidos, ENTONCES el paciente queda guardado y aparece en la búsqueda por apellido.
  * Error de negocio: DADO un paciente activo con DNI 30123456, CUANDO se intenta registrar otro paciente con DNI 30123456, ENTONCES el sistema rechaza el alta con el mensaje "Ya existe un paciente con ese DNI".
  * Borde: DADO un paciente activo con DNI 30123456, CUANDO se intenta registrar otro con DNI "30.123.456", ENTONCES también se rechaza porque el DNI normalizado es el mismo.
  * Permisos: DADO un usuario con rol PROFESIONAL, CUANDO intenta crear un paciente, ENTONCES el sistema lo rechaza por falta de permisos.
- Cada escenario tiene que poder convertirse en un test automatizado.
- La lógica de negocio va como funciones puras en src/domain/ para testearla sin base de datos.
- Respetá la knowledge-base. Si algo no está definido, dejalo como pregunta abierta: no lo inventes.
- Todavía no escribas código.
Al terminar, mostrame una tabla con los escenarios y la lista de decisiones abiertas.
```

### Paso 5 — REVISAR y AJUSTAR (lo que más se evalúa)

Abrí en VS Code los archivos de `openspec/changes/<tu-change>/` y leelos **enteros**. Checklist:

- [ ] ¿Hay al menos 3 escenarios (feliz, error, borde) en DADO / CUANDO / ENTONCES?
- [ ] ¿Cada escenario es verificable (se puede responder verdadero/falso sin interpretar)?
- [ ] ¿El alcance es **solo** mi funcionalidad? (ni de más, ni de menos, ni inventado)
- [ ] ¿Las reglas coinciden con la knowledge-base y con esta guía?
- [ ] ¿Se respetan los permisos por rol?
- [ ] ¿`tasks.md` tiene tareas chicas y concretas, incluyendo los tests?
- [ ] ¿Toca solo archivos de mi módulo?

Si algo está mal (**siempre hay algo**), usá Ajustar. Ejemplo:

```text
Ajustar: <qué está mal> . Quiero que <cómo tiene que quedar>.
Agregá el escenario: DADO ... CUANDO ... ENTONCES ...
Actualizá proposal.md, specs/ y tasks.md para que sean consistentes. No escribas código todavía.
```

📸 Captura del antes y el después. Anotá **qué** corregiste y **por qué**: lo vas a decir en el video y escribir en la reflexión.

Cuando quede bien, guardá un commit de la especificación:

```bash
git add . && git commit -m "spec(pacientes): propuesta del change con escenarios"
```

### Paso 6 — APPLY (con TDD)

```text
La especificación está aprobada. Vamos con APPLY de mi change, con TDD estricto:
primero el test de cada escenario (rojo), después la implementación mínima (verde), después refactor.
Implementá solo lo que está en specs/ y tasks.md. Si aparece algo que no está especificado,
frená y preguntame: volvemos a PROPOSE, no se improvisa en APPLY.
Reutilizá los helpers existentes de autenticación/roles y los componentes del layout. Para la interfaz usá SOLO los componentes de `src/components/ui` (inputs, selects, botones, etc.): no escribas `<input>`, `<select>`, `<textarea>` ni `<button>` sueltos. Si falta un componente, frená y avisame para pedírselo al líder.
Usá solo datos ficticios. Marcá cada tarea de tasks.md a medida que la completes.
Al final corré npm test y mostrame el resultado.
```

Commit:

```bash
git add . && git commit -m "feat(pacientes): implementación del change contra la spec"
```

### Paso 7 — VERIFY

```text
Vamos con VERIFY de mi change. Corré npm test, npm run lint y npm run typecheck.
Mostrame una tabla: escenario del spec → test que lo cubre → resultado.
Verificá que no se tocaron archivos fuera de mi módulo (git diff --stat main).
Si algo está en rojo, no avancemos a ARCHIVE: decime qué falla.
```

✅ Todo verde. 📸 Captura de la terminal con los tests pasando.

Probá la pantalla vos mismo: `npm run dev` → <http://localhost:3000/pacientes> (con el `.env` y el usuario de prueba que te pasó el líder).

### Paso 8 — ARCHIVE

```text
Vamos con ARCHIVE de mi change: sincronizá las specs en openspec/specs/ y mové el change a archive/.
NO modifiques CHANGES.md ni .active-orchestrator-state.json: los actualiza el líder al mergear.
Después guardá en Engram un resumen de las decisiones, hallazgos y ajustes de este change.
```

```bash
git add . && git commit -m "chore(openspec): archivar change pacientes"
```

### Paso 9 — Pull Request

```bash
git push -u origin feat/c02-pacientes
```

```bash
gh pr create --base main --fill --reviewer franciscode11
```

Completá la plantilla del PR (qué hiciste, qué ajustaste, captura de los tests en verde) y asigná a `franciscode11` como reviewer. Avisá por WhatsApp. **No mergees vos.**

---

## Si terminás antes

Avisale al líder antes de arrancar algo nuevo. Idea posible: Historial de turnos del paciente (solo lectura) en su ficha.

## Tu parte del video (≈ 1 min 15 s)

Detalle de cómo grabar en [`../03-guion-video.md`](../03-guion-video.md). Tu guion:

| Tiempo | Qué se ve | Qué decís |
|---|---|---|
| 0:00–0:10 | **Tu cámara** | "Hola, soy Octavio Crescini, legajo 51949. Me tocó el change de gestión de pacientes." |
| 0:10–0:20 | `CHANGES.md` con tu change | "Este change permite registrar, buscar y editar pacientes, con DNI único. Depende solo de la base técnica, por eso lo pudimos hacer en paralelo." |
| 0:20–0:45 | Tu spec en VS Code (escenarios) y la captura del Ajustar | "En propose revisé la especificación: la IA había dejado el DNI como texto libre y lo ajusté para que se normalice a solo dígitos, porque si no `30.123.456` y `30123456` quedaban como dos pacientes distintos." |
| 0:45–1:00 | Terminal con `npm test` en verde | "Cada escenario del spec tiene su test automatizado, y todos pasan." |
| 1:00–1:15 | La pantalla funcionando y tu PR mergeado en GitHub | "Después archivamos el change y el líder mergeó mi PR a main." |

> Las frases de "Ajustar" son **ejemplos**: decí lo que **realmente** corregiste vos.

## Tu párrafo para la reflexión (lo escribís vos, no la IA)

Respondé en 5 a 8 líneas, con tus palabras:

1. ¿Qué hiciste y en qué etapa?
2. ¿Qué usaste con **Ajustar**, qué estaba mal y qué habría pasado si apretabas Continuar?
3. ¿Qué diferencia notaste entre implementar con una especificación aprobada y pedirle código a la IA con un prompt suelto?

Mandáselo al líder por WhatsApp o agregalo en tu PR.

## Si algo falla

| Problema | Qué hacer |
|---|---|
| `npm test` falla **antes** de empezar | No es tuyo: avisá al líder. |
| El agente quiere modificar `schema.prisma` | Decile que no, y pasale al líder qué campo necesitás. |
| El agente no conoce `/sdd-orchestrator` | Revisá que Active Stack se haya instalado en modo Full (`openspec --version`, `engram version`) y abrí una sesión nueva. |
| Conflicto al hacer `git merge main` | Seguí la sección de conflictos de [`../02-git-y-prs.md`](../02-git-y-prs.md). |
| El agente propone crear un *worktree* u otra rama | Decile: "Trabajo en la rama actual (feat/c02-pacientes), no crees worktrees ni ramas nuevas". |
| No sabés qué contestarle al agente | Copiá su pregunta y mandala al grupo. **No improvises.** |
