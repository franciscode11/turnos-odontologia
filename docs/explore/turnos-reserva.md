# EXPLORE · C-05 Crear turno sin solapamientos

## Ficha y punto de partida

- Responsable según [CHANGES.md](../../CHANGES.md) y la guía del equipo: Joaquín Echenagorria, legajo 51964, rama `C-05-crear-turno`.
- C-05 depende de C-01. Al iniciar, ambas ramas apuntaban a `11ec340`, merge del PR #4 de la base técnica. La ficha C-01 figura pendiente en `CHANGES.md` y su change sigue abierto en OpenSpec. El líder informó que la base ya está disponible para C-05.
- Verificación inicial en la rama: `npm install` generó Prisma Client y `npm test` pasó los 38 tests existentes en 6 archivos.
- OpenSpec listaba solo `base-tecnica` y ninguna spec sincronizada. Los deltas de C-01 sobre integridad de agenda, fechas y roles sirven de referencia.

## Código a reutilizar

| Área | Contrato de C-01 |
|---|---|
| Datos | `Turno` usa `creadoPorId`. `HistorialTurno` usa `estadoAnterior`, `estadoNuevo` y `usuarioId`. `Prestacion.duracionMinutos` define la duración. Las cuatro entidades relacionadas tienen `activo`. |
| Franjas y bloqueos | `HorarioAtencion` tiene `diaSemana` ISO, `horaDesde` y `horaHasta`. `Bloqueo` tiene `desde` y `hasta` como instantes. La propuesta de IN-02 permite leerlos desde C-05 usando el seed de C-01. |
| Dominio | `seSuperponen`, `ESTADOS_QUE_OCUPAN_AGENDA`, `ocupaAgenda`, `aInstante`, `diaSemanaIso` y `rangoDelDia` están en `src/domain/shared/`. |
| Acceso | El placeholder ya llama a `accesoPagina("turnos.crear")`. La matriz habilita ADMIN y RECEPCION. `requireRol` valida la sesión y el rol en cada acción. |
| Interfaz | El catálogo exporta `Combobox`, `Selector`, `SelectorFecha`, `FormField`, `Boton`, `EstadoVacio`, `Esqueleto` y `useToast`. El panel ya provee el contexto de toasts. |
| Concurrencia | Las restricciones SQL son `turno_sin_solapamiento_profesional` y `turno_sin_solapamiento_sillon`. Ambas excluyen `CANCELADO` y usan intervalos `[inicio, fin)`. |

## Reglas y alcance

- [RN-TU-01 a RN-TU-06](../../knowledge-base/05_reglas_de_negocio.md) cubren intervalos semiabiertos, ocupación por profesional y sillón, estados que ocupan agenda, ausencia de sobreturnos y manejo del conflicto concurrente.
- RN-TU-07 a RN-TU-10 cubren el fin calculado por prestación, el intervalo completo dentro de una franja, los bloqueos, el pasado y las entidades activas.
- RN-TU-11 y RN-TU-12 cubren el turno inicial, su historial y los permisos. RN-GL-03 fija hora argentina y almacenamiento UTC.
- La zona de C-05 abarca la ruta `/turnos/nuevo`, el dominio de creación y solapamiento en `src/domain/turnos/`, la acción `src/server/turnos/crear-turno.ts` y `tests/turnos/crear-turno.test.ts`.

## Punto para revisar en PROPOSE

IN-05 deja abierto si la disponibilidad debe filtrar por sillón. La resolución documentada para el MVP ofrece horarios del profesional y valida el sillón al confirmar. La propuesta toma esa resolución y mantiene la consulta de disponibilidad general en C-04.
