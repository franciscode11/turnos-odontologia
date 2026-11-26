# Proposal

## Why

La agenda permite consultar turnos, pero el detalle todavía no permite gestionar su estado. C-06 incorpora las operaciones de recepción y asistencia y registra quién realizó cada transición.

## What Changes

- Confirmar, cancelar con motivo obligatorio y marcar un turno como atendido o ausente, según el estado, el rol y la hora del turno.
- Registrar el estado anterior, el nuevo, el autor, la fecha y el motivo de cada transición en el historial del turno.
- Completar el detalle en `/turnos/[id]` con el estado, las acciones disponibles y el historial.
- Cubrir con tests la máquina de estados, la autorización y el registro atómico de las transiciones.

## Capabilities

### New Capabilities

- `estados-del-turno`: transiciones autorizadas, cancelación y consulta del historial de un turno.

### Modified Capabilities

## Impact

La implementación queda en la zona de C-06 y reutiliza el esquema Prisma, los accesos, el manejo de fechas y los componentes que dejó C-01. La cancelación libera la agenda según el criterio de ocupación vigente.
