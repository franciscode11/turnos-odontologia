# sistema-de-componentes Specification

## Purpose

Da a todo el equipo un único conjunto de componentes de interfaz, homogéneo y accesible según el design system, con un catálogo visible y una regla automática que impide crear controles propios.

## Requirements

### Requirement: Controles de formulario compartidos
El sistema SHALL ofrecer en `src/components/ui` los controles que usan los módulos (texto, email, teléfono, búsqueda con limpiar, número con stepper, contraseña con mostrar/ocultar, área de texto, select con grupos y múltiple, combobox con sugerencias, checkbox, radio, fecha, hora y fecha-hora con selector propio, y botones), cada uno con etiqueta, ayuda, error, deshabilitado, obligatorio y foco visible con teclado (RN-GL-04).

#### Scenario: Campo con error de validación
- **GIVEN** un formulario con el campo obligatorio "Teléfono" integrado con el esquema de validación
- **WHEN** se envía vacío
- **THEN** el campo muestra el borde de error y el mensaje debajo, y el foco va al primer campo con error

#### Scenario: Campo deshabilitado
- **WHEN** se renderiza un campo con `disabled`
- **THEN** no recibe foco ni acepta texto y se ve con el estilo deshabilitado del design system

#### Scenario: Uso solo con teclado
- **WHEN** un usuario recorre un formulario con Tab y abre el selector de fecha con Enter
- **THEN** cada control muestra el anillo de foco y el selector se maneja con flechas, Enter y Escape

### Requirement: Componentes de presentación compartidos
El sistema SHALL ofrecer Card, Table, Dialog, Badge de estado del turno, Toast, Tooltip, Skeleton y estado vacío con los tokens, radios y tiempos del design system (Revision 3).

#### Scenario: Badge por estado del turno
- **WHEN** se muestra un Badge para cada estado del turno
- **THEN** cada uno usa su par de colores con contraste AA, su ícono y su texto (Reservado, Confirmado, Cancelado, Atendido, Ausente)

#### Scenario: Toast de error
- **WHEN** una acción muestra un Toast de error
- **THEN** el Toast permanece 6 segundos, se pausa con el mouse o el foco y se puede cerrar

#### Scenario: Movimiento reducido
- **GIVEN** un sistema operativo con "reducir movimiento" activado
- **WHEN** se abre un Dialog
- **THEN** aparece con un fundido corto, sin escalas ni desplazamientos

### Requirement: Avatares en lugar de iniciales
Toda foto de perfil (personal y pacientes) SHALL mostrar uno de los avatares 3D del design system, recortado en círculo. Si la persona no tiene avatar asignado MUST mostrarse un ícono neutro, nunca iniciales.

#### Scenario: Usuario con avatar
- **GIVEN** el usuario Francisco Valles con el avatar `avatar-01-remera-naranja.webp`
- **WHEN** se muestra en el menú lateral
- **THEN** se ve su avatar en un círculo de 36 px junto a su nombre y su rol

#### Scenario: Persona sin avatar
- **GIVEN** un paciente nuevo sin avatar
- **WHEN** aparece en una tabla
- **THEN** se ve un ícono neutro en el círculo, sin letras

#### Scenario: Archivo de avatar inexistente
- **GIVEN** una persona cuyo avatar apunta a un archivo que no existe
- **WHEN** se muestra
- **THEN** se ve el ícono neutro y no una imagen rota

### Requirement: Catálogo de componentes
El sistema SHALL mostrar en `/dev/componentes` todos los componentes compartidos con sus variantes y estados, accesible para cualquier usuario con sesión.

#### Scenario: Ver el catálogo
- **WHEN** un usuario con sesión abre `/dev/componentes`
- **THEN** ve cada componente con sus estados normal, error, deshabilitado y cargando

#### Scenario: Catálogo sin sesión
- **WHEN** alguien sin sesión abre `/dev/componentes`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Catálogo en mobile
- **WHEN** se abre el catálogo a 390 px de ancho
- **THEN** los componentes se apilan en una columna sin scroll horizontal de la página

### Requirement: Prohibición de controles propios
El análisis estático del proyecto MUST fallar si se usa `<input>`, `<select>`, `<textarea>` o `<button>` nativo fuera de `src/components/ui`, y el CI MUST bloquear el merge en ese caso (RN-GL-04).

#### Scenario: Control nativo en un módulo
- **GIVEN** un archivo de `src/app/(panel)/pacientes/` que usa `<input>`
- **WHEN** corre el lint
- **THEN** el lint falla indicando que se use el componente de `src/components/ui`

#### Scenario: Control nativo dentro del sistema de componentes
- **GIVEN** un componente de `src/components/ui` que envuelve un `<input>`
- **WHEN** corre el lint
- **THEN** el lint pasa

#### Scenario: Componente compartido en un módulo
- **GIVEN** un archivo de un módulo que usa el componente de campo de texto compartido
- **WHEN** corre el lint
- **THEN** el lint pasa
