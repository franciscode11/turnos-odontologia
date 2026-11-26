# autorizacion-por-rol Specification

## Purpose

Garantiza que cada usuario solo pueda hacer lo que su único rol permite según la matriz de permisos, controlado en el servidor en cada acción y reflejado en el menú.

## Requirements

### Requirement: Un único rol por usuario leído del servidor
Cada usuario SHALL tener exactamente un rol (`ADMIN`, `RECEPCION` o `PROFESIONAL`), y el sistema MUST tomarlo de la tabla de usuarios, nunca de datos que el usuario pueda editar como los metadatos de su cuenta (RN-AU-02).

#### Scenario: Rol tomado de la tabla de usuarios
- **GIVEN** el usuario `joaquin.cortez@example.com` con rol `PROFESIONAL` en la tabla de usuarios
- **WHEN** inicia sesión y el sistema resuelve sus permisos
- **THEN** el sistema lo trata como `PROFESIONAL`

#### Scenario: Metadatos manipulados
- **GIVEN** un usuario `RECEPCION` que modificó los metadatos de su cuenta de Supabase para decir `ADMIN`
- **WHEN** ejecuta una acción reservada a `ADMIN`
- **THEN** el sistema la rechaza con "Sin permisos" porque su rol en la tabla de usuarios es `RECEPCION`

#### Scenario: Profesional sin profesional vinculado
- **GIVEN** un usuario con rol `PROFESIONAL`
- **WHEN** se guarda sin profesional vinculado
- **THEN** el sistema lo rechaza, porque un `PROFESIONAL` MUST estar vinculado a un registro de profesional y los demás roles no

### Requirement: Verificación de rol en cada acción del servidor
Toda acción del servidor que lea o modifique datos MUST verificar la sesión y luego el rol contra la matriz de `knowledge-base/03_actores_y_roles.md` antes de validar la entrada o tocar la base. Ocultar un botón no alcanza (RN-AU-03).

#### Scenario: Rol permitido
- **GIVEN** una acción permitida para `ADMIN` y `RECEPCION`
- **WHEN** la ejecuta un usuario `RECEPCION` activo
- **THEN** la verificación de rol pasa y la acción continúa

#### Scenario: Rol no permitido
- **GIVEN** una acción permitida solo para `ADMIN`
- **WHEN** la ejecuta un usuario `PROFESIONAL` llamándola directamente, sin pasar por la interfaz
- **THEN** la acción devuelve el error "Sin permisos" y no lee ni escribe datos

#### Scenario: Sin sesión
- **WHEN** se ejecuta cualquier acción del servidor sin sesión
- **THEN** la acción devuelve el error "No autenticado" antes de verificar el rol

### Requirement: Menú filtrado por rol
El menú lateral SHALL mostrar solo las secciones a las que el rol del usuario tiene acceso según la matriz de permisos. Es una ayuda visual: el control real es el de cada acción.

#### Scenario: Menú del administrador
- **WHEN** inicia sesión `francisco.valles@example.com` (`ADMIN`)
- **THEN** el menú muestra Agenda, Pacientes, Estadísticas, Profesionales, Prestaciones, Sillones, Horarios, Equipo y Componentes

#### Scenario: Menú de recepción y de profesional
- **WHEN** inicia sesión un usuario `RECEPCION` o `PROFESIONAL`
- **THEN** el menú no muestra Equipo ni Estadísticas, y sí muestra Agenda, Pacientes, la configuración en modo consulta y Componentes

#### Scenario: Acceso directo a una sección no permitida
- **GIVEN** un usuario `RECEPCION` con sesión
- **WHEN** escribe en el navegador la dirección `/equipo`
- **THEN** el sistema no muestra el contenido de la sección y le indica que no tiene permisos para verla
