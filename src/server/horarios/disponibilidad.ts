"use server";

import { accionesHorarios } from "./instancia";

/**
 * Inicios libres de un profesional activo para una fecha y una duración (RN-HO-04, RN-HO-05).
 * Abierta a ADMIN, RECEPCION y PROFESIONAL (RN-HO-06). Entrada: `{ profesionalId, fecha, duracion }`.
 */
export async function consultarDisponibilidad(entrada: unknown) {
  return accionesHorarios().consultarDisponibilidad(entrada);
}
