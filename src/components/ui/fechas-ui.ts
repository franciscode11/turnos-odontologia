/**
 * Utilidades de calendario para los pickers. Trabajan con fechas locales de Argentina como
 * texto ("AAAA-MM-DD", "AAAA-MM", "AAAA-Www") y aritmética de calendario pura en UTC, así que
 * no dependen de la zona horaria del navegador. "Hoy" sale de `hoy()` (hora de Argentina).
 */
import { esFechaValida, sumarDias } from "@/domain/shared/fechas";

export const DIAS_CORTOS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"] as const;
export const DIAS_LARGOS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;
const DIAS_TITULO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
export const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;
export const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

const RE_MES = /^(\d{4})-(0[1-9]|1[0-2])$/;
const RE_SEMANA = /^(\d{4})-W(0[1-9]|[1-4]\d|5[0-3])$/;

export function partes(fecha: string): { anio: number; mes: number; dia: number } {
  const [anio = 0, mes = 1, dia = 1] = fecha.split("-").map(Number);
  return { anio, mes, dia };
}

function dos(n: number): string {
  return String(n).padStart(2, "0");
}

export function armarFecha(anio: number, mes: number, dia: number): string {
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`;
}

/** 0 = lunes ... 6 = domingo. */
export function diaSemana(fecha: string): number {
  const { anio, mes, dia } = partes(fecha);
  return (new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() + 6) % 7;
}

export function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

/** Misma fecha corrida `meses` meses (si el día no existe, queda en el último del mes). */
export function sumarMeses(fecha: string, meses: number): string {
  const { anio, mes, dia } = partes(fecha);
  const base = new Date(Date.UTC(anio, mes - 1 + meses, 1));
  const a = base.getUTCFullYear();
  const m = base.getUTCMonth() + 1;
  return armarFecha(a, m, Math.min(dia, diasDelMes(a, m)));
}

/** Las 6 semanas (42 días, lunes primero) que muestra el calendario del mes de `fecha`. */
export function grillaDelMes(fecha: string): string[][] {
  const { anio, mes } = partes(fecha);
  const primero = armarFecha(anio, mes, 1);
  const inicio = sumarDias(primero, -diaSemana(primero));
  return Array.from({ length: 6 }, (_, s) => Array.from({ length: 7 }, (_, d) => sumarDias(inicio, s * 7 + d)));
}

export function inicioSemana(fecha: string): string {
  return sumarDias(fecha, -diaSemana(fecha));
}

/** Semana ISO 8601 ("2026-W48") de una fecha. */
export function semanaIso(fecha: string): string {
  const jueves = sumarDias(fecha, 3 - diaSemana(fecha));
  const { anio } = partes(jueves);
  const primerJueves = sumarDias(armarFecha(anio, 1, 4), 3 - diaSemana(armarFecha(anio, 1, 4)));
  const diferencia = (Date.UTC(...utc(jueves)) - Date.UTC(...utc(primerJueves))) / 86_400_000;
  return `${anio}-W${dos(Math.round(diferencia / 7) + 1)}`;
}

function utc(fecha: string): [number, number, number] {
  const { anio, mes, dia } = partes(fecha);
  return [anio, mes - 1, dia];
}

/** Lunes de una semana ISO ("2026-W48" → "2026-11-23"). */
export function lunesDeSemana(semana: string): string | null {
  const m = RE_SEMANA.exec(semana);
  if (!m) return null;
  const anio = Number(m[1]);
  const numero = Number(m[2]);
  const cuatroEnero = armarFecha(anio, 1, 4);
  return sumarDias(inicioSemana(cuatroEnero), (numero - 1) * 7);
}

export function esMesValido(mes: string): boolean {
  return RE_MES.test(mes);
}

export function esSemanaValida(semana: string): boolean {
  const lunes = lunesDeSemana(semana);
  return lunes !== null && semanaIso(lunes) === semana;
}

export function fechaValidaONula(fecha: string | null | undefined): string | null {
  return fecha && esFechaValida(fecha) ? fecha : null;
}

/** "Mié 25 nov 2026" */
export function fechaCorta(fecha: string): string {
  const { anio, mes, dia } = partes(fecha);
  return `${DIAS_TITULO[diaSemana(fecha)]} ${dia} ${MESES_CORTOS[mes - 1]} ${anio}`;
}

/** "25/11/2026" */
export function fechaNumerica(fecha: string): string {
  const { anio, mes, dia } = partes(fecha);
  return `${dos(dia)}/${dos(mes)}/${anio}`;
}

/** "miércoles 25 de noviembre de 2026" (para lectores de pantalla). */
export function fechaLarga(fecha: string): string {
  const { anio, mes, dia } = partes(fecha);
  return `${DIAS_LARGOS[diaSemana(fecha)]} ${dia} de ${MESES_LARGOS[mes - 1]} de ${anio}`;
}

/** "Noviembre 2026" */
export function tituloMes(anio: number, mes: number): string {
  const nombre = MESES_LARGOS[mes - 1] ?? "";
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
}

/** "Semana 48, del 23 al 29 nov" (o "del 28 dic al 3 ene" si cruza de mes). */
export function textoSemana(semana: string): string {
  const lunes = lunesDeSemana(semana);
  if (!lunes) return semana;
  const domingo = sumarDias(lunes, 6);
  const a = partes(lunes);
  const b = partes(domingo);
  const numero = Number(semana.slice(-2));
  const desde = a.mes === b.mes ? `${a.dia}` : `${a.dia} ${MESES_CORTOS[a.mes - 1]}`;
  return `Semana ${numero}, del ${desde} al ${b.dia} ${MESES_CORTOS[b.mes - 1]}`;
}

/** Horarios "HH:mm" desde `desde` hasta `hasta` (inclusive) cada `paso` minutos. */
export function horarios(desde: string, hasta: string, paso: number): string[] {
  const aMin = (h: string) => {
    const [hh = 0, mm = 0] = h.split(":").map(Number);
    return hh * 60 + mm;
  };
  const lista: string[] = [];
  const pasoSeguro = Math.max(1, Math.floor(paso));
  for (let m = aMin(desde); m <= aMin(hasta) && m < 24 * 60; m += pasoSeguro) {
    lista.push(`${dos(Math.floor(m / 60))}:${dos(m % 60)}`);
  }
  return lista;
}
