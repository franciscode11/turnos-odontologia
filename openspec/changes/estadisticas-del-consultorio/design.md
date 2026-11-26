# Design

## Context

Ver `proposal.md` (Why) y `docs/explore/estadisticas.md`. El C-01 dejó el esquema completo (`Turno`, `HorarioAtencion`, `Bloqueo`, `Profesional`, `Prestacion`), las utilidades de fecha en hora de Argentina (`src/domain/shared/fechas.ts`), `ocupaAgenda` (RN-TU-04), `seSuperponen` (RN-TU-01), el control de acceso (`requireRol`, `accesoPagina`) y el sistema de componentes, incluidas las clases `.kpis`, `.bar-row`, `.legend` y `.chart-axis` del design system. El C-04 dejó el patrón de módulo de servidor inyectable (`crearAccionesHorarios({ requireRol, repo })`). Nada de eso se modifica.

## Goals / Non-Goals

**Goals:**
- Todo cálculo en funciones puras testeables sin base (RN-ST-07, RN-GL-05).
- Una sola lectura por período (actual + anterior) con `select` mínimo.
- Pantalla fiel a `design-system/screens/estadisticas.html` con componentes de `src/components/ui`.

**Non-Goals:**
- Caché de resultados, materializar indicadores o tablas nuevas.
- Historial de franjas: la ocupación usa las franjas vigentes.
- Librerías de gráficos.

## Decisions

### D1. Módulos del dominio
- `periodos.ts`: `Periodo = { tipo: "semana" | "mes" | "rango"; desde: string; hasta: string }` en fechas locales `AAAA-MM-DD` (hasta inclusive). `periodoSemana`, `periodoMes`, `periodoRango` (null si es inválido), `periodoAnterior`, `rangoUtc` (`[aInstante(desde), aInstante(hasta + 1 día))`), `fechasDelPeriodo`, `resolverPeriodo(params, hoy)` con Zod (inválido → mes actual) y `etiquetaPeriodo`.
- `indicadores.ts`: `calcularIndicadores(turnos, franjas, bloqueos, periodo)` devuelve conteos, minutos y tasas (`number | null`, null = "Sin datos").
- `comparacion.ts`: `calcularVariacion` (conteos en %, tasas en puntos, con sentido favorable por indicador).
- `desgloses.ts`: `turnosPorDia`, `agruparMotivos`, `turnosPorPrestacion`, `desglosePorProfesional`.
- `reporte.ts`: `armarReporte(datos, periodo, profesionalId?)` arma todo lo que la pantalla necesita a partir de los datos crudos del período actual y anterior.
- `formato.ts`: `formatearPorcentaje` ("16,7 %" o "Sin datos"), `formatearVariacion` ("+8,3 %", "-1,2 pts").
- Tipos de entrada propios (`TurnoEstadistica`, `FranjaEstadistica`, `BloqueoEstadistica`), sin depender de los tipos generados de Prisma (mismo criterio que C-04).

Alternativa descartada: calcular con `groupBy`/SQL en la base. Es más rápido con muchos datos, pero deja la regla fuera del dominio y no se puede testear sin base (RN-ST-07).

### D2. "Sin datos"
Toda proporción con denominador 0 devuelve `null`. La variación de una tasa es `null` si alguno de los dos valores es `null`; la de un conteo es `null` si el anterior es 0. La interfaz muestra "Sin datos" para cualquier `null`.

### D3. Ocupación (RN-ST-03)
- Denominador: para cada fecha del período y cada franja del profesional con ese día ISO, el intervalo `[aInstante(fecha, desde), aInstante(fecha, hasta))` menos la unión de los bloqueos del mismo profesional que se superponen (recortados al intervalo).
- Numerador: suma de `fin - inicio` de los turnos que ocupan agenda (`ocupaAgenda`) con inicio en el período.
- Se reutiliza `seSuperponen` para detectar bloqueos que tocan la franja.

### D4. Período anterior (RN-ST-06)
Semana → 7 días antes; rango → la misma cantidad de días inmediatamente antes; mes → mes calendario anterior. Para el mes se elige la unidad calendario porque la referencia aprobada compara "vs. octubre" y las tasas no dependen de la cantidad de días. Queda anotado para que el líder lo confirme.

### D5. Rango máximo de 92 días
Límite técnico para acotar la lectura y el ancho del gráfico (un trimestre). Fuera de rango → mes actual, como cualquier parámetro inválido.

### D6. Servidor
`src/server/estadisticas/consulta.ts` exporta `crearConsultaEstadisticas({ requireRol, repo })`: llama primero a `requireRol(["ADMIN"])` (RN-ST-01), después lee con el repositorio y arma el reporte con el dominio; devuelve `Resultado<Reporte>` y traduce `ErrorDeAcceso` con `conAcceso`. `repositorio.ts` hace las lecturas Prisma (solo `findMany` con `select`): turnos con inicio en `[anterior.inicio, actual.fin)`, franjas, bloqueos que se superponen, profesionales (activos o con turnos en el rango) y prestaciones. `instancia.ts` conecta la sesión real. Es una función de servidor (no Server Action con `"use server"`), porque la llama solo el Server Component de la página y no hay entrada de formulario; los parámetros llegan ya validados por `resolverPeriodo`.

### D7. Pantalla
- `page.tsx` (Server Component): `accesoPagina("estadisticas.ver")` → `SinPermiso`; lee `searchParams` (Promise en Next 16), resuelve período y profesional, llama a la consulta.
- `_componentes/filtros.tsx` (cliente): `ControlSegmentado` Semana/Mes/Rango, `SelectorFecha` (fecha de referencia o desde/hasta), `Selector` de profesional; navega con `router.push`. Anterior/siguiente con `BotonEnlace`.
- `_componentes/indicadores.tsx`: las 4 tarjetas `.kpi` con variación (`.up` si es favorable, `.down` si no).
- `_componentes/turnos-por-dia.tsx`: barras apiladas verticales con `div` y tokens (`--color-accent-600` y `--estado-ausente-fg`), con `aria-label` por día y leyenda.
- `_componentes/barras.tsx`: filas `.bar-row` para motivos y prestaciones dentro de `Tarjeta`.
- `_componentes/tabla-profesionales.tsx`: `Tabla` + `CeldaPersona` (avatar), barra de ocupación en línea.
- `loading.tsx`: `Esqueleto` con la misma grilla. Estado vacío con `EstadoVacio` cuando no hay turnos dados.

## UI Mockups

- Design system revision: 3
- Decision: no (project policy)
- Mockups: no aplica (modo `system-only`); referencia visual aprobada en `design-system/screens/estadisticas.html`.

## Risks / Trade-offs

- [Muchos turnos en un rango largo] → límite de 92 días y `select` mínimo; el cálculo es lineal.
- [Franjas cambiadas a mitad de período] → se usan las vigentes; limitación aceptada por DD-16 ("versión simple").
- [Mes anterior con distinta cantidad de días] → afecta solo la variación del conteo de turnos; las tasas son comparables. Pendiente de confirmación del líder (D4).
- [Turnos de profesionales inactivos] → cuentan en los totales y aparecen en la tabla solo si tienen turnos en el período.

## Open Questions

- Confirmar con el líder la interpretación de "igual duración" para el mes (D4). No cambia la estructura: es una línea de `periodoAnterior`.
