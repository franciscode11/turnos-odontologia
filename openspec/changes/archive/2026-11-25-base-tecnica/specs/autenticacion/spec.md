# Spec Delta

## Purpose

Controla quién entra al panel del consultorio: inicio y cierre de sesión con email y contraseña, protección de todas las rutas del panel y activación de cuentas invitadas, sin registro público.

## ADDED Requirements

### Requirement: Inicio de sesión con email y contraseña
El sistema SHALL permitir iniciar sesión con email y contraseña a un usuario existente y `ACTIVO`, y llevarlo a la agenda del día (`/turnos`). No SHALL existir una pantalla de registro público (RN-AU-01).

#### Scenario: Login correcto de un usuario activo
- **GIVEN** el usuario `octavio.crescini@example.com` existe con rol `RECEPCION` y estado `ACTIVO`
- **WHEN** envía su email y su contraseña correcta en `/login`
- **THEN** el sistema crea la sesión y lo redirige a `/turnos`

#### Scenario: Credenciales inválidas
- **WHEN** alguien envía en `/login` un email inexistente o una contraseña incorrecta
- **THEN** el sistema muestra el mensaje genérico "Email o contraseña incorrectos" sin revelar si el email existe, y no crea sesión

#### Scenario: No hay registro público
- **WHEN** alguien busca crear una cuenta sin invitación
- **THEN** no existe ninguna pantalla ni acción de registro, y la única forma de obtener un usuario es la invitación del ADMIN (RN-AU-01)

### Requirement: Solo usuarios activos operan
El sistema MUST rechazar el acceso de un usuario autenticado en Supabase cuyo registro en la tabla de usuarios no exista o no esté `ACTIVO`, cerrando la sesión (RN-AU-05).

#### Scenario: Usuario inactivo
- **GIVEN** un usuario con estado `INACTIVO` y contraseña válida
- **WHEN** inicia sesión
- **THEN** el sistema cierra la sesión y muestra "Tu usuario no está activo. Consultá con el administrador del consultorio."

#### Scenario: Usuario autenticado sin registro propio
- **GIVEN** una cuenta de Supabase Auth sin fila correspondiente en la tabla de usuarios
- **WHEN** inicia sesión
- **THEN** el sistema cierra la sesión y muestra el mismo mensaje de usuario no activo

#### Scenario: Usuario desactivado con sesión abierta
- **GIVEN** un usuario con sesión iniciada al que luego se pasa a `INACTIVO`
- **WHEN** ejecuta cualquier acción del servidor
- **THEN** la acción falla con "Sin permisos" y no modifica datos

### Requirement: Rutas del panel protegidas
Toda ruta del panel MUST exigir una sesión válida antes de mostrar contenido; sin sesión el sistema SHALL redirigir a `/login`. Solo `/login`, `/activar-cuenta` y los recursos estáticos son públicos (RN-AU-04).

#### Scenario: Acceso sin sesión
- **WHEN** alguien sin sesión abre `/turnos`
- **THEN** el sistema lo redirige a `/login` sin mostrar datos del panel

#### Scenario: Sesión vencida
- **GIVEN** una cookie de sesión vencida o adulterada
- **WHEN** el navegador pide `/pacientes`
- **THEN** el sistema la trata como sin sesión y redirige a `/login`

#### Scenario: Usuario con sesión entra al login
- **GIVEN** un usuario `ACTIVO` con sesión válida
- **WHEN** abre `/login`
- **THEN** el sistema lo redirige a `/turnos`

### Requirement: Cierre de sesión
El sistema SHALL permitir cerrar la sesión desde el menú del usuario y, después, MUST tratar al navegador como sin sesión.

#### Scenario: Cerrar sesión
- **GIVEN** un usuario con sesión iniciada
- **WHEN** elige "Cerrar sesión" en el menú del usuario
- **THEN** el sistema elimina la sesión y lo lleva a `/login`

#### Scenario: Volver atrás después de cerrar sesión
- **GIVEN** un usuario que acaba de cerrar sesión
- **WHEN** usa el botón "Atrás" del navegador para volver a `/turnos`
- **THEN** el sistema redirige a `/login`

#### Scenario: Cerrar sesión sin sesión
- **WHEN** se ejecuta el cierre de sesión sin una sesión activa
- **THEN** el sistema redirige a `/login` sin error

### Requirement: Activación de una cuenta invitada
El sistema SHALL permitir que una persona con un enlace de invitación válido defina su nombre y una contraseña de al menos 10 caracteres con al menos un número, y pase a `ACTIVO` (RN-EQ-04). El envío de invitaciones no forma parte de esta capacidad.

#### Scenario: Activación correcta
- **GIVEN** un usuario `INVITADO` que abre `/activar-cuenta` desde un enlace vigente
- **WHEN** completa "Ulises Lucato" y la contraseña `consultorio2026`
- **THEN** el sistema guarda la contraseña, guarda el nombre, cambia su estado a `ACTIVO` y lo lleva a `/turnos`

#### Scenario: Contraseña que no cumple la política
- **GIVEN** un enlace de invitación vigente
- **WHEN** la persona envía la contraseña `turnos`
- **THEN** el sistema rechaza el envío indicando que faltan "Al menos 10 caracteres" y "Un número", y el usuario sigue `INVITADO`

#### Scenario: Enlace vencido o inválido
- **WHEN** alguien abre `/activar-cuenta` con un enlace vencido, ya usado o adulterado
- **THEN** el sistema muestra "La invitación venció o no es válida. Pedile al administrador que te la reenvíe." y no permite definir contraseña
