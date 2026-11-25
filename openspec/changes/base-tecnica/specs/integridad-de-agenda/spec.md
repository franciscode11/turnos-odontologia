# Spec Delta

## Purpose

Define una sola vez qué significa que dos turnos se superpongan y qué estados ocupan agenda, y garantiza en la base de datos que nunca existan turnos superpuestos por profesional ni por sillón, aunque falle la interfaz o haya dos reservas simultáneas.

## ADDED Requirements

### Requirement: Solapamiento de intervalos semiabiertos
Dos intervalos `[inicio, fin)` SHALL considerarse superpuestos si y solo si `inicioA < finB` y `inicioB < finA`. Un intervalo que empieza exactamente cuando termina otro no se superpone (RN-TU-01). Esta definición MUST ser la misma para todos los módulos.

#### Scenario: Intervalos que se cruzan
- **WHEN** se comparan 09:00-09:30 y 09:15-10:00 del mismo día
- **THEN** el resultado es que se superponen

#### Scenario: Intervalos que solo se tocan
- **WHEN** se comparan 09:00-09:30 y 09:30-10:00 del mismo día
- **THEN** el resultado es que no se superponen

#### Scenario: Un intervalo contiene al otro
- **WHEN** se comparan 09:00-11:00 y 09:30-10:00 del mismo día
- **THEN** el resultado es que se superponen

### Requirement: Estados que ocupan agenda
Los estados `RESERVADO`, `CONFIRMADO`, `ATENDIDO` y `AUSENTE` SHALL ocupar agenda; `CANCELADO` no (RN-TU-04). Los estados finales SHALL ser `CANCELADO`, `ATENDIDO` y `AUSENTE`. La lista compartida MUST coincidir con la condición de las restricciones de la base.

#### Scenario: Un turno cancelado libera el horario
- **GIVEN** un turno `CANCELADO` del Dr. Lautaro de Coninck de 10:00 a 10:30
- **WHEN** se evalúa si ocupa agenda
- **THEN** no ocupa agenda

#### Scenario: Un turno ausente sigue ocupando
- **GIVEN** un turno `AUSENTE` de 10:00 a 10:30
- **WHEN** se evalúa si ocupa agenda
- **THEN** ocupa agenda

#### Scenario: Lista alineada con la base
- **WHEN** se compara la lista de estados que ocupan agenda con los estados del modelo de datos
- **THEN** contiene todos los estados excepto `CANCELADO`, que es exactamente el criterio de las restricciones de exclusión

### Requirement: La base impide turnos superpuestos por profesional
La base de datos MUST rechazar cualquier inserción o actualización que deje dos turnos del mismo profesional, en estados que ocupan agenda, con intervalos superpuestos, incluso si las dos operaciones llegan al mismo tiempo (RN-TU-02, RN-TU-05, RN-TU-06).

#### Scenario: Segundo turno superpuesto del mismo profesional
- **GIVEN** un turno `RESERVADO` del Dr. Joaquín Cortez de 09:00 a 09:30 en el Sillón 1
- **WHEN** se intenta guardar otro turno del Dr. Joaquín Cortez de 09:15 a 09:45 en el Sillón 2
- **THEN** la base rechaza la escritura con una violación de exclusión y el turno no se guarda

#### Scenario: Turno contiguo del mismo profesional
- **GIVEN** un turno `CONFIRMADO` del Dr. Joaquín Cortez de 09:00 a 09:30
- **WHEN** se guarda otro turno suyo de 09:30 a 10:00
- **THEN** la base lo acepta

#### Scenario: Reutilizar el horario de un turno cancelado
- **GIVEN** un turno `CANCELADO` del Dr. Joaquín Cortez de 09:00 a 09:30
- **WHEN** se guarda otro turno suyo de 09:00 a 09:30
- **THEN** la base lo acepta, porque el cancelado no ocupa agenda

### Requirement: La base impide turnos superpuestos por sillón
La base de datos MUST rechazar cualquier escritura que deje dos turnos del mismo sillón, en estados que ocupan agenda, con intervalos superpuestos, aunque sean de profesionales distintos (RN-TU-03, RN-TU-06).

#### Scenario: Mismo sillón, distinto profesional
- **GIVEN** un turno del Dr. Joaquín Cortez de 11:00 a 12:00 en el Sillón 1
- **WHEN** se intenta guardar un turno del Dr. Joaquín Echenagorria de 11:30 a 12:00 en el Sillón 1
- **THEN** la base rechaza la escritura y el turno no se guarda

#### Scenario: Mismo horario en otro sillón
- **GIVEN** un turno del Dr. Joaquín Cortez de 11:00 a 12:00 en el Sillón 1
- **WHEN** se guarda un turno del Dr. Joaquín Echenagorria de 11:00 a 12:00 en el Sillón 2
- **THEN** la base lo acepta

#### Scenario: Reactivar un cancelado que choca
- **GIVEN** un turno `CANCELADO` de 11:00 a 12:00 en el Sillón 1 y otro `RESERVADO` en el mismo sillón y horario
- **WHEN** se intenta cambiar el cancelado a `RESERVADO`
- **THEN** la base rechaza la actualización

### Requirement: Validaciones estructurales en la base
La base de datos MUST rechazar un turno o bloqueo cuyo fin no sea posterior a su inicio, un turno `CANCELADO` sin motivo, una prestación con duración fuera de 10 a 240 minutos o que no sea múltiplo de 5, y dos pacientes activos con el mismo DNI.

#### Scenario: Turno con fin anterior al inicio
- **WHEN** se intenta guardar un turno de 10:00 a 09:30
- **THEN** la base rechaza la escritura

#### Scenario: Cancelación sin motivo
- **WHEN** se intenta guardar un turno con estado `CANCELADO` y motivo vacío
- **THEN** la base rechaza la escritura

#### Scenario: DNI repetido solo entre activos
- **GIVEN** un paciente inactivo con DNI `30111222`
- **WHEN** se da de alta un paciente activo con DNI `30111222`
- **THEN** la base lo acepta; y si ya hubiera un paciente activo con ese DNI, la rechazaría
