# gestion-de-pacientes Specification

## Purpose

Permite al consultorio mantener el padrón administrativo de pacientes y encontrar registros válidos para reservar turnos.

## Requirements

### Requirement: Alta de pacientes con datos válidos

El sistema SHALL registrar pacientes activos con nombre, apellido, DNI, fecha de nacimiento y teléfono. Email, obra social y número de afiliado SHALL ser opcionales. La fecha de nacimiento MUST ser igual o anterior a la fecha actual en Argentina (RN-PA-03, RN-PA-04).

#### Scenario: Recepción registra un paciente válido

- **GIVEN** un usuario `RECEPCION` autenticado y un DNI sin duplicados activos
- **WHEN** registra un paciente con todos los campos obligatorios válidos
- **THEN** el paciente queda activo y aparece al buscar por su apellido

#### Scenario: Se omite un campo obligatorio

- **GIVEN** un usuario `RECEPCION` autenticado
- **WHEN** intenta registrar un paciente sin teléfono
- **THEN** el sistema informa el campo faltante y no guarda el paciente

#### Scenario: Fecha de nacimiento futura

- **GIVEN** un usuario `RECEPCION` autenticado
- **WHEN** ingresa una fecha de nacimiento posterior a la fecha actual en Argentina
- **THEN** el sistema rechaza el alta sin persistir datos

### Requirement: Unicidad del DNI entre pacientes activos

El sistema MUST guardar el DNI normalizado a 7 u 8 dígitos. MUST impedir que dos pacientes activos tengan el mismo DNI normalizado tanto en alta como en edición, incluso con solicitudes concurrentes (RN-PA-01, RN-PA-02). Un registro dado de baja no impide una nueva alta válida con ese DNI y MUST conservar su historial (RN-PA-05).

#### Scenario: DNI activo duplicado

- **GIVEN** un paciente activo con DNI ficticio `30123456`
- **WHEN** recepción intenta registrar otro paciente con DNI `30123456`
- **THEN** se devuelve «Ya existe un paciente con ese DNI» y se conserva un único paciente activo con ese DNI

#### Scenario: DNI duplicado con puntos

- **GIVEN** un paciente activo con DNI ficticio `30123456`
- **WHEN** recepción intenta registrar otro paciente con DNI `30.123.456`
- **THEN** se devuelve «Ya existe un paciente con ese DNI» y el alta no se guarda

#### Scenario: Alta con un DNI que solo figura en un registro dado de baja

- **GIVEN** un registro dado de baja con DNI ficticio `30123456`, turnos históricos y ningún paciente activo con ese DNI
- **WHEN** recepción registra un paciente con ese DNI y todos los datos obligatorios válidos
- **THEN** se crea un registro activo y los turnos existentes siguen asociados al registro dado de baja

#### Scenario: Altas concurrentes con el mismo DNI

- **GIVEN** dos solicitudes de alta válidas para el mismo DNI normalizado
- **WHEN** se guardan de forma concurrente
- **THEN** solo se registra un paciente activo y la otra solicitud informa el error de DNI duplicado

### Requirement: Búsqueda paginada por apellido o DNI

El sistema SHALL listar pacientes activos con paginación. La búsqueda MUST aceptar un fragmento del apellido o un DNI completo en su forma normalizada. La interfaz SHALL indicar cuando no hay coincidencias (US-011, RN-PA-01, RN-PA-05).

#### Scenario: Buscar por una parte del apellido

- **GIVEN** pacientes activos con apellidos que coinciden y otros que no coinciden
- **WHEN** un usuario autorizado busca un fragmento del apellido
- **THEN** el listado devuelve solo coincidencias activas y pagina el resultado

#### Scenario: Consultar un DNI con puntos

- **GIVEN** un paciente activo con DNI ficticio almacenado como `30123456`
- **WHEN** un usuario autorizado busca `30.123.456`
- **THEN** el listado encuentra el mismo paciente

#### Scenario: Búsqueda sin resultados

- **WHEN** un usuario autorizado busca un valor que no coincide con pacientes activos
- **THEN** la pantalla muestra un estado vacío

### Requirement: Edición administrativa del paciente

El sistema SHALL permitir editar los datos del paciente con las mismas validaciones del alta. Mantener su DNI actual MUST ser válido mientras no se use el DNI de otro paciente activo (US-011, RN-PA-01 a RN-PA-04).

#### Scenario: Edición que conserva su propio DNI

- **GIVEN** un paciente activo y un usuario `RECEPCION` autenticado
- **WHEN** recepción modifica el teléfono y conserva el DNI del paciente
- **THEN** el nuevo teléfono queda guardado

#### Scenario: Editar con el DNI de otro paciente activo

- **GIVEN** dos pacientes activos con DNI distintos
- **WHEN** recepción cambia el DNI de uno al DNI del otro
- **THEN** se devuelve «Ya existe un paciente con ese DNI» y ambos registros quedan sin cambios

### Requirement: Baja lógica con conservación del historial

El sistema MUST desactivar al paciente al confirmar su baja. MUST conservar su historial de turnos y excluir a los pacientes inactivos de las nuevas reservas (RN-PA-05).

#### Scenario: Confirmar la baja

- **GIVEN** un paciente activo con turnos históricos
- **WHEN** recepción confirma su baja
- **THEN** el paciente queda inactivo, deja de aparecer en el listado activo y su historial permanece disponible

#### Scenario: Cancelar la confirmación

- **GIVEN** un paciente activo y el diálogo de confirmación abierto
- **WHEN** recepción cancela la baja
- **THEN** el paciente permanece activo

### Requirement: Permisos diferenciados de consulta y escritura

El sistema SHALL permitir la consulta a usuarios `ADMIN`, `RECEPCION` y `PROFESIONAL` con sesión válida. Solo `ADMIN` y `RECEPCION` SHALL crear, editar o dar de baja pacientes. El permiso MUST verificarse en el servidor antes de cualquier operación (RN-PA-06, RN-AU-03).

#### Scenario: Profesional consulta pacientes

- **GIVEN** un usuario autenticado con rol `PROFESIONAL`
- **WHEN** abre el listado o ejecuta una búsqueda
- **THEN** puede consultar los resultados sin controles de alta, edición o baja

#### Scenario: Profesional intenta escribir

- **GIVEN** un usuario autenticado con rol `PROFESIONAL`
- **WHEN** invoca directamente el alta, la edición o la baja
- **THEN** el servidor rechaza cada acción por falta de permisos y no altera datos

#### Scenario: Acción sin sesión

- **WHEN** un usuario sin sesión invoca una acción de pacientes
- **THEN** el servidor rechaza la acción antes de consultar o modificar datos
