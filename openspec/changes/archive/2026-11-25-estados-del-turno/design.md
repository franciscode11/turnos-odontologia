# Design

## Context

C-01 aporta `Turno`, `HistorialTurno`, `UsuarioSesion.profesionalId` y los permisos del panel. El detalle de `/turnos/[id]` es una pantalla provisional. La base de conocimiento define las transiciones en RN-ES-01 a RN-ES-08.

## Goals / Non-Goals

**Goals:**
- Aplicar las reglas de transición y mostrar las mismas acciones en el detalle.
- Persistir el estado y su historial de forma atómica, incluso con solicitudes simultáneas.
- Reutilizar los componentes y formatos de fechas de C-01.

**Non-Goals:**
- Reprogramación, creación de turnos, cambios en el esquema o en la agenda compartida.

## Decisions

- El dominio calcula las acciones disponibles y valida cada transición con el estado, el inicio, un reloj explícito y el rol. Los permisos generales por acción vienen de `src/server/auth/matriz.ts` y el dominio controla la pertenencia del profesional.
- Las Server Actions reutilizan `requireRol`, validan el UUID y el motivo con Zod, y usan el cliente Prisma compartido. En una transacción se compara el estado leído antes de escribir y se crea el historial solo si la actualización afectó al turno esperado. Un cambio simultáneo devuelve un aviso para volver a consultar el detalle.
- La página usa `accesoPagina("turnos.ver")`, selecciona los campos necesarios en Prisma y muestra el historial con la fecha de Argentina. Los controles se componen con `@/components/ui`. Las mutaciones exitosas actualizan el detalle y la agenda mediante `revalidatePath`.

## Risks / Trade-offs

- Una pantalla desactualizada puede mostrar una acción que otra sesión ya ejecutó. El servidor verifica el estado vigente y evita entradas de historial duplicadas.

## UI Mockups

- Design system revision: 3.
- Decision: no (project policy).
