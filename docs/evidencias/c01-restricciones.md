# C-01 · Verificación en la base real (Supabase)

- **Fecha:** 2026-11-25
- **Quién:** líder (con el agente)
- **Proyecto:** Supabase, región us-west-2

## Migración y seed (tarea 9.1)

- `npx prisma migrate deploy`: migración `20261125120000_inicial` aplicada sin errores.
- `npx prisma db seed`: 6 usuarios del equipo, 3 profesionales, 3 prestaciones, 3 sillones, franjas de lunes a viernes, 5 pacientes inventados y 10 turnos de ejemplo con historial. Al correrlo de nuevo no duplica datos.
- Login con la publishable key (como la app), un usuario por fila: los 6 entran con la contraseña del seed (10 caracteres y un número) y una contraseña incorrecta se rechaza.

## Restricciones de integridad (tarea 9.2)

Salida de `scripts/verificar-restricciones.sql` contra la base real. No deja datos (0 pacientes de prueba después de correrlo).

| # | Caso | Esperado | Obtenido | Veredicto |
|---|---|---|---|---|
| 1 | Mismo profesional 09:15-09:45 sobre 09:00-09:30 | rechaza (23P01) | rechaza (23P01) | OK |
| 2 | Mismo profesional contiguo 09:30-10:00 | acepta | acepta | OK |
| 3 | Mismo sillón, otro profesional, 09:00-09:30 | rechaza (23P01) | rechaza (23P01) | OK |
| 4 | Otro sillón y otro profesional, mismo horario | acepta | acepta | OK |
| 5 | Reutilizar el horario de un cancelado | acepta | acepta | OK |
| 6 | Reactivar un cancelado que choca | rechaza (23P01) | rechaza (23P01) | OK |
| 7 | Turno de 16:00 a 15:30 | rechaza (23514) | rechaza (23514) | OK |
| 8 | Cancelado sin motivo | rechaza (23514) | rechaza (23514) | OK |
| 9 | DNI de un paciente inactivo en uno activo | acepta | acepta | OK |
| 10 | DNI repetido entre activos | rechaza (23505) | rechaza (23505) | OK |
| 11 | Prestación de 7 minutos | rechaza (23514) | rechaza (23514) | OK |
| 12 | Usuario PROFESIONAL sin profesional | rechaza (23514) | rechaza (23514) | OK |
| 13 | Editar el historial | rechaza (P0001) | rechaza (P0001) | OK |

## Supabase Advisors

- **Seguridad:** sin alertas críticas.
  - Avisos: `function_search_path_mutable` en `historial_turno_solo_insercion` y la protección de contraseñas filtradas apagada.
  - Informativo: RLS sin políticas hasta crear el rol `equipo_dev`.
- **Rendimiento:** solo informativos: 4 claves foráneas sin índice e índices sin uso (la base es nueva).
