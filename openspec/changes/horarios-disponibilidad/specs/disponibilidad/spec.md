# Spec Delta

## Purpose

Calcula y muestra los horarios de inicio libres de un profesional para una fecha y una duración, a partir de sus franjas, sus bloqueos y sus turnos que ocupan agenda, para ofrecer solo turnos que se pueden dar.

## ADDED Requirements

### Requirement: Inicios dentro de una franja en pasos de 5 minutos
Para un profesional, una fecha y una duración, el sistema SHALL ofrecer como candidatos los inicios cada 5 minutos desde la hora desde de cada franja de ese día de la semana, tales que `[inicio, inicio + duración)` entre completo dentro de esa misma franja. La lista MUST estar ordenada y sin repetidos (RN-HO-04, RN-HO-05; paso de 5 minutos por SU-03, a confirmar por Lautaro y el líder).

#### Scenario: Lunes sin turnos ni bloqueos
- **GIVEN** el Dr. Lautaro de Coninck con una única franja de lunes de 09:00 a 12:00, sin bloqueos ni turnos el lunes 30/11/2026
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** se ofrecen los inicios 09:00, 09:05, 09:10, … hasta 11:30 inclusive (31 inicios) y ninguno posterior a 11:30 (RN-HO-04, RN-HO-05)

#### Scenario: Duración que ocupa la franja entera
- **GIVEN** el Dr. Lautaro de Coninck con una única franja de lunes de 09:00 a 12:00
- **WHEN** se pide la disponibilidad del 30/11/2026 para 180 minutos
- **THEN** se ofrece solo el inicio 09:00, porque 09:00 + 180 minutos termina justo a las 12:00 (RN-HO-04)

#### Scenario: Duración mayor que la franja
- **GIVEN** el Dr. Lautaro de Coninck con una única franja de lunes de 09:00 a 12:00
- **WHEN** se pide la disponibilidad del 30/11/2026 para 240 minutos
- **THEN** no se ofrece ningún inicio y se muestra "No hay horarios disponibles para esa duración" (RN-HO-04)

#### Scenario: Dos franjas en el mismo día
- **GIVEN** el Dr. Joaquín Cortez con franjas de lunes de 09:00 a 12:00 y de 15:00 a 18:00
- **WHEN** se pide la disponibilidad del 30/11/2026 para 60 minutos
- **THEN** se ofrecen los inicios de 09:00 a 11:00 y de 15:00 a 17:00, cada 5 minutos, y ninguno entre 11:05 y 14:55 (RN-HO-04, RN-HO-05)

#### Scenario: Turno que cruzaría dos franjas contiguas
- **GIVEN** el Dr. Joaquín Cortez con franjas contiguas de lunes de 09:00 a 12:00 y de 12:00 a 14:00
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** no se ofrece el inicio 11:45, porque `[11:45, 12:15)` no entra dentro de una sola franja; sí se ofrecen 11:30 y 12:00 (RN-HO-04 en su lectura literal, decisión por defecto D11, a confirmar por Lautaro y el líder)

### Requirement: Los bloqueos restan disponibilidad
El sistema MUST descartar todo inicio cuyo intervalo `[inicio, inicio + duración)` se superponga con un bloqueo del profesional, usando la definición de superposición de intervalos semiabiertos. Un inicio que termina justo cuando empieza el bloqueo, o que empieza justo cuando termina, SHALL ofrecerse (RN-HO-04, RN-TU-01).

#### Scenario: Bloqueo de 10:00 a 11:00
- **GIVEN** el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00 y un bloqueo del 30/11/2026 de 10:00 a 11:00 por "Congreso de endodoncia"
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** no se ofrece ningún inicio entre 09:35 y 10:55, y sí se ofrecen 09:30 (termina a las 10:00) y 11:00 (RN-HO-04, RN-TU-01)

#### Scenario: Bloqueo de todo el día
- **GIVEN** el Dr. Joaquín Echenagorria con franja de lunes de 09:00 a 13:00 y un bloqueo del 30/11/2026 00:00 al 01/12/2026 00:00 por "Feriado"
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** no se ofrece ningún inicio y se muestra "No hay horarios disponibles para esa duración" (RN-HO-04)

#### Scenario: Bloqueo que empieza el día anterior
- **GIVEN** el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00 y un bloqueo del 29/11/2026 20:00 al 30/11/2026 10:00 por "Viaje de regreso"
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** el primer inicio ofrecido es 10:00 (RN-HO-04, RN-TU-01)

### Requirement: Solo los turnos que ocupan agenda restan disponibilidad
El sistema MUST descartar todo inicio cuyo intervalo se superponga con un turno del profesional en estado `RESERVADO`, `CONFIRMADO`, `ATENDIDO` o `AUSENTE`. Los turnos `CANCELADO` MUST NOT restar disponibilidad (RN-HO-04, RN-TU-04). La disponibilidad no filtra por sillón (P-04, IN-05; decisión por defecto, a confirmar por Lautaro y el líder).

#### Scenario: Turno reservado
- **GIVEN** el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00 y un turno `RESERVADO` del paciente ficticio Tomás Ferreyra el 30/11/2026 de 10:00 a 10:30
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** no se ofrece ningún inicio entre 09:35 y 10:25, y sí se ofrecen 09:30 y 10:30 (RN-HO-04, RN-TU-01, RN-TU-04)

#### Scenario: Turno cancelado no resta
- **GIVEN** el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00 y un único turno `CANCELADO` de la paciente ficticia Sofía Benítez el 30/11/2026 de 10:00 a 10:30
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** se ofrecen los mismos 31 inicios que sin turnos, incluido 10:00 (RN-TU-04)

#### Scenario: Turno ausente sigue restando
- **GIVEN** el Dr. Joaquín Cortez con franja de lunes de 09:00 a 12:00 y un turno `AUSENTE` el 30/11/2026 de 09:00 a 09:30
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** el primer inicio ofrecido es 09:30 (RN-TU-04)

#### Scenario: Sillón ocupado por otro profesional
- **GIVEN** el Dr. Joaquín Cortez con franja de lunes de 09:00 a 12:00 sin turnos, y un turno del Dr. Joaquín Echenagorria en el Sillón 1 el 30/11/2026 de 10:00 a 10:30
- **WHEN** se pide la disponibilidad del Dr. Joaquín Cortez del 30/11/2026 para 30 minutos
- **THEN** se ofrece el inicio 10:00, porque la disponibilidad solo considera la agenda del profesional (IN-05)

### Requirement: Día de la semana según la fecha del consultorio
El sistema SHALL usar las franjas del día de la semana que corresponde a la fecha pedida en el calendario de Argentina, y MUST considerar solo bloqueos y turnos que se superpongan con ese día (RN-GL-03).

#### Scenario: Profesional que no atiende ese día
- **GIVEN** el Dr. Lautaro de Coninck con franjas solo los lunes
- **WHEN** se pide la disponibilidad del martes 01/12/2026 para 30 minutos
- **THEN** no se ofrece ningún inicio y se muestra "El profesional no atiende ese día" (RN-HO-04)

#### Scenario: Turnos de otro día no afectan
- **GIVEN** el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00 y un turno `CONFIRMADO` el martes 01/12/2026 de 09:00 a 09:30
- **WHEN** se pide la disponibilidad del lunes 30/11/2026 para 30 minutos
- **THEN** se ofrecen los 31 inicios de 09:00 a 11:30 (RN-HO-04)

#### Scenario: Servidor en otra zona horaria
- **GIVEN** el servidor configurado en UTC y el Dr. Lautaro de Coninck con franja de lunes de 09:00 a 12:00
- **WHEN** se pide la disponibilidad del 30/11/2026 para 30 minutos
- **THEN** el primer inicio es el instante 2026-11-30T12:00:00Z y se muestra como "09:00" (RN-GL-03)

### Requirement: Consulta de disponibilidad validada y abierta a todos los roles
Cualquier usuario activo con sesión (`ADMIN`, `RECEPCION` o `PROFESIONAL`) SHALL poder consultar la disponibilidad de cualquier profesional activo, verificado en el servidor. El sistema MUST rechazar una duración que no sea múltiplo de 5 entre 10 y 240 minutos, una fecha inválida o un profesional inactivo (RN-HO-06, RN-AU-03, RN-CA-02, RN-CA-05).

#### Scenario: PROFESIONAL consulta la agenda de un colega
- **GIVEN** `joaquin.echenagorria@example.com` con rol `PROFESIONAL` y sesión activa
- **WHEN** consulta la disponibilidad del Dr. Joaquín Cortez para el 30/11/2026 y 30 minutos
- **THEN** recibe la lista de inicios libres del Dr. Joaquín Cortez (RN-HO-06)

#### Scenario: Duración inválida
- **WHEN** un usuario `RECEPCION` consulta la disponibilidad del Dr. Joaquín Cortez para el 30/11/2026 y 7 minutos
- **THEN** el sistema rechaza la consulta con "La duración debe ser un múltiplo de 5 entre 10 y 240 minutos" en el campo duración (RN-CA-02)

#### Scenario: Profesional inactivo
- **GIVEN** un profesional desactivado
- **WHEN** se consulta su disponibilidad llamando directamente a la acción
- **THEN** el sistema rechaza la consulta con "El profesional no está activo" y el selector de la pantalla no lo ofrece (RN-CA-05)

#### Scenario: Consulta sin sesión
- **WHEN** se ejecuta la consulta de disponibilidad sin sesión
- **THEN** la acción devuelve "No autenticado" y no lee datos (RN-AU-03)
