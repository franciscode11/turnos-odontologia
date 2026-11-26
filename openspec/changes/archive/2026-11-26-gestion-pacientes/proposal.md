# Proposal — C-02 Gestión de pacientes

## Why

Recepción necesita registrar y encontrar pacientes para reservarles turnos. El MVP de Discovery incluye la gestión administrativa de pacientes como una capacidad básica del mercado odontológico. C-01 ya aporta el modelo, los permisos y los componentes necesarios. [Informe de Discovery](../../../docs/discovery/informe-discovery.md#L626)

## What Changes

- Implementar en `/pacientes` el alta, la edición, la búsqueda paginada por apellido o DNI y la baja lógica con confirmación.
- Normalizar el DNI y rechazar duplicados entre pacientes activos. Validar los datos obligatorios y la fecha de nacimiento.
- Permitir consulta a los tres roles autenticados. Reservar alta, edición y baja a `ADMIN` y `RECEPCION`, con control en cada acción del servidor.
- Mantener el historial de turnos al dar de baja un paciente y dejarlo fuera de nuevas reservas.

## Capabilities

### New Capabilities

- `gestion-de-pacientes`: gestión del padrón administrativo, sus validaciones y permisos de consulta y escritura.

### Modified Capabilities

Ninguna.

## Impact

Código en `src/app/(panel)/pacientes/`, `src/domain/pacientes/`, `src/server/pacientes/` y `tests/pacientes/`. Se reutilizan el modelo `Paciente`, el índice parcial de C-01, la matriz de permisos y el sistema de componentes. Quedan fuera de alcance la ficha clínica, los recordatorios y los cambios de esquema o migraciones.
