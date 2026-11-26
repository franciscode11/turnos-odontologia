# Tasks

## 1. Dominio con TDD

- [ ] 1.1 Escribir y correr primero los tests para fecha inválida, entidades inactivas o inexistentes, fin calculado, límites de franja, bloqueos y pasado. Implementar el esquema Zod y `validarNuevoTurno` hasta que esos casos pasen en `tests/turnos/crear-turno.test.ts`.
- [ ] 1.2 Escribir y correr primero los tests para solapamiento por profesional y por sillón, turnos contiguos y cancelados. Incorporar las validaciones usando intervalos y estados compartidos y repetir los tests.
- [ ] 1.3 Escribir y correr primero el test de horarios ofrecidos. Implementar el cálculo puro con pasos de cinco minutos y comprobar la duración, los bloqueos y la agenda del profesional con fechas fijas.

## 2. Acciones del servidor con TDD

- [ ] 2.1 Probar primero el acceso de ADMIN y RECEPCION y el rechazo de PROFESIONAL o de una solicitud sin sesión. Implementar búsqueda de pacientes y consulta de horarios con sesión, rol y Zod. Comprobar con dobles de Prisma que la consulta se omite si el acceso falla.
- [ ] 2.2 Probar primero la reserva con historial, el fallo al escribir el historial y el rechazo por sillón ocupado seguido de una reserva válida en otro sillón para la misma hora. Implementar `crearTurno` con una transacción, campos tomados de la sesión, revalidación de agenda y validaciones de dominio previas a la escritura.
- [ ] 2.3 Probar primero los dos conflictos concurrentes y un error inesperado. Mapear `23P01` por nombre de restricción y verificar que ambas ramas producen el mismo mensaje que el dominio para el recurso correspondiente.

## 3. Pantalla

- [ ] 3.1 Reemplazar el placeholder con una página protegida, catálogo activo y formulario que use el esquema compartido y los componentes de `@/components/ui`. Verificar tipos y ausencia de controles nativos con `npm run typecheck` y `npm run lint`.
- [ ] 3.2 Conectar búsqueda, horarios y envío con sus estados de carga, vacío, error y confirmación. Verificar que «Horarios del profesional» muestra la hora aunque el sillón esté ocupado, que la selección se conserva al cambiar de sillón tras el rechazo y que el toast de éxito se muestra después del reintento válido.

## 4. Verificación final

- [ ] 4.1 Correr `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`. Verificar el resultado de cada comando y cotejar cada escenario con su prueba.
- [ ] 4.2 Revisar el diff contra `origin/main` y confirmar que cada archivo pertenece a la zona de C-05 o a sus artefactos y evidencias.

## Workflow follow-up

- Al terminar VERIFY, sincronizar la spec de reserva y archivar este change en OpenSpec.
- Registrar en Engram las decisiones y los ajustes. Completar el PR contra `main` una vez autorizados el commit y el push.
