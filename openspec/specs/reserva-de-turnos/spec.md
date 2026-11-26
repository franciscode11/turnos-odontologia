# reserva-de-turnos Specification

## Purpose

Permite al personal del consultorio reservar un turno dentro del horario de atención con los recursos activos, registra quién lo creó y protege la agenda contra solapamientos concurrentes.

## Requirements

### Requirement: Acceso a la reserva
El sistema SHALL ofrecer `/turnos/nuevo` y sus acciones de consulta y creación solo a usuarios activos con sesión cuyo rol sea ADMIN o RECEPCION (RN-AU-03, RN-TU-12).

#### Scenario: Recepción y administración pueden reservar
- **GIVEN** una sesión activa de RECEPCION o ADMIN
- **WHEN** el usuario accede a la reserva y envía una solicitud válida
- **THEN** el sistema permite registrar el turno (RN-TU-12)

#### Scenario: Profesional sin autorización para reservar
- **GIVEN** una sesión activa de PROFESIONAL
- **WHEN** solicita la página o invoca directamente una acción de la reserva
- **THEN** el sistema deniega el acceso y evita consultar o modificar los datos del formulario (RN-AU-03, RN-TU-12)

#### Scenario: Solicitud sin sesión
- **GIVEN** una solicitud sin sesión válida
- **WHEN** se invoca directamente una acción de la reserva
- **THEN** el sistema devuelve «No autenticado» antes de acceder a datos del formulario (RN-AU-03, RN-TU-12)

### Requirement: Datos válidos y entidades activas
La reserva SHALL requerir paciente, profesional, prestación y sillón activos, una fecha calendario y una hora local válidas. El sistema SHALL interpretar el inicio en hora de Argentina y guardarlo en UTC (RN-TU-10, RN-GL-03).

#### Scenario: Entidad inactiva o inexistente al guardar
- **GIVEN** una solicitud con un identificador de paciente, profesional, prestación o sillón inactivo o inexistente
- **WHEN** recepción envía la reserva
- **THEN** el sistema identifica el campo inválido y rechaza la escritura (RN-TU-10)

#### Scenario: Fecha de calendario inexistente
- **GIVEN** una fecha como 2027-02-30
- **WHEN** recepción la envía como fecha de reserva
- **THEN** el sistema devuelve un error de validación de la fecha y rechaza la escritura (RN-GL-03)

### Requirement: Duración y elegibilidad del intervalo
El sistema SHALL calcular el fin sumando al inicio la duración vigente de la prestación. El intervalo completo MUST entrar en una franja del profesional y evitar sus bloqueos. Un inicio anterior al instante actual SHALL rechazarse (RN-TU-07, RN-TU-08, RN-TU-09).

#### Scenario: Fin posterior al cierre de la franja
- **GIVEN** una franja de 09:00 a 12:00 y una prestación de 30 minutos
- **WHEN** se solicita un turno a las 11:45
- **THEN** el sistema rechaza el turno porque termina a las 12:15 (RN-TU-07, RN-TU-08)

#### Scenario: Fin en el límite de la franja
- **GIVEN** una franja de 09:00 a 12:00 y una prestación de 30 minutos
- **WHEN** se solicita un turno a las 11:30 sin otros conflictos
- **THEN** el sistema acepta el turno con fin a las 12:00 (RN-TU-07, RN-TU-08)

#### Scenario: Bloqueo del profesional
- **GIVEN** un bloqueo del profesional de 10:30 a 11:00
- **WHEN** se solicita un turno de 10:15 a 10:45
- **THEN** el sistema rechaza el turno por bloqueo (RN-TU-08)

#### Scenario: Inicio anterior al instante actual
- **GIVEN** que son las 10:01 en Argentina
- **WHEN** se solicita un turno para ese mismo día a las 10:00
- **THEN** el sistema rechaza la reserva por tratarse de un inicio pasado (RN-TU-09, RN-GL-03)

### Requirement: Horarios ofrecidos en el formulario
El formulario SHALL listar inicios en pasos de cinco minutos bajo «Horarios del profesional». Cada inicio MUST acomodar la duración de la prestación, estar en el presente o futuro y evitar bloqueos y turnos del profesional que ocupan agenda (RN-HO-04, RN-HO-05, RN-TU-04, RN-TU-09). La ocupación del sillón SHALL comprobarse al confirmar (IN-05, RN-TU-03).

#### Scenario: Horarios del profesional por duración
- **GIVEN** una franja futura de 09:00 a 12:00, un bloqueo de 10:00 a 10:30, un turno confirmado de 11:00 a 11:30 y uno cancelado de 09:00 a 09:30
- **WHEN** recepción elige una prestación de 30 minutos
- **THEN** aparecen 09:00, 09:05, 10:30 y 11:30, y se excluyen 09:35, 10:35 y 11:35 (RN-HO-04, RN-HO-05, RN-TU-04)

#### Scenario: Horario ofrecido aunque el sillón esté ocupado
- **GIVEN** que el profesional elegido está disponible de 10:00 a 10:30 y otro profesional ocupa el Sillón 1 durante ese intervalo
- **WHEN** recepción selecciona el Sillón 1 y consulta los inicios para una prestación de 30 minutos
- **THEN** las 10:00 aparecen en «Horarios del profesional» (IN-05, RN-HO-04)

### Requirement: Conflictos de agenda
La reserva SHALL rechazar cualquier solapamiento del profesional o del sillón con un turno RESERVADO, CONFIRMADO, ATENDIDO o AUSENTE. La comparación MUST usar intervalos semiabiertos. Un conflicto de exclusión en la base SHALL devolver el mismo mensaje que la validación previa (RN-TU-01 a RN-TU-06). Ante un conflicto de sillón, el formulario SHALL conservar el horario y los demás datos para que recepción pueda reintentar (IN-05).

#### Scenario: Profesional ocupado
- **GIVEN** un turno del profesional de 10:00 a 10:30 que ocupa agenda
- **WHEN** se solicita otro de ese profesional de 10:15 a 10:45
- **THEN** el sistema responde «El profesional ya tiene un turno en ese horario» (RN-TU-02, RN-TU-04, RN-TU-05)

#### Scenario: Sillón ocupado por otro profesional
- **GIVEN** que recepción eligió las 10:00 para un profesional libre y otro profesional ocupa el Sillón 1 de 10:00 a 10:30
- **WHEN** confirma una reserva de 30 minutos en el Sillón 1
- **THEN** el sistema muestra «El sillón ya está ocupado en ese horario», conserva los datos del formulario y rechaza la escritura del turno y su historial (IN-05, RN-TU-03, RN-TU-04, RN-TU-11)

#### Scenario: Reintento en otro sillón
- **GIVEN** que el Sillón 1 causó un conflicto y el Sillón 2 está libre durante el intervalo elegido de un profesional disponible
- **WHEN** recepción cambia al Sillón 2 y vuelve a confirmar sin volver a ingresar los demás datos
- **THEN** el sistema registra el turno con el Sillón 2 para la fecha y hora elegidas (IN-05, RN-TU-03, RN-TU-11)

#### Scenario: Turnos contiguos
- **GIVEN** un turno de 10:00 a 10:30
- **WHEN** se solicita otro para el mismo profesional y sillón de 10:30 a 11:00
- **THEN** el sistema acepta la reserva (RN-TU-01)

#### Scenario: Turno cancelado
- **GIVEN** un turno CANCELADO de 10:00 a 10:30
- **WHEN** se solicita el mismo intervalo, profesional y sillón
- **THEN** el sistema acepta la reserva (RN-TU-04)

#### Scenario: La base detecta un conflicto concurrente
- **GIVEN** dos solicitudes que pasaron la validación previa y se superponen por profesional o sillón
- **WHEN** una reserva se guarda y la base rechaza la otra por exclusión
- **THEN** la solicitud rechazada recibe el mensaje del recurso afectado y solo queda registrado el turno aceptado con su historial (RN-TU-06, RN-TU-11)

### Requirement: Registro atómico del turno
El sistema SHALL guardar el turno en RESERVADO y una entrada inicial del historial con estado anterior nulo, estado nuevo RESERVADO y el usuario autenticado como autor. La confirmación en pantalla MUST aparecer después de completar ambas escrituras (RN-TU-11).

#### Scenario: Reserva válida con historial
- **GIVEN** una sesión de recepción y un horario libre el lunes a las 10:00 en Argentina con todos los datos activos y una prestación de 30 minutos
- **WHEN** recepción confirma
- **THEN** se guarda el turno RESERVADO de 13:00 a 13:30 UTC, se registra el historial inicial a nombre del usuario y la pantalla confirma la creación (RN-TU-07, RN-TU-11, RN-GL-03)

#### Scenario: Falla al registrar el historial
- **GIVEN** una reserva válida cuya escritura del historial falla
- **WHEN** el sistema intenta guardar el turno y su historial
- **THEN** la operación revierte ambas escrituras y la pantalla conserva el formulario sin confirmar la reserva (RN-TU-11)
