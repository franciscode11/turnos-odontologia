# Proposal

## Why

Hoy el sistema no sabe cuándo atiende cada profesional ni cuándo está ausente, así que no puede ofrecer horarios que realmente se puedan dar. Elegimos este change porque es el imprescindible n.º 4 del MVP recomendado en la sección D.3 del informe de Discovery ("Horarios de atención y bloqueos con cálculo de disponibilidad") y porque sostiene el diferenciador de "reglas de negocio explícitas y testeadas": la disponibilidad es una función pura probada con Vitest. Depende solo de la base técnica (ficha C-04 de `CHANGES.md`), por eso puede avanzar en paralelo.

## What Changes

- El ADMIN puede crear, editar y eliminar **franjas semanales de atención** por profesional (día de la semana, hora desde y hora hasta, varias por día), con validación de desde < hasta y sin superposición entre franjas del mismo profesional y día; una franja contigua se acepta (RN-HO-01, RN-HO-02).
- El ADMIN puede crear, editar y eliminar **bloqueos** por profesional (desde, hasta y motivo obligatorio) para vacaciones, feriados o congresos (RN-HO-03).
- Cualquier rol con sesión puede consultar la **disponibilidad** de un profesional activo para una fecha y una duración: inicios cada 5 minutos dentro de las franjas, descontando bloqueos y turnos que ocupan agenda (RN-HO-04, RN-HO-05, RN-TU-04).
- Solo ADMIN modifica franjas y bloqueos; RECEPCION y PROFESIONAL consultan, controlado en el servidor (RN-HO-06, RN-AU-03).
- Pantalla `/configuracion/horarios` con el horario semanal por profesional, la lista de bloqueos y la vista de disponibilidad del día, solo con componentes de `src/components/ui`.
- Dominio puro en `src/domain/horarios/` (`validarFranja`, `franjasSeSuperponen`, `validarBloqueo`, `calcularDisponibilidad`) con un test por escenario en `tests/horarios/`.

Fuera de alcance: validar la franja al crear un turno (lo hace C-05 con su propia función, IN-02), filtrar por sillón libre (P-04), cambios en `prisma/schema.prisma`, en `src/components/ui/` o en el layout y el menú del panel.

## Capabilities

### New Capabilities

- `horarios-de-atencion`: franjas semanales de atención por profesional, sus validaciones y quién puede cargarlas.
- `bloqueos-de-agenda`: períodos en los que un profesional no atiende, con motivo, y quién puede cargarlos.
- `disponibilidad`: cálculo y consulta de los inicios libres de un profesional para una fecha y una duración.

### Modified Capabilities

Ninguna (no hay specs archivadas en `openspec/specs/`; las de C-01 todavía están en su change).

## Impact

- **Código nuevo (solo en la Zona de C-04):** `src/domain/horarios/`, `src/server/horarios/`, `src/app/(panel)/configuracion/horarios/` (reemplaza el placeholder de C-01) y `tests/horarios/`.
- **Reutiliza de C-01:** modelos `HorarioAtencion`, `Bloqueo`, `Turno` y `Profesional`; `seSuperponen`, `ESTADOS_QUE_OCUPAN_AGENDA` y utilidades de fecha de `src/domain/shared/`; `requireRol` y el resultado estándar de `src/server/`; componentes de `src/components/ui`.
- **Base de datos:** sin migraciones ni cambios de esquema; solo lectura y escritura de filas existentes.
- **Dependencias:** ninguna nueva.
- **Otros changes:** C-05 no importa código de C-04 (IN-02). La consulta de disponibilidad queda lista para que, en una etapa posterior, el formulario de turno sugiera solo inicios libres.
- **Decisiones por defecto a confirmar por Lautaro y el líder:** pasos de 5 minutos (SU-03) y disponibilidad sin filtrar por sillón (IN-05, P-04). Detalle en `docs/explore/horarios-disponibilidad.md` §4.
