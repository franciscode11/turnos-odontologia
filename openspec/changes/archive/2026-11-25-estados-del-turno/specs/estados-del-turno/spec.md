# Spec Delta

## Purpose

Gestionar el estado de los turnos con reglas consistentes de autorización, disponibilidad e historial para el consultorio.

## ADDED Requirements

### Requirement: Transiciones del turno

El sistema SHALL permitir confirmar un turno reservado y cancelar o registrar asistencia en turnos reservados o confirmados. Los estados cancelado, atendido y ausente son finales. La cancelación exige un motivo con contenido y libera la agenda. La asistencia solo se registra desde el inicio del turno (RN-ES-01 a RN-ES-05, RN-ES-08 y RN-TU-04).

#### Scenario: Confirmar un turno reservado

- **WHEN** recepción confirma un turno reservado
- **THEN** el turno pasa a confirmado

#### Scenario: Cancelar con motivo

- **WHEN** recepción cancela un turno reservado e informa un motivo
- **THEN** el turno queda cancelado, conserva el motivo y deja de ocupar la agenda

#### Scenario: Intentar modificar un estado final

- **WHEN** se intenta cancelar un turno atendido o cambiar cualquier otro estado final
- **THEN** el sistema rechaza la transición y conserva el estado

#### Scenario: Cancelar sin motivo

- **WHEN** se intenta cancelar con un motivo vacío o compuesto solo por espacios
- **THEN** el sistema rechaza la operación y solicita el motivo

#### Scenario: Registrar asistencia al inicio

- **WHEN** el profesional del turno marca atendido en el instante de inicio
- **THEN** el turno queda atendido

#### Scenario: Registrar asistencia antes del inicio

- **WHEN** se intenta marcar atendido o ausente en un turno que todavía no empezó
- **THEN** el sistema rechaza la operación

### Requirement: Autorización de las acciones

El sistema SHALL exigir una sesión válida y autorizar la confirmación y la cancelación para ADMIN y RECEPCION. ADMIN puede registrar asistencia en cualquier turno y PROFESIONAL solo en sus turnos (RN-AU-04, RN-AU-05 y RN-ES-07).

#### Scenario: Registrar la ausencia de un turno propio

- **WHEN** el profesional del turno marca ausente después del inicio
- **THEN** el turno queda ausente

#### Scenario: Intentar registrar asistencia en un turno ajeno

- **WHEN** un profesional intenta registrar asistencia en un turno de otro profesional
- **THEN** el sistema rechaza la operación y conserva el estado

#### Scenario: Invocar una acción sin sesión o con rol incompatible

- **WHEN** se invoca directamente una acción sin sesión o con un rol que no la permite
- **THEN** el sistema rechaza la solicitud antes de modificar el turno

### Requirement: Historial atómico de los estados

El sistema SHALL registrar la fecha, el usuario, el estado anterior y el nuevo, y el motivo cuando corresponda, junto con el cambio de estado en la misma transacción (RN-ES-06).

#### Scenario: Registrar una transición exitosa

- **WHEN** se realiza una transición válida
- **THEN** se agrega un registro al historial con los datos de la transición

#### Scenario: Detectar un cambio simultáneo

- **WHEN** dos solicitudes leen el mismo estado y una modifica el turno antes de que la otra pueda escribir
- **THEN** la solicitud desactualizada no reemplaza el estado ni agrega una entrada de historial

#### Scenario: Fallo al guardar el historial

- **WHEN** se actualiza el turno pero falla la escritura de su historial
- **THEN** la transacción se revierte

### Requirement: Detalle del turno

El detalle SHALL mostrar la información del turno, su estado actual, el historial y las acciones permitidas para el usuario. La cancelación SHALL pedir el motivo en un diálogo. Las fechas SHALL mostrarse en hora argentina (US-050, RN-ES-02, RN-ES-03, RN-ES-06, RN-ES-07 y RN-GL-03).

#### Scenario: Consultar un turno con historial

- **WHEN** un usuario autorizado abre el detalle
- **THEN** ve el estado, los datos del turno y los cambios registrados en el historial con la fecha local

#### Scenario: Consultar un turno con acciones restringidas

- **WHEN** recepción abre el detalle de un turno reservado o un usuario abre el detalle de un turno final
- **THEN** solo se ofrecen las acciones permitidas por el rol y el estado
