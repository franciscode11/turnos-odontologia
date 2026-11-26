import { z } from "zod";
import { ocupaAgenda, type EstadoTurno } from "@/domain/shared/estados";
import { aInstante, esFechaValida, esHoraValida, horaLocal } from "@/domain/shared/fechas";
import { seSuperponen, type Intervalo } from "@/domain/shared/intervalos";

const MINUTO_MS = 60_000;
const PASO_HORARIOS_MINUTOS = 5;

const uuid = z.uuid("Elegí una opción válida.");
const fechaLocal = z.string().refine(esFechaValida, "Elegí una fecha válida.");

export const esquemaHorariosTurno = z.object({
  profesionalId: uuid,
  prestacionId: uuid,
  fecha: fechaLocal,
});

export const esquemaNuevoTurno = esquemaHorariosTurno.extend({
  pacienteId: uuid,
  sillonId: uuid,
  hora: z.string().refine(esHoraValida, "Elegí un horario válido."),
});

export type SolicitudTurno = z.infer<typeof esquemaNuevoTurno>;
export type ConsultaHorariosTurno = z.infer<typeof esquemaHorariosTurno>;

export const MENSAJE_PROFESIONAL_OCUPADO = "El profesional ya tiene un turno en ese horario";
export const MENSAJE_SILLON_OCUPADO = "El sillón ya está ocupado en ese horario";

const mensajesEntidades = {
  pacienteId: "Elegí un paciente activo.",
  profesionalId: "Elegí un profesional activo.",
  prestacionId: "Elegí una prestación activa.",
  sillonId: "Elegí un sillón activo.",
};

type EntidadTurno = keyof typeof mensajesEntidades;
type TurnoDelProfesional = Intervalo & { profesionalId: string; estado: EstadoTurno };
type TurnoDeAgenda = TurnoDelProfesional & { sillonId: string };

type DatosHorariosTurno = {
  ahora: Date;
  duracionMinutos: number;
  profesionalId: string;
  franjas: readonly Intervalo[];
  bloqueos: readonly Intervalo[];
  turnos: readonly TurnoDelProfesional[];
};

export type DatosValidacionTurno = Omit<DatosHorariosTurno, "turnos"> & {
  inicio: Date;
  sillonId: string;
  activos: Record<EntidadTurno, boolean>;
  turnos: readonly TurnoDeAgenda[];
};

type ValidacionTurno =
  | { ok: true; fin: Date }
  | { ok: false; error: string; campos?: Record<string, string[]> };

export function finDeTurno(inicio: Date, duracionMinutos: number): Date {
  return new Date(inicio.getTime() + duracionMinutos * MINUTO_MS);
}

export function intervalosDeAtencion(
  fecha: string,
  franjas: readonly { horaDesde: string; horaHasta: string }[],
): Intervalo[] {
  return franjas.map(({ horaDesde, horaHasta }) => ({
    inicio: aInstante(fecha, horaDesde),
    fin: aInstante(fecha, horaHasta),
  }));
}

function conflictoDeHorario(
  turno: Intervalo,
  { ahora, franjas, bloqueos }: Pick<DatosHorariosTurno, "ahora" | "franjas" | "bloqueos">,
): string | undefined {
  if (turno.inicio < ahora) return "No se puede crear un turno en el pasado.";
  if (!franjas.some(({ inicio, fin }) => turno.inicio >= inicio && turno.fin <= fin)) {
    return "El turno debe quedar dentro de una franja de atención del profesional.";
  }
  if (bloqueos.some((bloqueo) => seSuperponen(turno, bloqueo))) {
    return "El turno coincide con un bloqueo del profesional.";
  }
}

function ocupaIntervalo(turno: TurnoDelProfesional, solicitado: Intervalo): boolean {
  return ocupaAgenda(turno.estado) && seSuperponen(turno, solicitado);
}

export function validarNuevoTurno(datos: DatosValidacionTurno): ValidacionTurno {
  const campos: Record<string, string[]> = {};
  for (const campo of Object.keys(mensajesEntidades) as EntidadTurno[]) {
    if (!datos.activos[campo]) campos[campo] = [mensajesEntidades[campo]];
  }
  if (Object.keys(campos).length) return { ok: false, error: "Revisá los datos del turno.", campos };

  const { inicio, profesionalId, sillonId, turnos } = datos;
  const fin = finDeTurno(inicio, datos.duracionMinutos);
  const solicitado = { inicio, fin };
  const errorHorario = conflictoDeHorario(solicitado, datos);
  if (errorHorario) return { ok: false, error: errorHorario };

  const conflictos = turnos.filter((turno) => ocupaIntervalo(turno, solicitado));
  if (conflictos.some((turno) => turno.profesionalId === profesionalId)) {
    return { ok: false, error: MENSAJE_PROFESIONAL_OCUPADO };
  }
  if (conflictos.some((turno) => turno.sillonId === sillonId)) {
    return { ok: false, error: MENSAJE_SILLON_OCUPADO };
  }
  return { ok: true, fin };
}

export function calcularHorariosOfrecidos(datos: DatosHorariosTurno): string[] {
  const ofrecidos = new Set<string>();
  const turnosDelProfesional = datos.turnos.filter((turno) => turno.profesionalId === datos.profesionalId);

  for (const franja of datos.franjas) {
    const ultimoInicio = franja.fin.getTime() - datos.duracionMinutos * MINUTO_MS;
    for (let tiempo = franja.inicio.getTime(); tiempo <= ultimoInicio; tiempo += PASO_HORARIOS_MINUTOS * MINUTO_MS) {
      const inicio = new Date(tiempo);
      const intervalo = { inicio, fin: finDeTurno(inicio, datos.duracionMinutos) };
      if (conflictoDeHorario(intervalo, datos)) continue;
      if (turnosDelProfesional.some((turno) => ocupaIntervalo(turno, intervalo))) continue;
      ofrecidos.add(horaLocal(inicio));
    }
  }

  return [...ofrecidos].sort();
}
