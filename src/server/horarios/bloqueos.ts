"use server";

import { accionesHorarios } from "./instancia";

// Server Actions de bloqueos (RN-HO-03). Solo ADMIN (RN-HO-06): lo verifica cada acción.
// `desde` y `hasta` llegan como "AAAA-MM-DDTHH:mm" en hora de Argentina y se guardan en UTC (RN-GL-03).

/** Entrada: `{ profesionalId, desde, hasta, motivo }`. */
export async function crearBloqueo(entrada: unknown) {
  return accionesHorarios().crearBloqueo(entrada);
}

/** Entrada: `{ id, datos: { profesionalId, desde, hasta, motivo } }`. */
export async function editarBloqueo(entrada: unknown) {
  return accionesHorarios().editarBloqueo(entrada);
}

/** Entrada: `{ id }`. Borrado físico (D9); no toca turnos (D4). */
export async function eliminarBloqueo(entrada: unknown) {
  return accionesHorarios().eliminarBloqueo(entrada);
}
