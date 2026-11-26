import { ocupaAgenda } from "@/domain/shared/estados";
import { aInstante, diaSemanaIso } from "@/domain/shared/fechas";
import { seSuperponen } from "@/domain/shared/intervalos";
import { contieneInstante, fechasDelPeriodo, type Periodo } from "./periodos";
import type { BloqueoEstadistica, FranjaEstadistica, Indicadores, Proporcion, TurnoEstadistica } from "./tipos";

const MINUTO = 60_000;

/** Proporción con "Sin datos" (null) cuando el denominador es 0 (US-070). */
export function proporcion(numerador: number, denominador: number): Proporcion {
  return denominador > 0 ? numerador / denominador : null;
}

/** RN-ST-02: turnos con inicio dentro del período, en cualquier estado. */
export function turnosDelPeriodo<T extends Pick<TurnoEstadistica, "inicio">>(turnos: readonly T[], periodo: Periodo): T[] {
  return turnos.filter((t) => contieneInstante(periodo, t.inicio));
}

/** Milisegundos de [a, b) cubiertos por la unión de los intervalos dados. */
function cubierto(a: number, b: number, intervalos: ReadonlyArray<{ inicio: number; fin: number }>): number {
  const recortes = intervalos
    .map((i) => ({ inicio: Math.max(a, i.inicio), fin: Math.min(b, i.fin) }))
    .filter((i) => i.fin > i.inicio)
    .sort((x, y) => x.inicio - y.inicio);
  let total = 0;
  let tramoInicio = 0;
  let tramoFin = 0;
  let hayTramo = false;
  for (const r of recortes) {
    if (hayTramo && r.inicio <= tramoFin) {
      tramoFin = Math.max(tramoFin, r.fin);
      continue;
    }
    if (hayTramo) total += tramoFin - tramoInicio;
    tramoInicio = r.inicio;
    tramoFin = r.fin;
    hayTramo = true;
  }
  if (hayTramo) total += tramoFin - tramoInicio;
  return total;
}

/**
 * RN-ST-03 (denominador): minutos de atención de las franjas en cada fecha del período
 * (según su día ISO, en hora de Argentina) menos la unión de los bloqueos del mismo profesional.
 */
export function minutosDeAtencion(franjas: readonly FranjaEstadistica[], bloqueos: readonly BloqueoEstadistica[], periodo: Periodo): number {
  let total = 0;
  for (const fecha of fechasDelPeriodo(periodo)) {
    const dia = diaSemanaIso(fecha);
    for (const f of franjas) {
      if (f.diaSemana !== dia) continue;
      const intervalo = { inicio: aInstante(fecha, f.horaDesde), fin: aInstante(fecha, f.horaHasta) };
      const a = intervalo.inicio.getTime();
      const b = intervalo.fin.getTime();
      if (b <= a) continue;
      const delProfesional = bloqueos
        .filter((x) => x.profesionalId === f.profesionalId && seSuperponen(intervalo, { inicio: x.desde, fin: x.hasta }))
        .map((x) => ({ inicio: x.desde.getTime(), fin: x.hasta.getTime() }));
      total += b - a - cubierto(a, b, delProfesional);
    }
  }
  return Math.round(total / MINUTO);
}

/** RN-ST-03 (numerador): minutos de los turnos del período que ocupan agenda (RN-TU-04). */
export function minutosOcupados(turnos: readonly TurnoEstadistica[], periodo: Periodo): number {
  const ms = turnosDelPeriodo(turnos, periodo)
    .filter((t) => ocupaAgenda(t.estado))
    .reduce((suma, t) => suma + Math.max(0, t.fin.getTime() - t.inicio.getTime()), 0);
  return Math.round(ms / MINUTO);
}

/**
 * Indicadores de un período (RN-ST-02 a RN-ST-05). Función pura (RN-ST-07):
 * - turnos dados: inicio en el período, cualquier estado;
 * - ocupación: minutos que ocupan agenda / minutos de atención descontando bloqueos;
 * - ausentismo: AUSENTE / (ATENDIDO + AUSENTE);
 * - cancelaciones: CANCELADO / turnos dados.
 * Cada proporción es null ("Sin datos") si su denominador es 0.
 */
export function calcularIndicadores(
  turnos: readonly TurnoEstadistica[],
  franjas: readonly FranjaEstadistica[],
  bloqueos: readonly BloqueoEstadistica[],
  periodo: Periodo,
): Indicadores {
  const delPeriodo = turnosDelPeriodo(turnos, periodo);
  const contar = (estado: TurnoEstadistica["estado"]) => delPeriodo.filter((t) => t.estado === estado).length;
  const atendidos = contar("ATENDIDO");
  const ausentes = contar("AUSENTE");
  const cancelados = contar("CANCELADO");
  const ocupados = minutosOcupados(delPeriodo, periodo);
  const atencion = minutosDeAtencion(franjas, bloqueos, periodo);
  return {
    turnosDados: delPeriodo.length,
    atendidos,
    ausentes,
    cancelados,
    minutosOcupados: ocupados,
    minutosDeAtencion: atencion,
    ocupacion: proporcion(ocupados, atencion),
    ausentismo: proporcion(ausentes, atendidos + ausentes),
    cancelaciones: proporcion(cancelados, delPeriodo.length),
  };
}
