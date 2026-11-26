# bloqueos-de-agenda Specification

## Purpose

Registra los períodos en los que un profesional no atiende (vacaciones, feriados, congresos), con su motivo, para que esos horarios no se ofrezcan como disponibles.

## Requirements

### Requirement: Bloqueo con intervalo válido y motivo obligatorio
Un bloqueo SHALL tener profesional, fecha y hora desde, fecha y hora hasta y motivo. El sistema MUST rechazar un bloqueo cuyo desde no sea anterior a su hasta o cuyo motivo esté vacío o tenga solo espacios (RN-HO-03). Un bloqueo SHALL poder abarcar varios días.

#### Scenario: Bloqueo válido de un día
- **WHEN** un ADMIN carga para el Dr. Lautaro de Coninck un bloqueo del 30/11/2026 10:00 al 30/11/2026 11:00 con motivo "Congreso de endodoncia"
- **THEN** el sistema lo guarda y la lista de bloqueos del profesional lo muestra con su motivo (RN-HO-03)

#### Scenario: Bloqueo sin motivo
- **WHEN** un ADMIN intenta cargar para el Dr. Joaquín Cortez un bloqueo del 01/12/2026 09:00 al 01/12/2026 13:00 con motivo "   "
- **THEN** el sistema lo rechaza con "El motivo es obligatorio" en el campo motivo y no guarda nada (RN-HO-03)

#### Scenario: Bloqueo con hasta anterior o igual a desde
- **WHEN** un ADMIN intenta cargar para el Dr. Joaquín Cortez un bloqueo del 01/12/2026 13:00 al 01/12/2026 13:00 con motivo "Trámite personal"
- **THEN** el sistema lo rechaza con "La fecha y hora desde debe ser anterior a la fecha y hora hasta" y no guarda nada (RN-HO-03)

#### Scenario: Bloqueo de varios días
- **WHEN** un ADMIN carga para el Dr. Joaquín Echenagorria un bloqueo del 21/12/2026 00:00 al 04/01/2027 00:00 con motivo "Vacaciones"
- **THEN** el sistema lo acepta como un único bloqueo que cubre todos esos días (RN-HO-03)

### Requirement: Bloqueos en hora de Argentina
El ADMIN SHALL ingresar y ver las fechas y horas de un bloqueo en hora de Argentina, y el sistema MUST guardarlas como instantes en UTC (RN-GL-03).

#### Scenario: Guardado en UTC
- **WHEN** un ADMIN carga un bloqueo del 30/11/2026 10:00 al 30/11/2026 11:00
- **THEN** se guarda desde 2026-11-30T13:00:00Z hasta 2026-11-30T14:00:00Z (RN-GL-03)

#### Scenario: Presentación en hora del consultorio
- **GIVEN** un bloqueo guardado desde 2026-11-30T13:00:00Z hasta 2026-11-30T14:00:00Z
- **WHEN** se muestra la lista de bloqueos en un navegador configurado en Madrid
- **THEN** se ve "30/11/2026 10:00 - 30/11/2026 11:00" (RN-GL-03)

#### Scenario: Bloqueo que termina a la medianoche
- **WHEN** un ADMIN carga un bloqueo del 30/11/2026 20:00 al 01/12/2026 00:00
- **THEN** se guarda hasta 2026-12-01T03:00:00Z y no bloquea ningún horario del 01/12/2026, porque el hasta no está incluido (RN-GL-03, RN-TU-01)

### Requirement: Edición y eliminación de bloqueos
El ADMIN SHALL poder modificar o eliminar un bloqueo, con las mismas validaciones que al crearlo (RN-HO-03). Cargar, modificar o eliminar un bloqueo MUST NOT modificar ni cancelar turnos existentes (decisión por defecto D4, a confirmar por Lautaro y el líder).

#### Scenario: Modificar el horario de un bloqueo
- **GIVEN** un bloqueo del Dr. Lautaro de Coninck del 30/11/2026 10:00 al 11:00 por "Congreso de endodoncia"
- **WHEN** un ADMIN lo modifica para que termine a las 12:00
- **THEN** el sistema guarda el nuevo hasta y la disponibilidad de ese día deja de ofrecer inicios que pisen 10:00 - 12:00 (RN-HO-03, RN-HO-04)

#### Scenario: Modificación que deja el motivo vacío
- **GIVEN** un bloqueo del Dr. Lautaro de Coninck con motivo "Congreso de endodoncia"
- **WHEN** un ADMIN borra el motivo y guarda
- **THEN** el sistema rechaza el cambio con "El motivo es obligatorio" y el bloqueo conserva su motivo anterior (RN-HO-03)

#### Scenario: Bloqueo sobre un turno ya reservado
- **GIVEN** un turno `RESERVADO` de la paciente ficticia Marina Quiroga con el Dr. Joaquín Cortez el 01/12/2026 de 10:00 a 10:30
- **WHEN** un ADMIN carga un bloqueo del Dr. Joaquín Cortez del 01/12/2026 09:00 al 12:00 por "Feriado puente"
- **THEN** el sistema guarda el bloqueo y el turno de Marina Quiroga sigue `RESERVADO` sin cambios

#### Scenario: Eliminar un bloqueo
- **GIVEN** un bloqueo del Dr. Joaquín Cortez del 01/12/2026 09:00 al 12:00
- **WHEN** un ADMIN lo elimina y confirma en el diálogo
- **THEN** el bloqueo deja de aparecer en la lista y esos horarios vuelven a ofrecerse si están dentro de una franja y libres (RN-HO-04)

### Requirement: Solo ADMIN carga bloqueos
Crear, modificar y eliminar bloqueos MUST estar permitido solo al rol `ADMIN`, verificado en el servidor en cada acción. `RECEPCION` y `PROFESIONAL` SHALL poder ver la lista de bloqueos en modo consulta (RN-HO-06, RN-AU-03).

#### Scenario: ADMIN carga un bloqueo
- **GIVEN** `francisco.valles@example.com` con rol `ADMIN` y sesión activa
- **WHEN** carga un bloqueo para el Dr. Joaquín Echenagorria con motivo "Capacitación"
- **THEN** la acción se completa y el bloqueo se guarda (RN-HO-06)

#### Scenario: PROFESIONAL intenta cargar un bloqueo
- **GIVEN** `joaquin.cortez@example.com` con rol `PROFESIONAL` y sesión activa
- **WHEN** llama directamente a la acción de crear bloqueo para sí mismo, sin pasar por la interfaz
- **THEN** la acción devuelve "Sin permisos" y no guarda nada, aunque el bloqueo sea propio (RN-HO-06, RN-AU-03)

#### Scenario: RECEPCION ve la lista de bloqueos
- **GIVEN** `ulises.lucato@example.com` con rol `RECEPCION` y sesión activa
- **WHEN** abre `/configuracion/horarios`
- **THEN** ve los bloqueos con fechas y motivo, sin los controles de crear, editar ni eliminar (RN-HO-06)
