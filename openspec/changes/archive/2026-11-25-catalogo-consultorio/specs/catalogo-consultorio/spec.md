# Spec Delta

## Purpose

Permite configurar el consultorio: quién atiende (profesionales), qué se hace y cuánto dura (prestaciones) y dónde (sillones/boxes), con baja lógica y edición reservada al rol `ADMIN`.

## ADDED Requirements

### Requirement: Duración válida de una prestación
La duración de una prestación MUST ser un número entero de minutos, múltiplo de 5, entre 10 y 240, ambos incluidos (RN-CA-02). El sistema SHALL rechazar cualquier otro valor con el mensaje "La duración debe ser múltiplo de 5 entre 10 y 240 minutos" y no guardar nada.

#### Scenario: Feliz, alta de prestación válida
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** crea la prestación "Limpieza" de 30 minutos
- **THEN** la prestación queda guardada con `activo = true` y aparece en el listado como disponible para asignar a turnos

#### Scenario: Error de negocio, duración no múltiplo de 5
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** intenta crear una prestación de 7 minutos
- **THEN** el sistema la rechaza con "La duración debe ser múltiplo de 5 entre 10 y 240 minutos" y no se guarda ninguna prestación

#### Scenario: Borde, límite superior incluido
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** crea una prestación de exactamente 240 minutos
- **THEN** la prestación se acepta y queda activa

#### Scenario: Borde, límite inferior incluido y valores fuera de rango
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** intenta crear prestaciones de 10, 5 y 245 minutos
- **THEN** la de 10 minutos se acepta y las de 5 y 245 minutos se rechazan con el mismo mensaje

#### Scenario: Editar la duración no cambia turnos existentes
- **GIVEN** la prestación "Limpieza" de 30 minutos usada en un turno ya creado
- **WHEN** un `ADMIN` cambia su duración a 45 minutos
- **THEN** la prestación queda con 45 minutos y el turno existente conserva su hora de fin (SU-04)

### Requirement: Matrícula de profesional única
Cada profesional MUST tener una matrícula que no esté usada por otro profesional, activo o inactivo (RN-CA-01). La matrícula SHALL guardarse sin espacios al principio ni al final y en mayúsculas, y la comparación MUST ignorar mayúsculas. El sistema SHALL rechazar el alta o la edición que repita una matrícula con el mensaje "Ya existe un profesional con la matrícula <matrícula>".

#### Scenario: Matrícula repetida con otras mayúsculas
- **GIVEN** un profesional con matrícula `MP-1234`
- **WHEN** un `ADMIN` intenta crear otro profesional con matrícula ` mp-1234 `
- **THEN** el sistema lo rechaza con "Ya existe un profesional con la matrícula MP-1234"

#### Scenario: Error de negocio, matrícula repetida en el alta
- **GIVEN** un profesional con matrícula `MP-1234`
- **WHEN** un `ADMIN` intenta crear otro profesional con matrícula `MP-1234`
- **THEN** el sistema lo rechaza con "Ya existe un profesional con la matrícula MP-1234" y no crea el profesional

#### Scenario: Matrícula repetida en la edición
- **GIVEN** los profesionales con matrículas `MP-1234` y `MP-5678`
- **WHEN** un `ADMIN` edita el de `MP-5678` y le pone `MP-1234`
- **THEN** el sistema rechaza la edición con el mismo mensaje y el profesional conserva `MP-5678`

#### Scenario: Editar sin cambiar la propia matrícula
- **GIVEN** un profesional con matrícula `MP-1234`
- **WHEN** un `ADMIN` le cambia solo la especialidad
- **THEN** la edición se acepta, porque la matrícula repetida es la suya

#### Scenario: Matrícula de un profesional inactivo
- **GIVEN** un profesional desactivado con matrícula `MP-1234`
- **WHEN** un `ADMIN` intenta crear otro profesional con matrícula `MP-1234`
- **THEN** el sistema lo rechaza con "Ya existe un profesional con la matrícula MP-1234"

### Requirement: Nombre de sillón único
Cada sillón/box MUST tener un nombre que no use otro sillón, activo o inactivo (RN-CA-03), comparando sin distinguir mayúsculas ("box 1" repite "Box 1"). El sistema SHALL rechazar el alta o la edición que repita un nombre con el mensaje "Ya existe un sillón con el nombre <nombre>".

#### Scenario: Error de negocio, nombre de sillón repetido
- **GIVEN** un sillón llamado "Box 1"
- **WHEN** un `ADMIN` intenta crear otro sillón llamado "Box 1"
- **THEN** el sistema lo rechaza con "Ya existe un sillón con el nombre Box 1" y no crea el sillón

#### Scenario: Feliz, alta de sillón
- **GIVEN** que no existe ningún sillón llamado "Box 3"
- **WHEN** un `ADMIN` crea el sillón "Box 3"
- **THEN** el sillón queda guardado con `activo = true`

### Requirement: Datos obligatorios
El sistema MUST exigir nombre, apellido y matrícula no vacíos para un profesional, nombre no vacío y duración para una prestación, y nombre no vacío para un sillón. La especialidad del profesional y el precio de referencia de la prestación SHALL ser opcionales; si se informa el precio, MUST ser mayor o igual a 0 con a lo sumo 2 decimales. Los textos se guardan sin espacios al principio ni al final.

#### Scenario: Precio de referencia negativo
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** intenta crear la prestación "Limpieza" de 30 minutos con precio de referencia -100
- **THEN** el sistema la rechaza con "El precio de referencia no puede ser negativo" en el campo precio y no se guarda ninguna prestación

#### Scenario: Profesional sin matrícula
- **GIVEN** un usuario `ADMIN` con sesión activa
- **WHEN** intenta crear un profesional con nombre "Ana" y apellido "Pérez" y la matrícula vacía o solo con espacios
- **THEN** el sistema lo rechaza indicando el error en el campo matrícula y no crea el profesional

### Requirement: Baja lógica
Profesionales, prestaciones y sillones MUST desactivarse en lugar de borrarse (RN-CA-04). No SHALL existir una acción de borrado. Un elemento desactivado MUST poder volver a activarse, y los turnos ya creados no cambian (RN-CA-05).

#### Scenario: Desactivar una prestación con turnos
- **GIVEN** la prestación "Limpieza" activa, usada en un turno ya creado
- **WHEN** un `ADMIN` la desactiva
- **THEN** la prestación queda con `activo = false`, sigue existiendo en la base y el turno sigue mostrando "Limpieza"

#### Scenario: Reactivar un sillón
- **GIVEN** el sillón "Box 2" desactivado
- **WHEN** un `ADMIN` lo activa
- **THEN** el sillón queda con `activo = true`

### Requirement: Solo ADMIN modifica el catálogo
Crear, editar, desactivar y reactivar MUST estar permitidos solo al rol `ADMIN`, verificado en el servidor en cada acción antes de validar la entrada o tocar la base (RN-CA-06, RN-AU-03). Los roles `RECEPCION` y `PROFESIONAL` SHALL poder consultar los listados.

#### Scenario: Recepción intenta crear una prestación
- **GIVEN** un usuario `RECEPCION` con sesión activa
- **WHEN** ejecuta la acción de crear la prestación "Limpieza" de 30 minutos llamándola directamente
- **THEN** la acción devuelve "Sin permisos" y no se guarda ninguna prestación

#### Scenario: Profesional intenta desactivar un sillón
- **GIVEN** un usuario `PROFESIONAL` con sesión activa
- **WHEN** ejecuta la acción de desactivar el sillón "Box 1"
- **THEN** la acción devuelve "Sin permisos" y el sillón sigue activo

#### Scenario: Sin sesión
- **GIVEN** una persona sin sesión iniciada
- **WHEN** ejecuta cualquier acción del catálogo
- **THEN** la acción devuelve "No autenticado" antes de evaluar el rol

#### Scenario: Consulta en solo lectura
- **GIVEN** un usuario `RECEPCION` con sesión activa
- **WHEN** se evalúa si puede editar profesionales, prestaciones o sillones
- **THEN** el permiso de edición da falso para las tres secciones (y lo mismo para `PROFESIONAL`), mientras que el de consulta da verdadero; con ese permiso en falso la pantalla muestra el listado sin botones de alta, edición ni interruptor de activo
