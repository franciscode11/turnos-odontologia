# Spec Delta

## Purpose

Darle al dueño del consultorio (ADMIN) indicadores simples del período elegido: turnos dados, ocupación de agenda, ausentismo y cancelaciones con sus motivos, comparados con el período anterior y desglosados por profesional y prestación, calculados en solo lectura sobre los turnos existentes.

## ADDED Requirements

### Requirement: Acceso exclusivo del ADMIN

El sistema SHALL mostrar las estadísticas y permitir su consulta solo a usuarios con sesión y rol ADMIN. Cualquier otro rol MUST ver el aviso de sección sin permisos en `/estadisticas` y la consulta del servidor MUST rechazarlo (RN-ST-01, RN-AU-03).

#### Scenario: El ADMIN consulta las estadísticas

- **WHEN** un usuario ADMIN con sesión pide las estadísticas del mes
- **THEN** el sistema devuelve los indicadores del período

#### Scenario: Recepción o un profesional intentan consultar

- **WHEN** un usuario RECEPCION o PROFESIONAL pide las estadísticas o entra a `/estadisticas`
- **THEN** el sistema responde "Sin permisos", no lee los turnos y la página muestra que no tiene permisos para ver la sección

#### Scenario: Consulta sin sesión

- **WHEN** se piden las estadísticas sin sesión
- **THEN** el sistema responde "No autenticado" sin leer datos

### Requirement: Período de análisis en hora de Argentina

El sistema SHALL calcular sobre un período elegido como semana (lunes a domingo), mes calendario o rango de fechas inclusive de hasta 92 días, interpretado en hora de Argentina. Un período ausente o inválido MUST reemplazarse por el mes actual (RN-GL-03, RN-ST-02).

#### Scenario: Semana que contiene una fecha

- **WHEN** se elige la semana del jueves 26/11/2026
- **THEN** el período va del lunes 23/11/2026 00:00 al lunes 30/11/2026 00:00 en hora de Argentina (exclusivo)

#### Scenario: Rango invertido o demasiado largo

- **WHEN** se pide un rango cuyo desde es posterior al hasta, de más de 92 días o con fechas inexistentes
- **THEN** el sistema usa el mes actual como período

#### Scenario: Turno a medianoche en el borde del mes

- **WHEN** un turno empieza el 01/12/2026 00:00 de Argentina (03:00 UTC) y otro el 30/11/2026 23:30 de Argentina
- **THEN** el primero cuenta en diciembre y el segundo en noviembre

### Requirement: Turnos dados del período

El sistema SHALL contar como turnos dados todos los turnos cuyo inicio cae dentro del período, en cualquier estado, y SHALL informar cuántos están atendidos, ausentes y cancelados (RN-ST-02).

#### Scenario: Turnos en todos los estados

- **WHEN** el período tiene 3 reservados, 1 confirmado, 10 atendidos, 2 ausentes y 2 cancelados
- **THEN** los turnos dados son 18, con 10 atendidos, 2 ausentes y 2 cancelados

#### Scenario: Turnos fuera del período

- **WHEN** hay turnos que empiezan antes del período o justo en el instante en que termina
- **THEN** esos turnos no cuentan como turnos dados del período

#### Scenario: Período sin turnos

- **WHEN** el período no tiene turnos
- **THEN** los turnos dados son 0 y la pantalla muestra el estado vacío "No hay turnos en este período"

### Requirement: Tasa de ausentismo

El sistema SHALL calcular el ausentismo como AUSENTE / (ATENDIDO + AUSENTE), con un decimal. Si no hay turnos atendidos ni ausentes MUST mostrar "Sin datos" y no 0% (RN-ST-04, US-070).

#### Scenario: Diez atendidos y dos ausentes

- **WHEN** el mes tiene 10 turnos atendidos y 2 ausentes
- **THEN** el ausentismo es 16,7%

#### Scenario: Reservados, confirmados y cancelados no cuentan

- **WHEN** el período tiene 1 atendido, 1 ausente y además reservados, confirmados y cancelados
- **THEN** el ausentismo es 50,0%, sin contar los otros estados en el denominador

#### Scenario: Sin atendidos ni ausentes

- **WHEN** el período solo tiene turnos reservados o cancelados
- **THEN** el ausentismo se muestra como "Sin datos"

### Requirement: Tasa de cancelación y motivos

El sistema SHALL calcular las cancelaciones como CANCELADO / turnos dados y SHALL agrupar los motivos por texto normalizado (sin distinguir mayúsculas, tildes ni espacios extra), ordenados de mayor a menor. Sin turnos dados MUST mostrar "Sin datos" (RN-ST-05).

#### Scenario: Cancelaciones del período

- **WHEN** el período tiene 20 turnos dados y 3 cancelados
- **THEN** la tasa de cancelación es 15,0%

#### Scenario: Motivos escritos de distinta forma

- **WHEN** los motivos son "Paciente avisó", "  paciente   AVISO " y "Enfermedad"
- **THEN** se muestran 2 motivos: "Paciente avisó" con 2 y "Enfermedad" con 1

#### Scenario: Sin turnos dados

- **WHEN** el período no tiene turnos
- **THEN** la tasa de cancelación se muestra como "Sin datos" y no hay motivos

### Requirement: Ocupación de agenda

El sistema SHALL calcular la ocupación como los minutos de turnos que ocupan agenda (todos salvo CANCELADO) sobre los minutos de atención de las franjas de cada día del período, descontando los bloqueos del mismo profesional. Si no hay minutos de atención MUST mostrar "Sin datos" (RN-ST-03, RN-TU-04).

#### Scenario: Franja con turnos

- **WHEN** un profesional atiende el lunes de 09:00 a 12:00 y ese lunes tiene turnos atendidos, reservados y ausentes que suman 90 minutos
- **THEN** la ocupación de ese día es 50,0%

#### Scenario: Bloqueos descuentan y cancelados no ocupan

- **WHEN** ese lunes tiene un bloqueo de 10:00 a 11:00 y un turno cancelado de 30 minutos además de 60 minutos de turnos activos
- **THEN** los minutos de atención son 120, el cancelado no suma y la ocupación es 50,0%

#### Scenario: Sin franjas en el período

- **WHEN** ningún profesional tiene franjas en los días del período o los bloqueos cubren todas las franjas
- **THEN** la ocupación se muestra como "Sin datos"

### Requirement: Comparación con el período anterior

El sistema SHALL comparar cada indicador con el período anterior: la semana previa, los mismos días inmediatamente anteriores para un rango y el mes calendario anterior para un mes. Los conteos varían en porcentaje y las tasas en puntos; si falta el dato de comparación MUST mostrar "Sin datos" (RN-ST-06).

#### Scenario: Más turnos y menos ausentismo

- **WHEN** el período actual tiene 312 turnos dados y 7,4% de ausentismo y el anterior 288 turnos y 8,6%
- **THEN** la variación de turnos es +8,3% y la de ausentismo -1,2 pts, marcada como favorable

#### Scenario: Período anterior de igual duración

- **WHEN** se elige el rango del 10/11/2026 al 19/11/2026
- **THEN** se compara con el rango del 31/10/2026 al 09/11/2026

#### Scenario: Período anterior sin datos

- **WHEN** el período anterior no tiene turnos
- **THEN** la variación de turnos dados y de cada tasa se muestra como "Sin datos"

### Requirement: Turnos por día

El sistema SHALL mostrar, para cada día del período en hora de Argentina, la cantidad de turnos atendidos y ausentes, en barras dibujadas con el sistema de diseño (RN-ST-02, RN-GL-03).

#### Scenario: Días con turnos

- **WHEN** el lunes 23/11/2026 tiene 3 atendidos y 1 ausente
- **THEN** la barra de ese día muestra 3 atendidos y 1 ausente

#### Scenario: Estados que no se grafican

- **WHEN** un día solo tiene turnos reservados o cancelados
- **THEN** la barra de ese día queda en 0 atendidos y 0 ausentes

#### Scenario: Día sin turnos dentro del período

- **WHEN** el período es una semana y el domingo no tiene turnos
- **THEN** el domingo aparece igual con valores en 0, para que haya un día por cada fecha del período

### Requirement: Desglose por profesional y por prestación

El sistema SHALL mostrar por profesional sus turnos dados, ocupación, ausentismo, cancelaciones y prestación más dada, y la cantidad de turnos por prestación, con las mismas fórmulas y "Sin datos" cuando un denominador es 0. El filtro por profesional MUST limitar todos los indicadores (RN-ST-02 a RN-ST-05).

#### Scenario: Tabla por profesional

- **WHEN** el Dr. Joaquín Cortez tiene 4 turnos en el mes, 3 de "Consulta" y 1 de "Limpieza", con 1 cancelado
- **THEN** su fila muestra 4 turnos, 25,0% de cancelaciones y "Consulta" como prestación más dada

#### Scenario: Profesional sin turnos ni franjas

- **WHEN** un profesional activo no tiene turnos ni franjas en el período
- **THEN** su fila muestra 0 turnos y "Sin datos" en ocupación, ausentismo y cancelaciones

#### Scenario: Filtro por un profesional inexistente

- **WHEN** se filtra por un profesional que no existe
- **THEN** el sistema muestra los indicadores de todos los profesionales
