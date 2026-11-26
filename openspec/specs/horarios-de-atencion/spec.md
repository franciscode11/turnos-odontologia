# horarios-de-atencion Specification

## Purpose

Define cuándo atiende cada profesional mediante franjas semanales (día de la semana, hora desde y hora hasta, en hora del consultorio), para que solo se ofrezcan horarios reales.

## Requirements

### Requirement: Franja con hora desde anterior a hora hasta
Una franja de atención SHALL tener profesional, día de la semana (lunes a domingo), hora desde y hora hasta en formato `HH:mm` de hora del consultorio. El sistema MUST rechazar una franja cuya hora desde no sea anterior a su hora hasta (RN-HO-01).

#### Scenario: Franja válida
- **GIVEN** el Dr. Lautaro de Coninck sin franjas los lunes
- **WHEN** un ADMIN carga una franja de lunes de 09:00 a 12:00
- **THEN** el sistema la guarda y el horario semanal del Dr. Lautaro de Coninck muestra "Lunes 09:00 - 12:00" (RN-HO-01)

#### Scenario: Franja invertida
- **WHEN** un ADMIN intenta cargar para el Dr. Joaquín Cortez una franja de martes de 12:00 a 09:00
- **THEN** el sistema la rechaza con "La hora desde debe ser anterior a la hora hasta" en el campo hora hasta y no guarda nada (RN-HO-01)

#### Scenario: Franja de duración cero
- **WHEN** un ADMIN intenta cargar para el Dr. Joaquín Cortez una franja de martes de 09:00 a 09:00
- **THEN** el sistema la rechaza con "La hora desde debe ser anterior a la hora hasta", porque una franja vacía no cumple desde < hasta (RN-HO-01)

### Requirement: Franjas sin superposición por profesional y día
El sistema MUST rechazar una franja que se superponga con otra del mismo profesional y el mismo día de la semana, tratando cada franja como intervalo semiabierto `[desde, hasta)`. Una franja que empieza justo cuando termina otra SHALL aceptarse (RN-HO-02, RN-TU-01).

#### Scenario: Franja superpuesta el mismo día
- **GIVEN** el Dr. Lautaro de Coninck con una franja de lunes de 09:00 a 12:00
- **WHEN** un ADMIN intenta cargarle otra franja de lunes de 11:00 a 14:00
- **THEN** el sistema la rechaza con "La franja se superpone con otra del mismo día (09:00 - 12:00)" y no guarda nada (RN-HO-02)

#### Scenario: Franja contigua
- **GIVEN** el Dr. Lautaro de Coninck con una franja de lunes de 09:00 a 12:00
- **WHEN** un ADMIN le carga otra franja de lunes de 12:00 a 14:00
- **THEN** el sistema la acepta y el lunes muestra las dos franjas, porque empieza justo cuando termina la anterior (RN-HO-02)

#### Scenario: Mismo horario en otro día o de otro profesional
- **GIVEN** el Dr. Lautaro de Coninck con una franja de lunes de 09:00 a 12:00
- **WHEN** un ADMIN carga una franja de martes de 09:00 a 12:00 para el Dr. Lautaro de Coninck y otra de lunes de 09:00 a 12:00 para el Dr. Joaquín Echenagorria
- **THEN** el sistema acepta ambas, porque la regla compara solo franjas del mismo profesional y día (RN-HO-02)

#### Scenario: Franja contenida en otra
- **GIVEN** el Dr. Joaquín Cortez con una franja de miércoles de 08:00 a 13:00
- **WHEN** un ADMIN intenta cargarle otra franja de miércoles de 09:00 a 10:00
- **THEN** el sistema la rechaza por superposición (RN-HO-02)

### Requirement: Edición y eliminación de franjas
El ADMIN SHALL poder modificar o eliminar una franja existente. Al modificarla, el sistema MUST aplicar las mismas validaciones que al crearla, comparando contra las demás franjas del profesional y día sin compararla consigo misma (RN-HO-01, RN-HO-02).

#### Scenario: Extender una franja
- **GIVEN** el Dr. Joaquín Echenagorria con una única franja de jueves de 14:00 a 18:00
- **WHEN** un ADMIN la modifica a jueves de 14:00 a 19:00
- **THEN** el sistema la guarda sin reportar superposición con su propia versión anterior (RN-HO-02)

#### Scenario: Edición que genera superposición
- **GIVEN** el Dr. Joaquín Echenagorria con franjas de jueves de 09:00 a 12:00 y de 14:00 a 18:00
- **WHEN** un ADMIN modifica la de la mañana a jueves de 09:00 a 15:00
- **THEN** el sistema rechaza el cambio por superposición con 14:00 - 18:00 y la franja conserva su horario anterior (RN-HO-02)

#### Scenario: Eliminar una franja
- **GIVEN** el Dr. Joaquín Echenagorria con una franja de viernes de 09:00 a 12:00
- **WHEN** un ADMIN la elimina y confirma en el diálogo
- **THEN** la franja deja de aparecer en el horario semanal y deja de generar disponibilidad para los viernes; los turnos ya creados no cambian

### Requirement: Solo ADMIN carga franjas
Crear, modificar y eliminar franjas MUST estar permitido solo al rol `ADMIN`, verificado en el servidor en cada acción. `RECEPCION` y `PROFESIONAL` SHALL poder ver el horario semanal en modo consulta (RN-HO-06, RN-AU-03).

#### Scenario: ADMIN carga una franja
- **GIVEN** `francisco.valles@example.com` con rol `ADMIN` y sesión activa
- **WHEN** carga una franja de lunes de 15:00 a 19:00 para el Dr. Joaquín Cortez
- **THEN** la acción se completa y la franja se guarda (RN-HO-06)

#### Scenario: RECEPCION intenta cargar una franja
- **GIVEN** `octavio.crescini@example.com` con rol `RECEPCION` y sesión activa
- **WHEN** llama directamente a la acción de crear franja, sin pasar por la interfaz
- **THEN** la acción devuelve "Sin permisos" y no guarda nada (RN-HO-06, RN-AU-03)

#### Scenario: PROFESIONAL consulta el horario semanal
- **GIVEN** `lautaro.deconinck@example.com` con rol `PROFESIONAL` y sesión activa
- **WHEN** abre `/configuracion/horarios`
- **THEN** ve el horario semanal de los profesionales sin los controles de crear, editar ni eliminar (RN-HO-06)

#### Scenario: Acción sin sesión
- **WHEN** se ejecuta la acción de crear franja sin sesión
- **THEN** la acción devuelve "No autenticado" antes de verificar el rol y no guarda nada (RN-AU-03)
