# 👋 Leeme primero

Esta carpeta tiene **todo** lo que necesitás para hacer tu parte del Global. Está escrita para alguien que nunca usó estas herramientas: seguila en orden y no te saltees pasos.

## ¿Qué estamos haciendo?

Un **sistema de turnos para consultorios odontológicos** (agenda, pacientes, profesionales, turnos). Pero lo que se evalúa **no es el sistema en sí**, sino **cómo lo construimos**:

1. **Nadie escribe código a mano.** Le damos instrucciones a una IA (Claude Code o Codex).
2. Antes de que la IA programe algo, se escribe una **especificación** (qué tiene que hacer el sistema, con ejemplos verificables del tipo *dado / cuando / entonces*). Eso se llama **Spec-Driven Development (SDD)**.
3. Usamos **OpenSpec** (guarda las especificaciones como archivos) y **Active Stack** (le enseña a tu IA a trabajar con este método).
4. Cada funcionalidad es un **change** y pasa por 5 fases, el **ciclo OPSX**:

| Fase | Qué pasa | Qué hacés vos |
|---|---|---|
| **explore** | La IA investiga el proyecto y el problema | Leer lo que encontró |
| **propose** | La IA escribe la especificación del change | **Leerla entera y corregirla (Ajustar)** ← lo más importante |
| **apply** | La IA programa contra la especificación aprobada, con tests | Esperar y mirar |
| **verify** | Se corren los tests: todo tiene que dar verde | Comprobar que pasan |
| **archive** | El change se cierra y las specs quedan como historial | Confirmar |

> 🧠 **La regla de oro del profesor:** no apretar "Continuar" en automático. Lo que se evalúa es que **leíste** lo que generó la IA y **corregiste** lo que estaba mal. Cada vez que uses **Ajustar**, sacá una captura: va al video y a la reflexión.

## ¿Cómo nos organizamos?

- Hay **un solo repositorio** en GitHub. La rama `main` es la versión oficial y **solo el líder (Francisco) la mergea**.
- **Cada uno trabaja en su propia rama** (por ejemplo `feat/c02-pacientes`), hace su change ahí y abre un **Pull Request (PR)**.
- El líder revisa el PR, y si los tests dan verde, lo mergea a `main`.
- Así GitHub muestra los commits de cada uno (la cátedra lo exige: *cada integrante con sus propios commits*).

## Quién hace qué

| Integrante | Legajo | Change (funcionalidad) | Guía personal |
|---|---|---|---|
| Francisco Diego Valles Adad (líder) | 52147 | Fundación del proyecto + base técnica (C01) + integración | [`04-plan-lider.md`](04-plan-lider.md) |
| Octavio Crescini | 51949 | Gestión de pacientes | [`integrantes/octavio-crescini.md`](integrantes/octavio-crescini.md) |
| Joaquín Cortez Badaloni | 51948 | Profesionales, prestaciones y sillones | [`integrantes/joaquin-cortez-badaloni.md`](integrantes/joaquin-cortez-badaloni.md) |
| Lautaro de Coninck | 51954 | Horarios de atención, bloqueos y disponibilidad | [`integrantes/lautaro-de-coninck.md`](integrantes/lautaro-de-coninck.md) |
| Joaquín Echenagorria | 51964 | Crear turno sin solapamientos | [`integrantes/joaquin-echenagorria.md`](integrantes/joaquin-echenagorria.md) |
| Ulises Iván Lucato Flores | 52021 | Cancelar turno y estados de asistencia | [`integrantes/ulises-lucato-flores.md`](integrantes/ulises-lucato-flores.md) |

> ⚠️ Los nombres de los changes son los **planificados**. El nombre e ID exactos salen del archivo `CHANGES.md` que genera la fundación. Cuando el líder lo mergee, buscá tu change ahí.

## Cronograma (entrega: jueves 26/11 a las 12:00)

| Cuándo | Líder | Integrantes |
|---|---|---|
| **Martes 24 — mañana** | Instala Active Stack, crea el repo, corre la fundación (Discovery) | Paso 1: [`01-prerequisitos.md`](01-prerequisitos.md) (instalar todo). Mandar usuario de GitHub al líder |
| **Martes 24 — tarde** | Knowledge-base, roadmap, reglas del agente | Aceptar invitación, clonar el repo, **Tarea 0**: verificar una fuente del Discovery y abrir tu primer PR ([`02-git-y-prs.md`](02-git-y-prs.md)) |
| **Martes 24 — noche** | Change C01: base técnica (Next.js, Supabase, Prisma, login y roles) | Leer tu guía personal y la knowledge-base |
| **Miércoles 25** | Revisar y mergear PRs, resolver dudas | **Tu change completo** (OPSX) + PR + grabar tu parte del video |
| **Jueves 26 — hasta 10:00** | Integración final, Engram, README, edición del video, entrega | Correcciones que pida el líder + tu párrafo de la reflexión |

## Orden de lectura

1. [`01-prerequisitos.md`](01-prerequisitos.md) — instalar todo (≈ 1 a 2 horas la primera vez).
2. [`02-git-y-prs.md`](02-git-y-prs.md) — cómo clonar, crear tu rama, hacer commits y abrir un PR.
3. Tu guía personal en [`integrantes/`](integrantes/) — tu change paso a paso, con los prompts para copiar y pegar.
4. [`03-guion-video.md`](03-guion-video.md) — qué decir en el video y cómo grabarlo.

## Las 8 reglas que no se rompen

1. **Nunca** trabajes directo en `main`. Siempre en tu rama.
2. **Nunca** subas el archivo `.env` ni ninguna clave o contraseña.
3. **Nunca** uses datos reales de personas: todo ficticio (nombres inventados, DNI inventados).
4. **No toques** `prisma/schema.prisma`, `CHANGES.md` ni `.active-orchestrator-state.json`. Si necesitás un cambio ahí, avisale al líder.
5. Trabajá **solo en los archivos de tu módulo** (tu guía dice cuáles son).
6. **No apruebes la especificación a la primera**: leela y usá Ajustar al menos una vez.
7. Antes de abrir el PR: `npm test` tiene que dar **todo verde**.
8. Si algo falla y no entendés por qué, **no improvises**: copiá el error completo y mandalo al grupo.
