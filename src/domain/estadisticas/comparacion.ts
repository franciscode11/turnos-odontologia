import { conSigno, SIN_DATOS } from "./formato";
import type { Indicadores } from "./tipos";

/** Indicadores que muestran variación contra el período anterior (RN-ST-06). */
export const INDICADORES_COMPARABLES = ["turnosDados", "ocupacion", "ausentismo", "cancelaciones"] as const;
export type IndicadorComparable = (typeof INDICADORES_COMPARABLES)[number];

/** Si una suba es buena (turnos, ocupación) o mala (ausentismo, cancelaciones). */
const SUBA_FAVORABLE: Record<IndicadorComparable, boolean> = {
  turnosDados: true,
  ocupacion: true,
  ausentismo: false,
  cancelaciones: false,
};

/**
 * Variación de un indicador. Conteos: porcentaje sobre el anterior. Tasas: diferencia en puntos.
 * `favorable` es null cuando, redondeada a un decimal, no cambió. null = "Sin datos".
 */
export type Variacion = { valor: number; unidad: "porcentaje" | "puntos"; favorable: boolean | null } | null;

function sentido(indicador: IndicadorComparable, valor: number): boolean | null {
  if (Math.round(valor * 10) === 0) return null;
  return valor > 0 === SUBA_FAVORABLE[indicador];
}

/** RN-ST-06: compara el indicador del período con el del período anterior de igual duración. */
export function calcularVariacion(indicador: IndicadorComparable, actual: Indicadores, anterior: Indicadores): Variacion {
  if (indicador === "turnosDados") {
    if (anterior.turnosDados === 0) return null;
    const valor = ((actual.turnosDados - anterior.turnosDados) / anterior.turnosDados) * 100;
    return { valor, unidad: "porcentaje", favorable: sentido(indicador, valor) };
  }
  const a = actual[indicador];
  const b = anterior[indicador];
  if (a === null || b === null) return null;
  const valor = (a - b) * 100;
  return { valor, unidad: "puntos", favorable: sentido(indicador, valor) };
}

export function compararIndicadores(actual: Indicadores, anterior: Indicadores): Record<IndicadorComparable, Variacion> {
  return {
    turnosDados: calcularVariacion("turnosDados", actual, anterior),
    ocupacion: calcularVariacion("ocupacion", actual, anterior),
    ausentismo: calcularVariacion("ausentismo", actual, anterior),
    cancelaciones: calcularVariacion("cancelaciones", actual, anterior),
  };
}

/** "+8,3%", "-1,2 pts" o "Sin datos". */
export function formatearVariacion(variacion: Variacion): string {
  if (variacion === null) return SIN_DATOS;
  return variacion.unidad === "porcentaje" ? `${conSigno(variacion.valor)}%` : `${conSigno(variacion.valor)} pts`;
}
