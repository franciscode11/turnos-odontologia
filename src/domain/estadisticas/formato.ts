import type { Proporcion } from "./tipos";

/** Texto para cualquier indicador con denominador 0 (US-070: nunca "0%"). */
export const SIN_DATOS = "Sin datos";

const unDecimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const entero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** 0.1667 → "16,7%"; null → "Sin datos". */
export function formatearPorcentaje(valor: Proporcion): string {
  return valor === null ? SIN_DATOS : `${unDecimal.format(valor * 100)}%`;
}

/** 1234 → "1.234". */
export function formatearCantidad(valor: number): string {
  return entero.format(valor);
}

/** Número con signo y un decimal: 8.33 → "+8,3", -1.2 → "-1,2", 0 → "0,0". */
export function conSigno(valor: number): string {
  const redondeado = Math.round(valor * 10) / 10;
  const texto = unDecimal.format(Math.abs(redondeado));
  if (redondeado > 0) return `+${texto}`;
  if (redondeado < 0) return `-${texto}`;
  return texto;
}
