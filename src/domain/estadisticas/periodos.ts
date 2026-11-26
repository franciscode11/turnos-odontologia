import { z } from "zod";
import { aInstante, diaSemanaIso, esFechaValida, formatearFecha, sumarDias } from "@/domain/shared/fechas";

/**
 * Períodos de análisis (RN-ST-02, RN-ST-06, RN-GL-03). Se expresan en fechas locales de Argentina
 * "AAAA-MM-DD"; `hasta` es inclusive. El intervalo UTC es [desde 00:00, hasta + 1 día 00:00).
 */
export const TIPOS_PERIODO = ["semana", "mes", "rango"] as const;
export type TipoPeriodo = (typeof TIPOS_PERIODO)[number];
export type Periodo = { tipo: TipoPeriodo; desde: string; hasta: string };

/** Límite técnico de un rango (design D5): un trimestre. */
export const DIAS_MAXIMOS_RANGO = 92;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"] as const;

function partes(fecha: string): [number, number, number] {
  return fecha.split("-").map(Number) as [number, number, number];
}

function aFecha(anio: number, mes: number, dia: number): string {
  return new Date(Date.UTC(anio, mes - 1, dia)).toISOString().slice(0, 10);
}

/** Días entre dos fechas locales (b - a). */
function diferenciaDias(a: string, b: string): number {
  const [aa, am, ad] = partes(a);
  const [ba, bm, bd] = partes(b);
  return Math.round((Date.UTC(ba, bm - 1, bd) - Date.UTC(aa, am - 1, ad)) / 86_400_000);
}

/** Lunes a domingo (ISO) de la semana que contiene la fecha. */
export function periodoSemana(fecha: string): Periodo {
  const lunes = sumarDias(fecha, 1 - diaSemanaIso(fecha));
  return { tipo: "semana", desde: lunes, hasta: sumarDias(lunes, 6) };
}

/** Mes calendario que contiene la fecha. */
export function periodoMes(fecha: string): Periodo {
  const [anio, mes] = partes(fecha);
  return { tipo: "mes", desde: aFecha(anio, mes, 1), hasta: aFecha(anio, mes + 1, 0) };
}

/** Rango inclusive; null si alguna fecha no existe, si está invertido o si supera DIAS_MAXIMOS_RANGO. */
export function periodoRango(desde: string, hasta: string): Periodo | null {
  if (!esFechaValida(desde) || !esFechaValida(hasta)) return null;
  const dias = diferenciaDias(desde, hasta) + 1;
  if (dias < 1 || dias > DIAS_MAXIMOS_RANGO) return null;
  return { tipo: "rango", desde, hasta };
}

/** Cantidad de días del período. */
export function diasDelPeriodo(periodo: Periodo): number {
  return diferenciaDias(periodo.desde, periodo.hasta) + 1;
}

/**
 * RN-ST-06: período anterior de igual duración. Semana → la anterior; rango → los mismos días
 * inmediatamente antes; mes → el mes calendario anterior (design D4).
 */
export function periodoAnterior(periodo: Periodo): Periodo {
  if (periodo.tipo === "mes") return periodoMes(sumarDias(periodo.desde, -1));
  const dias = diasDelPeriodo(periodo);
  return { tipo: periodo.tipo, desde: sumarDias(periodo.desde, -dias), hasta: sumarDias(periodo.desde, -1) };
}

/** Período siguiente de igual duración (navegación). */
export function periodoSiguiente(periodo: Periodo): Periodo {
  if (periodo.tipo === "mes") return periodoMes(sumarDias(periodo.hasta, 1));
  const dias = diasDelPeriodo(periodo);
  return { tipo: periodo.tipo, desde: sumarDias(periodo.hasta, 1), hasta: sumarDias(periodo.hasta, dias) };
}

/** Intervalo UTC [inicio, fin) del período en hora de Argentina. */
export function rangoUtc(periodo: Periodo): { inicio: Date; fin: Date } {
  return { inicio: aInstante(periodo.desde, "00:00"), fin: aInstante(sumarDias(periodo.hasta, 1), "00:00") };
}

/** RN-ST-02: true si el instante cae en [inicio, fin) del período. */
export function contieneInstante(periodo: Periodo, instante: Date): boolean {
  const { inicio, fin } = rangoUtc(periodo);
  const t = instante.getTime();
  return t >= inicio.getTime() && t < fin.getTime();
}

/** Fechas locales del período, en orden. */
export function fechasDelPeriodo(periodo: Periodo): string[] {
  return Array.from({ length: diasDelPeriodo(periodo) }, (_, i) => sumarDias(periodo.desde, i));
}

const valorTexto = z.preprocess((v) => (typeof v === "string" ? v : undefined), z.string().optional());

const esquemaParametros = z.object({
  periodo: valorTexto,
  fecha: valorTexto,
  desde: valorTexto,
  hasta: valorTexto,
});

export type ParametrosPeriodo = Record<string, string | string[] | undefined>;

/**
 * Período pedido por searchParams. Ausente o inválido → mes actual (spec "Período de análisis").
 * `hoy` es la fecha local de Argentina, inyectada para fijarla en tests.
 */
export function resolverPeriodo(parametros: ParametrosPeriodo, hoy: string): Periodo {
  const porDefecto = periodoMes(hoy);
  const p = esquemaParametros.parse(parametros);
  const fecha = p.fecha === undefined ? hoy : esFechaValida(p.fecha) ? p.fecha : null;
  switch (p.periodo) {
    case "semana":
      return fecha ? periodoSemana(fecha) : porDefecto;
    case "mes":
      return fecha ? periodoMes(fecha) : porDefecto;
    case "rango":
      return periodoRango(p.desde ?? "", p.hasta ?? "") ?? porDefecto;
    default:
      return porDefecto;
  }
}

/** Parámetros de URL que representan el período (inversa de resolverPeriodo). */
export function parametrosDePeriodo(periodo: Periodo): Record<string, string> {
  return periodo.tipo === "rango"
    ? { periodo: "rango", desde: periodo.desde, hasta: periodo.hasta }
    : { periodo: periodo.tipo, fecha: periodo.desde };
}

function fechaCorta(fecha: string): string {
  return formatearFecha(aInstante(fecha, "12:00"));
}

/** "Noviembre 2026", "Semana del 23/11/2026 al 29/11/2026", "Del 10/11/2026 al 19/11/2026". */
export function etiquetaPeriodo(periodo: Periodo): string {
  if (periodo.tipo === "mes") {
    const [anio, mes] = partes(periodo.desde);
    const nombre = MESES[mes - 1]!;
    return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
  }
  const texto = `${fechaCorta(periodo.desde)} al ${fechaCorta(periodo.hasta)}`;
  return periodo.tipo === "semana" ? `Semana del ${texto}` : `Del ${texto}`;
}

/** Con qué se compara: "octubre", "la semana anterior", "los 10 días anteriores". */
export function etiquetaComparacion(periodo: Periodo): string {
  if (periodo.tipo === "mes") return MESES[partes(periodoAnterior(periodo).desde)[1] - 1]!;
  if (periodo.tipo === "semana") return "la semana anterior";
  const dias = diasDelPeriodo(periodo);
  return dias === 1 ? "el día anterior" : `los ${dias} días anteriores`;
}
