# Explore: C-08 estadisticas-del-consultorio

- **Fecha:** 2026-11-26
- **Responsable:** francisco-valles (líder). Relevamiento preparado con IA para revisión del líder.
- **Modo:** SDD (ciclo OPSX). Governance: BAJO (solo lectura, sin escrituras ni tablas nuevas).
- **Change OpenSpec:** `estadisticas-del-consultorio`.
- **Fuentes leídas:** ficha `[C-08]` de `CHANGES.md`, `AGENTS.md`, `knowledge-base/03` §RBAC, `05` §RN-ST y §RN-GL, `06` US-070, `09` DD-16, `design-system/README.md`, `design-system/screens/estadisticas.html`, `prisma/schema.prisma`, `src/domain/shared/*`, `src/domain/horarios/*`, `src/server/auth/*`, `src/server/horarios/*`, `src/app/(panel)/configuracion/horarios/` y `src/app/(panel)/turnos/`.

## 1. Qué pide la ficha

**Resultado verificable:** el ADMIN ve en `/estadisticas` turnos dados, ocupación, ausentismo y cancelaciones del período con variación contra el anterior, turnos por día, motivos de cancelación y tabla por profesional; los demás roles no acceden; los cálculos tienen tests con datos ficticios.

**Zona:** `src/app/(panel)/estadisticas/`, `src/domain/estadisticas/`, `src/server/estadisticas/`, `tests/estadisticas/` (más `openspec/changes/estadisticas-del-consultorio/` y `docs/explore/`).

**Dependencias:** solo C-01 (`[x]`). Se reutilizan sin modificar: `fechas.ts`, `estados.ts`, `intervalos.ts`, `requireRol`, `accesoPagina`, `Resultado` y los componentes de `src/components/ui`.

## 2. Reglas que aplican

| Código | Regla | Dónde se cubre |
|---|---|---|
| RN-ST-01 | Solo ADMIN ve estadísticas. | `accesoPagina("estadisticas.ver")` en la página y `requireRol(["ADMIN"])` en la consulta |
| RN-ST-02 | Turnos dados = turnos con inicio en el período, cualquier estado. | `turnosDelPeriodo` (intervalo `[inicio, fin)`) |
| RN-ST-03 | Ocupación = minutos de turnos que ocupan agenda / minutos de franjas del período descontando bloqueos. | `minutosDeAtencion` + `minutosOcupados` |
| RN-ST-04 | Ausentismo = AUSENTE / (ATENDIDO + AUSENTE). | `calcularIndicadores` |
| RN-ST-05 | Cancelaciones = CANCELADO / turnos dados; motivos agrupados por texto normalizado. | `calcularIndicadores`, `agruparMotivos` |
| RN-ST-06 | Comparación con el período anterior de igual duración. | `periodoAnterior`, `calcularVariacion` |
| RN-ST-07 | Función pura en `src/domain/estadisticas/`, solo lectura. | Todo el dominio; el servidor solo lee |
| RN-TU-04 | Ocupan agenda todos los estados salvo CANCELADO. | `ocupaAgenda` de `shared/estados.ts` |
| RN-GL-03 | Fechas en hora de Argentina. | Períodos en fechas locales `AAAA-MM-DD` convertidas con `aInstante` |
| US-070 | 10 atendidos y 2 ausentes → 16,7 %; sin atendidos ni ausentes → "Sin datos". | Tests de dominio |

## 3. Datos disponibles (esquema existente, sin cambios)

- `Turno`: `inicio`, `fin`, `estado`, `motivoCancelacion`, `profesionalId`, `prestacionId`.
- `HorarioAtencion`: `profesionalId`, `diaSemana` (ISO), `horaDesde`, `horaHasta` (hora local).
- `Bloqueo`: `profesionalId`, `desde`, `hasta`.
- `Profesional` (nombre, especialidad, avatar, `usuario.avatar`) y `Prestacion` (nombre).
- No hace falta `HistorialTurno`: el estado actual y el motivo están en `Turno`.

## 4. Decisiones propuestas (para revisión del líder)

| # | Tema | Propuesta |
|---|---|---|
| D1 | Períodos | `semana` (lunes a domingo ISO que contiene la fecha), `mes` (calendario) y `rango` (desde-hasta inclusive, máximo 92 días). Por defecto: mes actual. Cualquier parámetro inválido → período por defecto. |
| D2 | Período anterior (RN-ST-06) | Semana → semana anterior; rango → los N días inmediatamente anteriores; mes → mes calendario anterior (la referencia de diseño compara "vs. octubre"). Se interpreta "igual duración" como la misma unidad calendario; queda anotado para el líder. |
| D3 | "Sin datos" | Toda proporción con denominador 0 vale `null` y se muestra "Sin datos", nunca 0 %. La variación de una proporción es en puntos y es `null` si alguno de los dos lados es `null`; la de un conteo es porcentual y es `null` si el anterior es 0. |
| D4 | Ocupación | Numerador: suma de `fin - inicio` de turnos que ocupan agenda con inicio en el período. Denominador: por cada día del período y franja de su día ISO, minutos de la franja menos la unión de bloqueos del mismo profesional que se superponen. Se usan las franjas vigentes (el esquema no guarda historial de franjas). |
| D5 | Motivos | Normalización: trim, espacios colapsados, minúsculas y sin tildes. Etiqueta visible: la primera variante encontrada. Turnos cancelados sin motivo → "Sin motivo". |
| D6 | Filtro por profesional | El diseño tiene "Todos los profesionales": se agrega el parámetro `profesional` (inválido → todos). |
| D7 | Gráfico | Barras apiladas por día (atendidos y ausentes) con HTML/CSS y tokens, sin librerías nuevas. |
| D8 | Servidor | `crearConsultaEstadisticas({ requireRol, repo })` inyectable para testear permisos sin base, igual que `src/server/horarios/`. |

## 5. Riesgos

- Rangos largos: se limita a 92 días para que la consulta y el gráfico sigan siendo livianos.
- Franjas cambiadas a mitad de período: la ocupación histórica usa las franjas actuales (limitación aceptada por DD-16 "versión simple").
- Ningún archivo compartido necesita cambios.
