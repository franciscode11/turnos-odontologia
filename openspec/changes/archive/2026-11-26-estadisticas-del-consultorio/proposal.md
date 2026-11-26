# Proposal

## Why

El dueño del consultorio (ADMIN) necesita saber cuántos turnos se dieron, qué tan ocupada está la agenda y cuánto ausentismo y cancelaciones hay para tomar decisiones (DD-16, US-070). Hoy `/estadisticas` es un placeholder del C-01; los datos ya existen en `Turno`, `HorarioAtencion` y `Bloqueo`, así que se puede resolver con lecturas y cálculos puros, sin tablas nuevas (RN-ST-07).

## What Changes

- Dominio puro en `src/domain/estadisticas/`:
  - Períodos en hora de Argentina: semana ISO, mes calendario y rango de fechas (máximo 92 días), con su período anterior para comparar (RN-ST-06, RN-GL-03) y resolución desde `searchParams` (inválido → mes actual).
  - `calcularIndicadores`: turnos dados (RN-ST-02), atendidos, ausentes, cancelados, ocupación (RN-ST-03), ausentismo (RN-ST-04) y cancelaciones (RN-ST-05), con "Sin datos" cuando un denominador es 0.
  - Variación contra el período anterior (RN-ST-06), turnos por día, motivos de cancelación agrupados por texto normalizado (RN-ST-05) y desglose por profesional y por prestación.
- Consulta de solo lectura en `src/server/estadisticas/` protegida con `requireRol(["ADMIN"])` (RN-ST-01) y `select` mínimo.
- Pantalla `/estadisticas` según `design-system/screens/estadisticas.html`: selector de período y profesional, tarjetas de indicadores con variación, barras de turnos por día, motivos de cancelación, turnos por prestación y tabla por profesional con avatar; `loading.tsx` y estado vacío. Los roles sin permiso ven `SinPermiso`.

Fuera de alcance: exportar datos, estadísticas por sillón o por paciente, historial de franjas, gráficos con librerías externas y cualquier escritura.

## Capabilities

### New Capabilities
- `estadisticas-del-consultorio`: indicadores del consultorio por período (turnos dados, ocupación, ausentismo, cancelaciones y motivos), su comparación con el período anterior, desgloses por profesional y prestación, y el acceso exclusivo del ADMIN.

### Modified Capabilities
<!-- Ninguna: la matriz de permisos ya define `estadisticas.ver` solo para ADMIN (autorizacion-por-rol). -->

## Impact

- Código nuevo solo en la Zona del C-08: `src/domain/estadisticas/`, `src/server/estadisticas/`, `src/app/(panel)/estadisticas/`, `tests/estadisticas/`.
- Reutiliza sin modificar `src/domain/shared/{estados,fechas,intervalos}.ts`, `src/server/auth/`, `src/server/resultado.ts`, `src/server/db.ts` y `src/components/ui`.
- Sin cambios de esquema, migraciones ni dependencias nuevas.
