# Design

## Context

Motivación y alcance en `proposal.md`; comportamiento en `specs/`. Este change se apoya en el contrato de C-01 (`base-tecnica`), ya mergeado en `main`. Las firmas usadas se confirmaron contra el código real en la tarea 1.1 (ver "Confirmación de firmas de C-01" al final).

Restricciones: solo se escriben archivos en la Zona de C-04 (`src/app/(panel)/configuracion/horarios/`, `src/domain/horarios/`, `src/server/horarios/`, `tests/horarios/`); no se tocan `prisma/schema.prisma`, `src/components/ui/`, `src/domain/shared/` ni el layout. Modelo de datos fijo (KB 04): `HorarioAtencion` guarda `diaSemana` 1-7 ISO y horas `"HH:mm"` locales; `Bloqueo` guarda `desde`/`hasta` `timestamptz` con `CHECK desde < hasta`. La base no tiene restricción de exclusión para franjas: RN-HO-02 vive solo en el dominio.

## Goals / Non-Goals

**Goals:**
- Toda regla de C-04 como función pura en `src/domain/horarios/`, testeada con Vitest sin base ni reloj real.
- Una sola definición de superposición: reutilizar `seSuperponen` de C-01 tanto para franjas como para disponibilidad.
- Server Actions finas que siguen el Flujo 2 (sesión → rol → Zod → carga → dominio → escritura → `revalidatePath`).

**Non-Goals:**
- Exponer la disponibilidad a C-05 o modificar su formulario (etapa posterior, coordinada con Joaquín E.).
- Restricciones nuevas en la base para franjas.
- Tests contra la base de datos o de interfaz end-to-end en el CI.

## Decisions

### 1. Representación de horas y conversión a instantes
Las franjas se manejan en el dominio como minutos desde la medianoche (`"09:30"` → 570), con funciones `parsearHora` y `formatearMinutos` propias del módulo. Para comparar franjas entre sí se arman intervalos `{ inicio, fin }` sobre una fecha base fija (por ejemplo, `new Date(Date.UTC(2000, 0, 3))` + minutos) y se pasa a `seSuperponen`, así la regla `[desde, hasta)` es exactamente la misma que la de turnos. Para la disponibilidad, cada franja del día se convierte a instantes reales con `aInstante(fecha, hora)` de C-01 (hora de Argentina → UTC), y bloqueos y turnos ya vienen como instantes.
*Alternativa:* comparar strings `"HH:mm"` directamente (funciona por orden lexicográfico, pero duplica la definición de superposición; descartada).

### 2. Funciones del dominio (`src/domain/horarios/`)
- `franjas.ts`: `validarFranja(franja)` → errores por campo (RN-HO-01, formato `HH:mm` 00:00-23:59); `franjasSeSuperponen(a, b)`; `validarFranjaContraExistentes(nueva, existentes, idEnEdicion?)` que filtra por mismo profesional y día y excluye la propia al editar (RN-HO-02).
- `bloqueos.ts`: `validarBloqueo(bloqueo)` → desde < hasta y motivo con `trim()` no vacío (RN-HO-03).
- `disponibilidad.ts`: `calcularDisponibilidad(franjas, bloqueos, turnos, fecha, duracion)` → `Date[]` ordenado. Pasos: día ISO de la fecha → franjas de ese día → por cada franja, inicios cada `PASO_MINUTOS` con `inicio + duración ≤ hasta` → descartar los que se superponen con un bloqueo o con un turno cuyo estado `ocupaAgenda` → ordenar y quitar repetidos. No conoce la hora actual (D3: no filtra el pasado) ni el sillón (P-04).
- ~~`dia-semana.ts`~~: no se crea; C-01 ya expone `diaSemanaIso(fecha)` en `src/domain/shared/fechas.ts` con el mismo cálculo (`Date.UTC` sobre la fecha calendario) y se reutiliza.
- `constantes.ts`: `PASO_MINUTOS = 5` (SU-03), `DURACION_MINIMA = 10`, `DURACION_MAXIMA = 240`.
- `esquemas.ts`: esquemas Zod de franja, bloqueo y consulta de disponibilidad, compartidos por formularios y acciones. El mensaje de error se arma en el dominio para que pantalla y servidor muestren el mismo texto.
Tipos de entrada propios del módulo (`FranjaDominio`, `BloqueoDominio`, `TurnoOcupacion`) para no acoplar el dominio a los tipos generados de Prisma.
*Alternativa:* una sola función de disponibilidad que consulte la base (descartada: rompe RN-GL-05 y el test sin base).

### 3. Server Actions (`src/server/horarios/`)
- `franjas.ts`: `crearFranja`, `editarFranja`, `eliminarFranja` → `requireRol(["ADMIN"])`. Crear y editar cargan las franjas del mismo profesional y día y validan con el dominio dentro de una transacción de Prisma, para reducir la ventana de carrera entre dos ADMIN.
- `bloqueos.ts`: `crearBloqueo`, `editarBloqueo`, `eliminarBloqueo` → `requireRol(["ADMIN"])`. Los instantes llegan del selector fecha-hora de `src/components/ui` y se convierten con `aInstante`. Si la base rechaza por su `CHECK`, se devuelve el mismo mensaje del dominio.
- `disponibilidad.ts`: `consultarDisponibilidad({ profesionalId, fecha, duracion })` → `requireRol(["ADMIN", "RECEPCION", "PROFESIONAL"])`; verifica profesional activo (RN-CA-05); carga franjas del día ISO, bloqueos y turnos que se superponen con `rangoDelDia(fecha)` (con `select` mínimo y filtro `estado in ESTADOS_QUE_OCUPAN_AGENDA`); llama a `calcularDisponibilidad`.
- `consultas.ts`: lecturas para la pantalla (profesionales activos, franjas por profesional, bloqueos desde hoy).
Todas devuelven el resultado estándar `{ ok, data } | { ok: false, error, campos? }` de C-01. Eliminar es borrado físico (D9): ni `HorarioAtencion` ni `Bloqueo` tienen turnos asociados ni campo `activo`.

### 4. Pantalla `/configuracion/horarios`
Server Component que lee `?profesional=<id>&fecha=AAAA-MM-DD&duracion=30` (valores inválidos → primer profesional activo, hoy y 30). Tres secciones en Card: **Horario semanal** (Table por día lunes a domingo con sus franjas; ADMIN ve agregar, editar y eliminar en Dialog con FormField + selector de hora), **Bloqueos** (Table con desde, hasta y motivo en hora de Argentina; ADMIN con Dialog y selector fecha-hora y Textarea para motivo) y **Disponibilidad del día** (selector de profesional, fecha, duración o prestación activa para precargarla; lista de inicios como Badges o grilla de chips de `src/components/ui`; estado vacío con "El profesional no atiende ese día" o "No hay horarios disponibles para esa duración"). Errores por Toast y por campo. `loading.tsx` con Skeleton. Los controles de edición se ocultan para RECEPCION y PROFESIONAL, pero el control real es `requireRol` en cada acción. Si hace falta un componente que no existe en `src/components/ui`, se pide al líder; no se crean componentes propios.

### 5. Tests (`tests/horarios/`)
Un test por escenario de las specs que sea de dominio: `horas.test.ts`, `franjas.test.ts`, `bloqueos.test.ts`, `disponibilidad.test.ts`, `dia-semana.test.ts`, `esquemas.test.ts`, citando el código RN en el nombre del test. Los de disponibilidad corren con `TZ=UTC` y `TZ=Europe/Madrid` para el escenario de servidor en otra zona. Los escenarios de permisos se cubren con tests de las acciones usando `requireRol` y Prisma simulados (inyección de dependencias), sin base real.

## Confirmación de firmas de C-01 (tarea 1.1, 2026-11-25)

Verificado contra `main` con C-01 mergeado (`npm ci && npm test` en verde antes de empezar: 38 tests). El comportamiento de las specs no cambia; estos son los ajustes de nombres y estructura:

| Propuesta | Código real de C-01 | Ajuste en apply |
|---|---|---|
| `seSuperponen`, `ESTADOS_QUE_OCUPAN_AGENDA`, `ocupaAgenda` | Existen con esos nombres en `src/domain/shared/{intervalos,estados}.ts` | Se usan tal cual |
| `aInstante`, `rangoDelDia`, `formatearHora`, `formatearFecha` | Existen en `src/domain/shared/fechas.ts` | Se usan tal cual |
| `diaSemanaIso` propio en `dia-semana.ts` | C-01 ya lo expone en `fechas.ts`, junto con `esHoraValida`, `minutosDelDia`, `fechaLocal`, `horaLocal` | No se crea `dia-semana.ts`; `horas.ts` reutiliza `esHoraValida` y `minutosDelDia` |
| `requireRol(["ADMIN"])` | `requireRol(roles)` en `src/server/auth/index.ts`, lanza `ErrorDeAcceso`; `conAcceso` de `src/server/resultado.ts` lo convierte en `fallo("No autenticado" \| "Sin permisos")` | Las acciones usan `requireRol` + `conAcceso`. La matriz de C-01 (`src/server/auth/matriz.ts`) ya tiene `horarios.ver/editar`, `bloqueos.ver/editar` y `disponibilidad.ver`; un test comprueba que `ROLES_EDICION` y `ROLES_CONSULTA` coinciden con ella |
| Resultado `{ ok, data } \| { ok: false, error, campos? }` | `Resultado`, `exito`, `fallo`, `conAcceso` en `src/server/resultado.ts` | Se usa tal cual |
| Página con sesión | `accesoPagina(permiso)` en `src/server/auth/pagina.ts` | La página usa `accesoPagina("horarios.ver")` y `puede(rol, "horarios.editar" \| "bloqueos.editar")` para mostrar controles |
| Card, Table, Dialog, Textarea, Skeleton, Badges | `Tarjeta`, `Tabla*`, `Dialogo`/`CerrarDialogo`, `AreaTexto`, `Esqueleto`, `Etiqueta`, más `FormField`, `Selector`, `SelectorHora`, `SelectorFecha`, `SelectorFechaHora`, `EntradaNumero`, `EstadoVacio`, `useToast` | Nombres en español de `@/components/ui`; los inicios se muestran como `Etiqueta` (solo lectura) agrupados por franja |

Decisiones de estructura tomadas en apply (sin cambio de comportamiento):
- **Inyección de dependencias en las acciones.** La lógica del Flujo 2 vive en `crearAccionesHorarios(deps)` (`src/server/horarios/acciones.ts`), con `requireRol`, un `RepositorioHorarios` (`tipos.ts`) y `revalidar`. `repositorio.ts` es la implementación con Prisma, `instancia.ts` conecta lo real, y `franjas.ts`, `bloqueos.ts` y `disponibilidad.ts` son archivos `"use server"` de una línea por acción. Los tests usan un doble en memoria (`tests/horarios/doble-repositorio.ts`), sin base.
- **Entrada de edición** `{ id, datos }` (`editarFranja`, `editarBloqueo`); eliminar recibe `{ id }`.
- **Franjas en transacción; bloqueos sin transacción** (no hay regla entre filas de bloqueos). Si la base rechaza un bloqueo por sus CHECK (`bloqueo_hasta_posterior_a_desde`, `bloqueo_motivo_obligatorio`), el repositorio lanza `RestriccionDeBloqueo` y la acción devuelve el mismo mensaje del dominio.
- **Mensajes nuevos de soporte** (no son reglas de negocio): "El profesional no existe", "La franja ya no existe", "El bloqueo ya no existe", "Ingresá una hora válida (HH:mm)", "Ingresá una fecha válida", "Ingresá una fecha y hora válidas", "Elegí un día de la semana". La carga de franjas y bloqueos no exige profesional activo (las specs no lo piden); la consulta de disponibilidad sí (RN-CA-05).
- **Selectores de hora en la pantalla**: grilla cada 15 minutos (06:00-23:45 para franjas, 00:00-23:45 para bloqueos). El dominio y las acciones aceptan cualquier `HH:mm` válido.
- **Lista de bloqueos**: muestra los vigentes y futuros (`hasta` posterior a ahora).
- **Duración en la pantalla**: se escribe libre y se consulta 500 ms después del último valor válido; un valor inválido muestra el mensaje de RN-CA-02 en el campo.

## UI Mockups

- Design system revision: 3
- Decision: no (project policy)
- Mockups: no aplica (modo `system-only`); referencia visual en `design-system/screens/` y `design-system/components.html`.

## Risks / Trade-offs

- [Los nombres de C-01 podían cambiar] → resuelto en la tarea 1.1 (ver "Confirmación de firmas de C-01").
- [Sin restricción de exclusión para franjas en la base, dos ADMIN simultáneos podrían crear franjas superpuestas] → validación dentro de una transacción; riesgo bajo (un ADMIN por consultorio). Si se quiere garantía fuerte, pedir al líder una restricción en una migración futura.
- [Un inicio ofrecido puede fallar al crear el turno por sillón ocupado (IN-05)] → aceptado en el MVP; C-05 muestra "El sillón ya está ocupado en ese horario".
- [Con pasos de 5 minutos la lista puede ser larga (hasta 100+ inicios en un día)] → mostrar agrupado por franja; la constante permite pasar a 15 sin tocar el modelo (SU-03).
- [Franjas contiguas no se unen para la disponibilidad (D11)] → lectura literal de RN-HO-04; si el líder decide unirlas, cambia un escenario y una función, no el modelo.

## Migration Plan

Sin migraciones ni datos nuevos: usa las tablas y el seed de C-01. Despliegue con el merge del PR de C-04 a `main` después de C-01. Rollback: revertir el PR; las filas de franjas y bloqueos que haya cargado el ADMIN quedan válidas para el esquema.

## Open Questions

Decisiones por defecto tomadas con la propuesta de la KB, **a confirmar por Lautaro y el líder** (detalle en `docs/explore/horarios-disponibilidad.md` §4). Cambiarlas ajusta una constante, un escenario o un filtro, no la arquitectura:
- D1 / SU-03: pasos de 5 minutos (`PASO_MINUTOS`).
- D2 / P-04, IN-05: la disponibilidad no filtra por sillón.
- D3: los inicios ya pasados del día de hoy se listan (RN-TU-09 aplica al crear el turno).
- D4: un bloqueo no modifica turnos existentes.
- D11: un inicio no puede cruzar dos franjas contiguas.
