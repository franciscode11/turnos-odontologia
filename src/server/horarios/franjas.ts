"use server";

import { accionesHorarios } from "./instancia";

// Server Actions de franjas (RN-HO-01, RN-HO-02). Solo ADMIN (RN-HO-06): lo verifica cada acción.
// Reciben `unknown` a propósito: todo lo que llega del cliente pasa por el esquema Zod.

/** Entrada: `{ profesionalId, diaSemana, horaDesde, horaHasta }`. */
export async function crearFranja(entrada: unknown) {
  return accionesHorarios().crearFranja(entrada);
}

/** Entrada: `{ id, datos: { profesionalId, diaSemana, horaDesde, horaHasta } }`. */
export async function editarFranja(entrada: unknown) {
  return accionesHorarios().editarFranja(entrada);
}

/** Entrada: `{ id }`. Borrado físico (D9). */
export async function eliminarFranja(entrada: unknown) {
  return accionesHorarios().eliminarFranja(entrada);
}
