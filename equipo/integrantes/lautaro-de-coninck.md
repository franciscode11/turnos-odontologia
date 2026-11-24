# Lautaro de Coninck — Legajo 51954

## Tu change: **C04 · Horarios de atención, bloqueos y disponibilidad**

> Nombre e ID planificados. Cuando el líder mergee `CHANGES.md`, buscá ahí el change equivalente (puede tener otro número). Si no lo encontrás o el alcance es distinto, **avisale al líder antes de empezar**.

### ¿Qué es y por qué importa?

Define **cuándo atiende cada profesional** (horario semanal), los **bloqueos** (vacaciones, feriados, congresos) y calcula los **horarios libres** para una fecha y una duración. Es lo que permite ofrecer turnos que realmente se pueden dar.

### Qué incluye (alcance sugerido)

- Horario semanal por profesional: día de la semana, hora desde, hora hasta (puede haber más de una franja por día, ej. mañana y tarde).
- Bloqueos por profesional: desde fecha/hora, hasta fecha/hora, motivo.
- Cálculo de disponibilidad: dado un profesional, una fecha y una duración, devuelve los horarios de inicio libres (descontando bloqueos y turnos que ocupan agenda).
- Pantalla para que el ADMIN cargue horarios y bloqueos, y vista de disponibilidad del día.

### Reglas de negocio candidatas

Estas son reglas **candidatas**. La fuente de verdad es la knowledge-base (`knowledge-base/` → reglas de negocio). Si la knowledge-base dice otra cosa, gana la knowledge-base; si algo no está en ninguna de las dos, se pregunta, **no se inventa**.

1. En una franja, la hora desde es anterior a la hora hasta.
2. Las franjas de un mismo profesional y mismo día no se superponen. Una franja que empieza justo cuando termina otra **sí** se permite.
3. Un horario libre solo se ofrece si la duración completa entra dentro de una franja y no choca con un bloqueo ni con un turno que ocupa agenda (los estados que ocupan agenda están definidos en la base técnica).
4. Solo `ADMIN` carga horarios y bloqueos; `RECEPCION` y `PROFESIONAL` consultan disponibilidad.

### Escenarios mínimos (para tu especificación)

La cátedra exige **al menos 3**: uno feliz, uno de error de negocio y uno de borde. Estos son los que te sugiero:

- **Feliz:** DADO un profesional que atiende los lunes de 09:00 a 12:00 sin turnos, CUANDO se pide la disponibilidad de un lunes para 30 minutos, ENTONCES se ofrecen inicios de 09:00 a 11:30.
- **Error de negocio:** DADO una franja de 09:00 a 12:00 los lunes, CUANDO se intenta cargar otra de 11:00 a 14:00 el mismo día, ENTONCES se rechaza por superposición.
- **Borde:** DADO una franja de 09:00 a 12:00, CUANDO se carga otra de 12:00 a 14:00 el mismo día, ENTONCES se acepta (empieza justo cuando termina la anterior).
- **Bloqueo:** DADO un bloqueo de 10:00 a 11:00, CUANDO se pide la disponibilidad de ese día para 30 minutos, ENTONCES no se ofrece ningún inicio que se superponga con el bloqueo.

### Dónde trabajás (y dónde NO)

✅ **Solo** podés crear o modificar archivos en tu módulo **horarios** (pantalla en `/configuracion/horarios`):

- `src/app/(panel)/configuracion/horarios/`
- `src/domain/horarios/`
- `src/server/horarios/`
- `tests/horarios/`

Más la carpeta de tu change dentro de `openspec/changes/`, tu resumen de explore en `docs/explore/` y tu captura en `docs/evidencias/`.

❌ **No toques:** `prisma/schema.prisma`, `CHANGES.md`, `.active-orchestrator-state.json`, `AGENTS.md`, `CLAUDE.md`, el layout/menú general ni los módulos de otros compañeros. Si necesitás algo ahí, pedíselo al líder.

**Dependencias:** Solo de la base técnica (C01): los modelos `HorarioAtencion`, `Bloqueo` y `Turno` ya existen en el esquema.

---

## Tarea 0 (martes) · Verificar una fuente del Discovery + tu primer PR

El profesor exige que el equipo abra y compruebe **personalmente** al menos 5 fuentes del informe de Discovery. A vos te toca un **centro de ayuda o documentación pública** de uno de los sistemas del informe. El líder te dice por WhatsApp **qué sistema** verificar.

1. `git checkout main && git pull` y después `git checkout -b docs/deconinck-verificacion`.
2. Abrí tu agente en la carpeta del repo (`claude` o `codex`) y pegale:

```text
Leé docs/discovery/informe-discovery.md. Listame textualmente todo lo que el informe afirma
sobre el sistema <NOMBRE DEL SISTEMA QUE TE PASÓ EL LÍDER> y qué URL cita como fuente para cada afirmación.
No abras las URLs ni corrijas nada: solo listá las afirmaciones y sus fuentes.
```

3. **Abrí vos la URL en tu navegador** (esto lo tenés que hacer vos, no la IA) y comprobá si lo que dice el informe está realmente ahí. Sacá una captura de la página.
4. Creá el archivo `docs/discovery/verificacion/deconinck.md` con este contenido (completalo **con tus palabras**):

```markdown
# Verificación de fuente — Lautaro de Coninck (51954)

- **Sistema:**
- **Tipo de fuente:** (sitio oficial / precios / centro de ayuda / video oficial / reseña)
- **URL:**
- **Fecha de consulta:** AAAA-MM-DD (el día que la abriste vos)
- **Qué afirma el informe:** (copiá la afirmación)
- **Qué encontré en la URL:**
- **Resultado:** ✅ Respaldado / ⚠️ Parcialmente / ❌ No respaldado
- **Corrección que propongo:** (si no estaba respaldado, qué debería decir: "No evidenciado", otro dato, etc.)
- **Captura:** docs/evidencias/verificacion/deconinck.png
```

5. Guardá tu captura de la verificación como `docs/evidencias/verificacion/deconinck.png` y la **captura del instalador de Active Stack** como `docs/evidencias/instalacion/deconinck.png`.
6. Commit, push y PR (ver [`../02-git-y-prs.md`](../02-git-y-prs.md)):

```bash
git add .
```

```bash
git commit -m "docs(discovery): verificación de fuente y captura de instalación (deconinck)"
```

```bash
git push -u origin docs/deconinck-verificacion
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
git checkout feat/c04-horarios
```

```bash
git merge main
```

La rama `feat/c04-horarios` **ya la creó el líder** en GitHub (la consigna pide que el líder cree una rama por integrante). Si `git checkout` dice que no existe, avisale al líder.

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

Si el agente te pregunta **quién sos** (modo equipo de Active Stack), respondé: `Soy Lautaro de Coninck, legajo 51954`.

> Si la conversación se hace muy larga y el agente "compacta" el contexto, **volvé a escribir `/sdd-orchestrator`** (o `$sdd-orchestrator`) antes de seguir.

### Paso 3 — EXPLORE

```text
Soy Lautaro de Coninck (legajo 51954). Mi change asignado es "Horarios de atención, bloqueos y disponibilidad" (C04 en el plan del equipo;
buscá su ID real en CHANGES.md).
Vamos con la fase EXPLORE de ese change.
Leé CHANGES.md, la knowledge-base (actores, modelos de datos, reglas de negocio, features, flujos,
arquitectura y decisiones), openspec/specs/ y el código actual de la base técnica.
Devolveme:
1) qué dice el roadmap de mi change y de qué depende;
2) qué ya existe en el código que debo reutilizar (modelos de Prisma, helpers de autenticación y roles, layout, estados);
3) qué reglas de negocio de la knowledge-base aplican;
4) huecos o dudas que tengamos que decidir antes de proponer.
Restricciones: todavía no escribas código. Solo voy a tocar mi módulo (horarios).
No modifiques prisma/schema.prisma, CHANGES.md ni .active-orchestrator-state.json.
Guardá un resumen del relevamiento en docs/explore/horarios-disponibilidad.md.
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
  * Feliz: DADO un profesional que atiende los lunes de 09:00 a 12:00 sin turnos, CUANDO se pide la disponibilidad de un lunes para 30 minutos, ENTONCES se ofrecen inicios de 09:00 a 11:30.
  * Error de negocio: DADO una franja de 09:00 a 12:00 los lunes, CUANDO se intenta cargar otra de 11:00 a 14:00 el mismo día, ENTONCES se rechaza por superposición.
  * Borde: DADO una franja de 09:00 a 12:00, CUANDO se carga otra de 12:00 a 14:00 el mismo día, ENTONCES se acepta (empieza justo cuando termina la anterior).
  * Bloqueo: DADO un bloqueo de 10:00 a 11:00, CUANDO se pide la disponibilidad de ese día para 30 minutos, ENTONCES no se ofrece ningún inicio que se superponga con el bloqueo.
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
git add . && git commit -m "spec(horarios): propuesta del change con escenarios"
```

### Paso 6 — APPLY (con TDD)

```text
La especificación está aprobada. Vamos con APPLY de mi change, con TDD estricto:
primero el test de cada escenario (rojo), después la implementación mínima (verde), después refactor.
Implementá solo lo que está en specs/ y tasks.md. Si aparece algo que no está especificado,
frená y preguntame: volvemos a PROPOSE, no se improvisa en APPLY.
Reutilizá los helpers existentes de autenticación/roles y los componentes del layout.
Usá solo datos ficticios. Marcá cada tarea de tasks.md a medida que la completes.
Al final corré npm test y mostrame el resultado.
```

Commit:

```bash
git add . && git commit -m "feat(horarios): implementación del change contra la spec"
```

### Paso 7 — VERIFY

```text
Vamos con VERIFY de mi change. Corré npm test, npm run lint y npm run typecheck.
Mostrame una tabla: escenario del spec → test que lo cubre → resultado.
Verificá que no se tocaron archivos fuera de mi módulo (git diff --stat main).
Si algo está en rojo, no avancemos a ARCHIVE: decime qué falla.
```

✅ Todo verde. 📸 Captura de la terminal con los tests pasando.

Probá la pantalla vos mismo: `npm run dev` → <http://localhost:3000/configuracion/horarios> (con el `.env` y el usuario de prueba que te pasó el líder).

### Paso 8 — ARCHIVE

```text
Vamos con ARCHIVE de mi change: sincronizá las specs en openspec/specs/ y mové el change a archive/.
NO modifiques CHANGES.md ni .active-orchestrator-state.json: los actualiza el líder al mergear.
Después guardá en Engram un resumen de las decisiones, hallazgos y ajustes de este change.
```

```bash
git add . && git commit -m "chore(openspec): archivar change horarios-disponibilidad"
```

### Paso 9 — Pull Request

```bash
git push -u origin feat/c04-horarios
```

```bash
gh pr create --base main --fill --reviewer franciscode11
```

Completá la plantilla del PR (qué hiciste, qué ajustaste, captura de los tests en verde) y asigná a `franciscode11` como reviewer. Avisá por WhatsApp. **No mergees vos.**

---

## Si terminás antes

Avisale al líder antes de arrancar algo nuevo. Idea posible: Que el formulario de crear turno sugiera solo horarios disponibles (se coordina con Joaquín E. después de que ambos estén mergeados).

## Tu parte del video (≈ 1 min 15 s)

Detalle de cómo grabar en [`../03-guion-video.md`](../03-guion-video.md). Tu guion:

| Tiempo | Qué se ve | Qué decís |
|---|---|---|
| 0:00–0:10 | **Tu cámara** | "Hola, soy Lautaro de Coninck, legajo 51954. Me tocó el change de horarios de atención, bloqueos y disponibilidad." |
| 0:10–0:20 | `CHANGES.md` con tu change | "Este change permite cargar horarios de atención y bloqueos y calcular los horarios libres. Depende solo de la base técnica, por eso lo pudimos hacer en paralelo." |
| 0:20–0:45 | Tu spec en VS Code (escenarios) y la captura del Ajustar | "En propose revisé la especificación: la IA no había contemplado que una franja que empieza a las 12:00 cuando otra termina a las 12:00 no es superposición, y lo ajusté con un escenario de borde." |
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
| El agente propone crear un *worktree* u otra rama | Decile: "Trabajo en la rama actual (feat/c04-horarios), no crees worktrees ni ramas nuevas". |
| No sabés qué contestarle al agente | Copiá su pregunta y mandala al grupo. **No improvises.** |
