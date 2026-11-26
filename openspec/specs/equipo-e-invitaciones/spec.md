# equipo-e-invitaciones Specification

## Purpose

Permite que el ADMIN sume al equipo del consultorio por invitación (sin registro público), administre las invitaciones pendientes y gestione el rol y el estado de cada usuario sin dejar nunca al consultorio sin un administrador activo.

## Requirements

### Requirement: Solo el ADMIN gestiona el equipo
Invitar, reenviar, revocar, cambiar roles, desactivar y reactivar MUST estar permitido solo al rol `ADMIN`, verificado en el servidor en cada acción (RN-EQ-01, RN-AU-03). Cualquier otro rol SHALL recibir "Sin permisos" sin que cambie nada, y la pantalla `/equipo` SHALL mostrar el aviso de sección sin permisos.

#### Scenario: Feliz, el ADMIN invita
- **GIVEN** Francisco Valles con rol `ADMIN` y sesión activa
- **WHEN** invita a `esteban.lucero@example.com` como Recepción
- **THEN** la acción se acepta y la invitación queda registrada

#### Scenario: Error de negocio, RECEPCION intenta invitar
- **GIVEN** un usuario `RECEPCION` con sesión activa
- **WHEN** intenta invitar a `esteban.lucero@example.com`
- **THEN** recibe "Sin permisos" (RN-EQ-01), no se envía ningún email y no se crea ningún usuario

#### Scenario: Borde, PROFESIONAL abre la pantalla Equipo
- **GIVEN** un usuario `PROFESIONAL` con sesión activa
- **WHEN** entra directo a `/equipo`
- **THEN** ve "No tenés permisos para ver esta sección" y no ve la lista de personas (RN-AU-03)

#### Scenario: Sin sesión
- **WHEN** se llama a cualquier acción de equipo sin sesión
- **THEN** la respuesta es "No autenticado" y no cambia nada

### Requirement: Invitación por email con un rol
El ADMIN SHALL invitar con un email válido y un rol (`ADMIN`, `RECEPCION` o `PROFESIONAL`). El email MUST normalizarse (sin espacios, en minúsculas) y no puede pertenecer a un usuario `ACTIVO` o `INVITADO` (RN-EQ-02). Una invitación aceptada SHALL enviar el email de activación y dejar al usuario `INVITADO` con su rol, quién invitó y cuándo (RN-AU-01).

#### Scenario: Feliz, invitar a un email nuevo como Recepción
- **GIVEN** que no existe ningún usuario con `esteban.lucero@example.com`
- **WHEN** el ADMIN lo invita como Recepción
- **THEN** se envía el email de activación con enlace a `/activar-cuenta/verificar` y el usuario queda `INVITADO`, rol `RECEPCION`, con `invitadoPorId` del ADMIN e `invitadoEn` en UTC (US-060)

#### Scenario: Error de negocio, email de un usuario activo
- **GIVEN** que `octavio.crescini@example.com` es un usuario `ACTIVO`
- **WHEN** el ADMIN lo invita otra vez
- **THEN** se rechaza con "Ya hay una persona con el email octavio.crescini@example.com en el equipo" (RN-EQ-02) y no se envía ningún email

#### Scenario: Borde, mismo email con mayúsculas y espacios
- **GIVEN** que `ulises.lucato@example.com` tiene una invitación pendiente (`INVITADO`)
- **WHEN** el ADMIN invita a `  Ulises.Lucato@Example.com `
- **THEN** se rechaza con el mismo mensaje de email en uso (RN-EQ-02)

#### Scenario: Email con formato inválido
- **WHEN** el ADMIN invita a `esteban.lucero` sin dominio
- **THEN** se rechaza con "Ingresá un email válido" marcado en el campo email

#### Scenario: Email de un usuario desactivado
- **GIVEN** que `ana.paz@example.com` es un usuario `INACTIVO`
- **WHEN** el ADMIN la invita
- **THEN** se rechaza indicando que pertenece a un usuario desactivado y que se lo reactive desde la tabla (el email es único en el sistema)

### Requirement: Profesional vinculado para el rol Profesional
Invitar o pasar a un usuario al rol `PROFESIONAL` MUST exigir un profesional existente que no tenga otro usuario vinculado (RN-EQ-03). Para los roles `ADMIN` y `RECEPCION` el vínculo SHALL quedar vacío.

#### Scenario: Feliz, Profesional con profesional libre
- **GIVEN** el profesional "Joaquín Echenagorria" sin usuario vinculado
- **WHEN** el ADMIN invita a `joaquin.e@example.com` como Profesional vinculado a él
- **THEN** la invitación se acepta y el usuario queda vinculado a ese profesional

#### Scenario: Error de negocio, Profesional sin profesional vinculado
- **WHEN** el ADMIN invita a `esteban.lucero@example.com` como Profesional sin elegir profesional
- **THEN** se rechaza con "Elegí el profesional vinculado" en ese campo (RN-EQ-03, US-060) y no se envía ningún email

#### Scenario: Borde, profesional que ya tiene usuario
- **GIVEN** que "Joaquín Cortez" ya está vinculado a otro usuario (de cualquier estado)
- **WHEN** el ADMIN invita a otro email como Profesional vinculado a él
- **THEN** se rechaza con "Ese profesional ya tiene un usuario vinculado" (RN-EQ-03)

#### Scenario: Rol Recepción con profesional elegido
- **WHEN** el ADMIN invita como Recepción y el formulario trae un profesional
- **THEN** la invitación se guarda sin profesional vinculado

### Requirement: Invitación sin estados a medias
Crear la invitación MUST dejar ambos registros (usuario de autenticación y usuario del consultorio) o ninguno. Si el envío del email falla no se crea el usuario del consultorio; si falla el guardado del usuario del consultorio, el usuario de autenticación recién creado SHALL eliminarse.

#### Scenario: Feliz, ambos registros quedan creados
- **WHEN** el ADMIN invita a un email libre y el envío y el guardado salen bien
- **THEN** existen el usuario de autenticación y el usuario `INVITADO` con el mismo id

#### Scenario: Error, falla el envío del email
- **GIVEN** que el proveedor de email rechaza el envío (por ejemplo por límite de envíos, P-06)
- **WHEN** el ADMIN invita a `esteban.lucero@example.com`
- **THEN** recibe "No se pudo enviar la invitación. Probá de nuevo en unos minutos." y no queda ningún usuario `INVITADO`

#### Scenario: Borde, falla el guardado después de enviar
- **GIVEN** que el email se envió pero el guardado del usuario falla
- **WHEN** termina la acción
- **THEN** el usuario de autenticación creado se elimina y el ADMIN recibe un error claro

### Requirement: Vencimiento de la invitación
Una invitación pendiente MUST considerarse vencida cuando pasaron 7 días o más desde `invitadoEn` (RN-EQ-04). La pantalla SHALL mostrarla como "Invitación vencida" y ofrecer reenviarla.

#### Scenario: Feliz, invitación de hace 6 días
- **GIVEN** una invitación enviada hace 6 días y 23 horas
- **WHEN** el ADMIN abre `/equipo`
- **THEN** figura como "Invitación pendiente"

#### Scenario: Borde, exactamente 7 días
- **GIVEN** una invitación enviada hace exactamente 7 días
- **WHEN** se calcula su estado
- **THEN** está vencida (RN-EQ-04)

#### Scenario: Error de negocio, reenviar renueva el plazo
- **GIVEN** una invitación vencida
- **WHEN** el ADMIN la reenvía
- **THEN** se manda un nuevo email, `invitadoEn` pasa a ser el momento del reenvío y vuelve a figurar pendiente

### Requirement: Reenviar y revocar invitaciones pendientes
Reenviar y revocar MUST aplicarse solo a usuarios `INVITADO`. Revocar SHALL eliminar el usuario de autenticación y el usuario del consultorio (un invitado no tiene turnos ni historial). Sobre cualquier otro estado SHALL responder "Ese usuario ya no tiene una invitación pendiente".

#### Scenario: Feliz, revocar una invitación pendiente
- **GIVEN** `ulises.lucato@example.com` en estado `INVITADO`
- **WHEN** el ADMIN confirma "Revocar invitación"
- **THEN** el usuario desaparece de la tabla y su enlace deja de servir

#### Scenario: Error de negocio, revocar a un usuario activo
- **GIVEN** `octavio.crescini@example.com` en estado `ACTIVO`
- **WHEN** se intenta revocar su invitación
- **THEN** se rechaza con "Ese usuario ya no tiene una invitación pendiente" y el usuario sigue igual (RN-EQ-07)

#### Scenario: Borde, reenviar a quien ya abrió el enlace
- **GIVEN** un invitado que abrió el enlace pero no definió su contraseña
- **WHEN** el ADMIN reenvía la invitación y el proveedor lo rechaza por estar confirmado
- **THEN** recibe un mensaje que indica pedirle que termine la activación o revocar y volver a invitar, y nada cambia

### Requirement: Cambio de rol
El ADMIN SHALL cambiar el rol de un usuario respetando RN-EQ-03 (profesional libre al pasar a `PROFESIONAL`, vínculo vacío al dejarlo) y RN-EQ-06: el último `ADMIN` activo no puede dejar de ser `ADMIN`. Cada usuario conserva un único rol (RN-AU-02).

#### Scenario: Feliz, Recepción pasa a Administrador
- **GIVEN** Octavio Crescini `ACTIVO` con rol `RECEPCION`
- **WHEN** el ADMIN le cambia el rol a `ADMIN`
- **THEN** queda con rol `ADMIN` y sin profesional vinculado

#### Scenario: Error de negocio, último ADMIN activo
- **GIVEN** que Francisco Valles es el único `ADMIN` activo
- **WHEN** se intenta cambiarle el rol a `RECEPCION`
- **THEN** se rechaza con "Tiene que quedar al menos un administrador activo" (RN-EQ-06)

#### Scenario: Borde, pasar a Profesional sin vínculo
- **GIVEN** Octavio Crescini con rol `RECEPCION`
- **WHEN** el ADMIN le cambia el rol a `PROFESIONAL` sin elegir profesional
- **THEN** se rechaza con "Elegí el profesional vinculado" (RN-EQ-03)

#### Scenario: Dejar de ser Profesional libera el vínculo
- **GIVEN** un usuario `PROFESIONAL` vinculado a "Lautaro de Coninck"
- **WHEN** el ADMIN le cambia el rol a `RECEPCION`
- **THEN** queda sin profesional vinculado y ese profesional puede vincularse a otro usuario

### Requirement: Desactivar y reactivar usuarios
Desactivar MUST aplicarse solo a usuarios `ACTIVO`, nunca al propio usuario ni al último `ADMIN` activo (RN-EQ-06), y no borra datos: turnos e historial conservan a su autor (RN-EQ-07). El usuario desactivado deja de operar (RN-AU-05). Reactivar SHALL aplicarse solo a usuarios `INACTIVO` y devolverlos a `ACTIVO`.

#### Scenario: Feliz, desactivar a un usuario de recepción
- **GIVEN** Octavio Crescini `ACTIVO`
- **WHEN** el ADMIN confirma "Desactivar"
- **THEN** queda `INACTIVO`, sigue en la tabla, sus turnos conservan su autoría y su sesión deja de operar

#### Scenario: Error de negocio, desactivarse a sí mismo
- **GIVEN** Francisco Valles `ADMIN` con sesión activa
- **WHEN** intenta desactivar su propio usuario
- **THEN** se rechaza con "No podés desactivar tu propio usuario"

#### Scenario: Borde, último ADMIN activo
- **GIVEN** un único `ADMIN` activo
- **WHEN** se intenta desactivarlo
- **THEN** se rechaza (RN-EQ-06) y sigue `ACTIVO`

#### Scenario: Reactivar a un usuario desactivado
- **GIVEN** Octavio Crescini `INACTIVO`
- **WHEN** el ADMIN lo reactiva
- **THEN** vuelve a `ACTIVO` con el mismo rol

#### Scenario: Desactivar una invitación pendiente
- **GIVEN** un usuario `INVITADO`
- **WHEN** se intenta desactivarlo
- **THEN** se rechaza con "Solo se puede desactivar a un usuario activo" (para eso está revocar)

### Requirement: Pantalla Equipo
`/equipo` SHALL listar a todas las personas con avatar (o ícono de sobre si la invitación está pendiente), nombre o email, rol, estado (Activo, Invitación pendiente, Invitación vencida, Inactivo) y último ingreso en hora de Argentina ("Hoy, 08:02", "Ayer, 18:40", fecha, o "Nunca"). Cada resultado SHALL informarse con un toast.

#### Scenario: Feliz, tabla del equipo
- **GIVEN** Francisco Valles (ADMIN, último ingreso hoy 11:02 UTC) y una invitación pendiente de Ulises Lucato
- **WHEN** el ADMIN abre `/equipo`
- **THEN** ve a Francisco con "Hoy, 08:02" y a Ulises con el ícono de sobre, "Invitación pendiente" y "Nunca"

#### Scenario: Borde, último ingreso cerca de medianoche
- **GIVEN** un último ingreso a las 02:30 UTC de hoy
- **WHEN** se muestra en la tabla
- **THEN** figura como "Ayer, 23:30" (hora de Argentina, RN-GL-03)

#### Scenario: Error, la acción falla
- **WHEN** una acción de la tabla es rechazada
- **THEN** se muestra un toast de error con el mensaje de negocio y la tabla no cambia
