# Proposal

## Why

Crear turnos sin solapamientos por profesional ni por sillón es uno de los imprescindibles del MVP recomendado en la sección D.3 del informe de Discovery. La validación del dominio permite explicar el conflicto y la garantía de la base mantiene la agenda íntegra cuando coinciden dos reservas.

## What Changes

- Reemplazar el marcador de `/turnos/nuevo` por un formulario interno para ADMIN y RECEPCION, con búsqueda de paciente, selección de profesional, prestación y sillón, y horarios del profesional para la fecha elegida.
- Mostrar los inicios bajo «Horarios del profesional». Si el sillón está ocupado al confirmar, informar el conflicto y permitir cambiar de sillón conservando el horario y los demás datos cargados (IN-05).
- Calcular el fin con la duración vigente de la prestación y validar entidades activas, inicio, franja, bloqueos y ocupación de ambos recursos.
- Guardar en una transacción el turno `RESERVADO` y su entrada inicial de historial. Mostrar el mismo mensaje de conflicto si la base rechaza una reserva concurrente.

## Capabilities

### New Capabilities

- `reserva-de-turnos` — selección de un horario válido, validación de la reserva y registro del turno con historial.

### Modified Capabilities

## Impact

Pantalla en `src/app/(panel)/turnos/nuevo/`, validación pura en `src/domain/turnos/crear-*`, acciones en `src/server/turnos/crear-turno.ts` y cobertura en `tests/turnos/crear-turno.test.ts`. Reutiliza el esquema, la autenticación, el dominio compartido y los componentes de C-01.
