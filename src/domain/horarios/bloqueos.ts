import { aInstante, esFechaValida, esHoraValida, fechaLocal, formatearFecha, formatearHora, horaLocal } from "@/domain/shared/fechas";
import { MENSAJES } from "./constantes";
import type { ErroresCampos } from "./franjas";

/** Período en el que un profesional no atiende (KB 04, Bloqueo). Instantes UTC. */
export type BloqueoDominio = { desde: Date; hasta: Date; motivo: string };

/** RN-HO-03: desde < hasta y motivo no vacío (después de `trim`). Errores por campo o null. */
export function validarBloqueo(bloqueo: BloqueoDominio): ErroresCampos | null {
  const errores: ErroresCampos = {};
  if (bloqueo.desde.getTime() >= bloqueo.hasta.getTime()) errores.hasta = [MENSAJES.bloqueoInvertido];
  if (bloqueo.motivo.trim() === "") errores.motivo = [MENSAJES.motivoObligatorio];
  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * RN-GL-03: valor del selector fecha-hora ("AAAA-MM-DDTHH:mm" en hora de Argentina) → instante UTC.
 * Devuelve null si la fecha o la hora no son válidas.
 */
export function instanteDeFechaHoraLocal(valor: string): Date | null {
  const [fecha = "", hora = ""] = valor.split("T");
  return esFechaValida(fecha) && esHoraValida(hora) ? aInstante(fecha, hora) : null;
}

/** Instante UTC → "AAAA-MM-DDTHH:mm" en hora de Argentina (para precargar el selector al editar). */
export function aFechaHoraLocal(instante: Date): string {
  return `${fechaLocal(instante)}T${horaLocal(instante)}`;
}

/** "30/11/2026 10:00 - 30/11/2026 11:00" en hora de Argentina, sin importar la zona del proceso. */
export function formatearRangoBloqueo(desde: Date, hasta: Date): string {
  return `${formatearFecha(desde)} ${formatearHora(desde)} - ${formatearFecha(hasta)} ${formatearHora(hasta)}`;
}
