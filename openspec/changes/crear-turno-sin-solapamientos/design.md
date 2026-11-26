# Design

## Context

C-01 provee el esquema, las restricciones de PostgreSQL, la sesión y el sistema de componentes. La página de C-05 ya está enlazada desde la agenda y su placeholder verifica `accesoPagina("turnos.crear")`. IN-02 permite leer las franjas directamente en C-05 mientras C-04 se desarrolla en paralelo.

## Goals / Non-Goals

La reserva completa sigue el límite de la zona C-05. La gestión de horarios y bloqueos corresponde a C-04 y las transiciones posteriores a la reserva corresponden a C-06.

## Decisions

1. **Contrato único de entrada.** Definir un esquema Zod en el dominio para los cuatro UUID y la fecha y hora locales. El formulario usa el mismo esquema mediante react-hook-form. El servidor usa `aInstante` para convertir el inicio y el dominio calcula el fin desde `Prestacion.duracionMinutos`, leído de la base.
2. **Una validación pura, con reloj inyectado.** `validarNuevoTurno` recibe el intervalo, la duración y los datos relevantes del consultorio. Usa `seSuperponen`, `ocupaAgenda` y conversiones de `src/domain/shared/`. La franja se obtiene por `diaSemanaIso` y se construye desde `HorarioAtencion.horaDesde` y `horaHasta`. Los bloqueos se normalizan de `desde/hasta` a `inicio/fin`. El cálculo de horarios reutiliza las mismas condiciones de intervalo y se ejecuta del lado del servidor.
3. **Consulta para el formulario.** La página carga el catálogo activo tras verificar `accesoPagina("turnos.crear")`. La búsqueda de pacientes y la consulta de horarios son acciones del mismo módulo. Cada acción verifica sesión y rol con `requireRol(["ADMIN", "RECEPCION"])` y valida su entrada con Zod. La búsqueda devuelve una lista acotada con los datos necesarios para identificar la opción. La consulta de horarios utiliza fecha, profesional y prestación para obtener las franjas, bloqueos y turnos del día. IN-05 indica que el sillón se comprueba cuando se confirma la reserva.
4. **Validación y escritura en servidor.** `crearTurno` vuelve a leer entidades, franjas, bloqueos y turnos relevantes. La consulta de solapamientos aplica `inicio < finSolicitado` y `fin > inicioSolicitado`, filtra con `ESTADOS_QUE_OCUPAN_AGENDA` y considera el profesional o el sillón. `prisma.$transaction` guarda `Turno.creadoPorId` y `HistorialTurno` con `estadoAnterior: null`, `estadoNuevo: "RESERVADO"` y `usuarioId` de la sesión. Se revalida `/turnos` después de completar la transacción.
5. **Una explicación por recurso.** El dominio y el manejo de errores de persistencia comparten los mensajes. Para SQLSTATE `23P01`, identificar `turno_sin_solapamiento_profesional` o `turno_sin_solapamiento_sillon` en la forma de error del cliente Prisma y el adaptador PostgreSQL. La reserva devuelve el mensaje del recurso afectado.
6. **Formulario sobre el sistema existente.** Usar `Combobox` para paciente, `Selector` para catálogo y horarios calculados, `SelectorFecha` para el día, `FormField` para errores de campos, `Boton` para confirmar y `useToast` para el resultado. Etiquetar el selector de inicio «Horarios del profesional». Reiniciar la selección de hora al cambiar fecha, profesional o prestación. Ante un conflicto de sillón, conservar los valores y permitir cambiar el sillón con la misma hora seleccionada.

## Risks / Trade-offs

- Los turnos pueden cambiar después de consultar horarios. La acción recalcula la validez y las dos restricciones SQL de C-01 garantizan la exclusión entre reservas concurrentes.
- La consulta de horarios describe la agenda del profesional. La ocupación del sillón se comunica al confirmar, conforme a la resolución de IN-05.
- La representación de `23P01` puede variar entre el error original de PostgreSQL y la envoltura de Prisma. La verificación cubre ambos recursos y la forma del error recibido por la acción.

## Migration Plan

El cambio usa la migración inicial de C-01 y las franjas del seed existente.
