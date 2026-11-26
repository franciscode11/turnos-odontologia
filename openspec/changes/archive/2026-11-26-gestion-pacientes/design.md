# Design — C-02 Gestión de pacientes

## Context

C-01 aporta el modelo `Paciente` y el índice SQL `paciente_dni_activo_key`. La ruta `/pacientes` ya está protegida con `accesoPagina("pacientes.ver")`. La pantalla sigue siendo un marcador.

## Goals / Non-Goals

- Separar normalización y validación, acceso a datos y presentación. Reutilizar los permisos existentes en las cuatro acciones.
- Mantener la operativa en el módulo de pacientes. Fuera de alcance quedan los cambios de infraestructura, las migraciones, la reactivación y las notificaciones.

## Decisions

1. **Entradas y fechas.** Implementar normalización y esquemas Zod en el dominio. Comparar fechas de nacimiento como fechas de calendario en Argentina, con reloj inyectable para probar el límite.
2. **Permisos.** Verificar la sesión y llamar a `requireRol` con los roles de `PERMISOS["pacientes.ver"]` o `PERMISOS["pacientes.editar"]` antes de validar entradas. Reusar `accesoPagina` y la matriz para la presentación.
3. **Persistencia.** Usar Prisma con el modelo existente. Una comprobación de duplicados puede mejorar el mensaje, y el índice parcial es el control definitivo bajo concurrencia. En edición, excluir el ID propio del chequeo. Traducir el conflicto de unicidad del DNI al mensaje del roadmap.
4. **Listado.** Buscar por apellido parcial sin distinguir mayúsculas o por DNI completo normalizado. Filtrar activos, ordenar por apellido, nombre e ID, y usar páginas de 20 filas como valor inicial de revisión. Reiniciar la página al cambiar el filtro. Aplicar la espera de 250 ms del roadmap.
5. **Interfaz.** Reemplazar el marcador con los componentes compartidos de encabezado, tabla, campos, diálogo, botones y estado vacío. Confirmar la baja con un diálogo y refrescar la consulta tras guardar. Ocultar acciones de escritura para `PROFESIONAL` y mantener la protección del servidor.
6. **Límite de integración.** La reserva de turnos ya filtra pacientes activos en su propio módulo. Verificar que la baja conserve esa integración a través de `activo`.

## Risks / Trade-offs

- Las comprobaciones previas al guardado pueden quedar desactualizadas cuando hay concurrencia. Capturar el conflicto del índice y devolver el mismo error de negocio.
- Una edición de fecha basada en UTC puede producir un día incorrecto en Argentina. Tratar la fecha de nacimiento como fecha sin hora en los límites del dominio.
- Las respuestas de búsqueda pueden llegar fuera de orden. Asociar cada respuesta al filtro y página que la originaron.

## UI Mockups

Design system revision: 3
Decision: no (project policy)
