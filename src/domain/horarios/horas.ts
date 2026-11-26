import { esHoraValida, minutosDelDia } from "@/domain/shared/fechas";

/** "09:30" → 570. Devuelve null si no es una hora "HH:mm" entre 00:00 y 23:59 (RN-HO-01). */
export function parsearHora(hora: string): number | null {
  return esHoraValida(hora) ? minutosDelDia(hora) : null;
}

/** 570 → "09:30". */
export function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "09:00 - 12:00" */
export function etiquetaRango(horaDesde: string, horaHasta: string): string {
  return `${horaDesde} - ${horaHasta}`;
}
