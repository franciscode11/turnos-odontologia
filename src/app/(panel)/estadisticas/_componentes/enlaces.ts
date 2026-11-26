import { parametrosDePeriodo, type Periodo } from "@/domain/estadisticas/periodos";

/** Valor del Selector para "Todos los profesionales" (Radix no admite un valor vacío). */
export const TODOS = "todos";

/** URL de /estadisticas para un período y un profesional (null = todos). */
export function enlaceEstadisticas(periodo: Periodo, profesionalId: string | null): string {
  const q = new URLSearchParams(parametrosDePeriodo(periodo));
  if (profesionalId) q.set("profesional", profesionalId);
  return `/estadisticas?${q.toString()}`;
}
