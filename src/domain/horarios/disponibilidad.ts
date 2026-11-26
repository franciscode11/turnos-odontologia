import { ocupaAgenda, type EstadoTurno } from "@/domain/shared/estados";
import { aInstante, diaSemanaIso } from "@/domain/shared/fechas";
import { seSuperponen, type Intervalo } from "@/domain/shared/intervalos";
import { MENSAJES, PASO_MINUTOS } from "./constantes";
import { etiquetaRango } from "./horas";

/** Tipos de entrada propios del módulo: no dependen de los tipos generados de Prisma. */
export type FranjaHoraria = { diaSemana: number; horaDesde: string; horaHasta: string };
export type BloqueoOcupacion = { desde: Date; hasta: Date };
export type TurnoOcupacion = { inicio: Date; fin: Date; estado: EstadoTurno };

export type DisponibilidadDeFranja = { etiqueta: string; inicios: Date[] };

const MINUTO = 60_000;

/** Franjas del día de la semana de la fecha (calendario de Argentina, RN-GL-03), ordenadas por hora. */
function franjasDelDia(franjas: readonly FranjaHoraria[], fecha: string): FranjaHoraria[] {
  const dia = diaSemanaIso(fecha);
  return franjas.filter((f) => f.diaSemana === dia).sort((a, b) => a.horaDesde.localeCompare(b.horaDesde));
}

/** RN-HO-04: true si el profesional tiene al menos una franja el día de la semana de la fecha. */
export function atiendeEseDia(franjas: readonly FranjaHoraria[], fecha: string): boolean {
  return franjasDelDia(franjas, fecha).length > 0;
}

/**
 * Inicios libres agrupados por franja (RN-HO-04, RN-HO-05, RN-TU-04):
 * 1. franjas del día ISO de la fecha;
 * 2. inicios cada PASO_MINUTOS desde la hora desde, con inicio + duración ≤ hora hasta de esa misma franja (D11);
 * 3. descarta los que se superponen con un bloqueo o con un turno que ocupa agenda (RN-TU-01).
 * No conoce la hora actual (D3) ni el sillón (IN-05, P-04).
 */
export function calcularDisponibilidadPorFranja(
  franjas: readonly FranjaHoraria[],
  bloqueos: readonly BloqueoOcupacion[],
  turnos: readonly TurnoOcupacion[],
  fecha: string,
  duracion: number,
): DisponibilidadDeFranja[] {
  if (!(duracion > 0)) return [];
  const ocupados: Intervalo[] = [
    ...bloqueos.map((b) => ({ inicio: b.desde, fin: b.hasta })),
    ...turnos.filter((t) => ocupaAgenda(t.estado)).map((t) => ({ inicio: t.inicio, fin: t.fin })),
  ];

  return franjasDelDia(franjas, fecha).map((franja) => {
    const desde = aInstante(fecha, franja.horaDesde).getTime();
    const hasta = aInstante(fecha, franja.horaHasta).getTime();
    const inicios: Date[] = [];
    for (let t = desde; t + duracion * MINUTO <= hasta; t += PASO_MINUTOS * MINUTO) {
      const candidato: Intervalo = { inicio: new Date(t), fin: new Date(t + duracion * MINUTO) };
      if (!ocupados.some((o) => seSuperponen(candidato, o))) inicios.push(candidato.inicio);
    }
    return { etiqueta: etiquetaRango(franja.horaDesde, franja.horaHasta), inicios };
  });
}

/** Lista de inicios libres, ordenada y sin repetidos (Flujo 4 de knowledge-base/07). */
export function calcularDisponibilidad(
  franjas: readonly FranjaHoraria[],
  bloqueos: readonly BloqueoOcupacion[],
  turnos: readonly TurnoOcupacion[],
  fecha: string,
  duracion: number,
): Date[] {
  return unirInicios(calcularDisponibilidadPorFranja(franjas, bloqueos, turnos, fecha, duracion));
}

/** Une los inicios de todas las franjas: ordenados y sin repetidos. */
export function unirInicios(grupos: readonly DisponibilidadDeFranja[]): Date[] {
  const unicos = new Map<number, Date>();
  for (const grupo of grupos) for (const inicio of grupo.inicios) unicos.set(inicio.getTime(), inicio);
  return [...unicos.values()].sort((a, b) => a.getTime() - b.getTime());
}

/** Texto del estado vacío, o null si hay inicios. */
export function mensajeSinDisponibilidad(franjas: readonly FranjaHoraria[], fecha: string, inicios: readonly Date[]): string | null {
  if (inicios.length > 0) return null;
  return atiendeEseDia(franjas, fecha) ? MENSAJES.sinHorarios : MENSAJES.noAtiende;
}
