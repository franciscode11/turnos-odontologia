# Verify — C-02 Gestión de pacientes

## Correspondencia entre escenarios y pruebas

| Escenarios de la especificación | Evidencia local |
| --- | --- |
| Alta válida, campo obligatorio ausente, fecha futura | `esquemas.test.ts` comprueba campos y fecha local. `acciones.test.ts` comprueba el alta y que los datos inválidos no lleguen al repositorio. |
| DNI duplicado, con y sin puntos, DNI de un registro dado de baja y altas concurrentes | `acciones.test.ts` cubre las cuatro situaciones con un repositorio simulado. El índice parcial existente protege los DNI activos en PostgreSQL. |
| Búsqueda parcial por apellido, DNI con puntos y ausencia de resultados | `acciones.test.ts` cubre filtros y DNI. `repositorio.test.ts` comprueba la consulta paginada y `lista.test.ts` el estado vacío. `busqueda.test.ts` comprueba los 250 ms y el descarte de respuestas obsoletas. |
| Edición conservando el DNI propio y rechazo del DNI de otra persona activa | `acciones.test.ts` comprueba el cambio permitido y que el duplicado deje ambos registros intactos. |
| Confirmar o cancelar la baja | `acciones.test.ts` comprueba baja lógica y conservación del historial simulado. `repositorio.test.ts` comprueba que la baja solo cambia `activo`. Chrome, con acciones simuladas, comprobó que cancelar no ejecuta la baja y que confirmar actualiza el listado. |
| Consulta de PROFESIONAL, escrituras prohibidas y ausencia de sesión | `acciones.test.ts` comprueba permisos y el orden de validación. `lista.test.ts` comprueba por render estático que el listado de solo lectura oculta altas, edición y baja. |

Todas las pruebas nuevas están en [tests/pacientes](../../../tests/pacientes). La reserva existente filtra pacientes activos y comprueba `activo` antes de crear nuevos turnos. [Reserva de turnos](../../../src/server/turnos/crear-turno.ts#L147)

## Comprobaciones

| Comando | Resultado | Registro de Active Stack |
| --- | --- | --- |
| `npm test` | 189 tests en 20 archivos | `d029877977ee37c48e9ff4808a23cfbd` |
| `npm run lint` | Salida 0 | `4fbf5dee1269742f0c68fb728a12054a` |
| `npm run typecheck` | Salida 0 | `9a88ea4b0dce2f6c507da2965c419d51` |
| `npm run build` | Salida 0. Incluye `/pacientes` | `5b0e90d24d90df412cf84d5096ee06f8` |

La repetición independiente de `npm test` pasó los mismos 189 tests sobre la misma huella. Registro `2e6def32d69c94206355625714e64f9e`. Los cambios de código y pruebas se limitan a la zona de C-02.

## Interacciones en Chrome con datos ficticios

Se montó el listado real de C-02 con acciones simuladas en un servidor local aislado. Pasaron el alta, el error de DNI duplicado, la edición y actualización del listado, la cancelación y confirmación de baja, el estado vacío y la vista de solo lectura de PROFESIONAL. Registro de Active Stack `01c591926dc73c03ef43f4e58ad362dc`.

[Captura de los cuatro comandos de verificación](crescini.png).

## Prueba pendiente

Falta probar el formulario y la baja desde el navegador con sesión y datos ficticios, incluida la cancelación y el retorno del foco al cerrar los diálogos. El clon aún no tiene la configuración privada de Supabase. Los tests de repositorio usan dobles de Prisma.

La revisión detectó que una reserva de C-05 que ya está en curso podría intercalarse con una baja después de leer el estado del paciente. El control de esa concurrencia pertenece al módulo de reservas. Las reservas que leen el estado después de la baja se rechazan. [Lectura y validación de paciente activo en C-05](../../../src/server/turnos/crear-turno.ts#L147)
