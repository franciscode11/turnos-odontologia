# Proposal

## Why

El catálogo (profesionales, prestaciones con duración y sillones/boxes) es la funcionalidad imprescindible n.º 3 del MVP recomendado en la sección D.3 del informe de Discovery: la duración por prestación y los sillones como recurso solo están comprobados en 6 de 20 competidores. Sin catálogo no hay con quién, qué ni dónde dar un turno, y la duración de la prestación es la que fija la hora de fin del turno (SU-04). Depende solo de la base técnica C-01, ya mergeada, por eso se hace en paralelo (ficha C-03 de `CHANGES.md`).

## What Changes

- Reglas de dominio puras para el catálogo: duración de prestación válida (múltiplo de 5 entre 10 y 240, RN-CA-02), matrícula de profesional única (RN-CA-01) y nombre de sillón único (RN-CA-03).
- Acciones del servidor para crear, editar, desactivar y reactivar profesionales, prestaciones y sillones, permitidas solo a `ADMIN` (RN-CA-06), con validación de sesión, rol y esquema.
- Baja lógica: no existe borrado; desactivar conserva el registro para que los turnos históricos sigan mostrando el dato (RN-CA-04).
- Tres pantallas en `/configuracion/profesionales`, `/configuracion/prestaciones` y `/configuracion/sillones` con tabla, diálogo de alta y edición e interruptor de activo. Los roles `RECEPCION` y `PROFESIONAL` las ven en solo lectura.
- Tests automatizados de cada escenario de la spec, sin base de datos.

Fuera de alcance: filtrar inactivos al crear turnos (lo aplican C-04 y C-05 sobre el campo `activo`, RN-CA-05), vincular profesionales con usuarios (C-07), editar el avatar del profesional, asociar prestaciones a profesionales y cualquier cambio en `prisma/schema.prisma`.

## Capabilities

### New Capabilities

- `catalogo-consultorio`: alta, edición, desactivación y consulta de profesionales, prestaciones y sillones/boxes, con sus reglas de validación y permisos por rol.

### Modified Capabilities

(ninguna)

## Impact

- **Código nuevo (solo la Zona de C-03):** `src/domain/catalogo/`, `src/server/catalogo/`, `src/app/(panel)/configuracion/{profesionales,prestaciones,sillones}/` (reemplaza los placeholders de C-01) y `tests/catalogo/`.
- **Reutiliza sin modificar:** modelos `Profesional`, `Prestacion` y `Sillon` con sus índices únicos y el `CHECK` de duración; `requireRol`, `accesoPagina`, `conAcceso`/`Resultado`, `prisma` y los componentes de `src/components/ui`.
- **Sin dependencias nuevas** ni migraciones.

## Ajustes de la revisión (Ajustar)

Decisiones que la primera versión dejaba abiertas y se resolvieron al revisar la propuesta:

1. **Mayúsculas y espacios en matrícula y nombre de sillón.** Antes se tomaban `MP-1234` y `mp-1234 ` como distintas, igual que el índice de la base. Así podía haber dos profesionales con la misma matrícula por un error de tipeo, y RN-CA-01 dejaba de cumplirse en la práctica. Ahora la matrícula se guarda sin espacios y en mayúsculas, y la unicidad de matrícula y de nombre de sillón se compara sin distinguir mayúsculas.
2. **Precio de referencia.** Antes no tenía límites. Ahora, si se informa, MUST ser mayor o igual a 0 y tener como máximo 2 decimales (la columna es `Decimal(12,2)`). Un precio negativo no tiene sentido como referencia.
3. **Escenario de solo lectura verificable.** Antes decía "ve el listado sin opciones", algo que solo se comprueba mirando la pantalla. Ahora se verifica con un test: para `RECEPCION` y `PROFESIONAL` el permiso de edición de cada sección del catálogo da falso y la pantalla no ofrece acciones, y la acción del servidor igual responde "Sin permisos".

Pendiente de avisar al líder: el punto 1 es más estricto que la KB (RN-CA-01 y RN-CA-03 no hablan de mayúsculas). No contradice ninguna regla ni toca el esquema.
