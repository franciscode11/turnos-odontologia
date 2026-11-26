import { aInstante } from "@/domain/shared/fechas";
import type { EstadoTurno } from "@/domain/shared/estados";
import type { BloqueoEstadistica, FranjaEstadistica, TurnoEstadistica } from "@/domain/estadisticas/tipos";

// Datos ficticios para los tests de estadísticas (RN-GL-01). Fechas fijas en hora de Argentina.
export const CORTEZ = "prof-cortez";
export const DE_CONINCK = "prof-de-coninck";
export const CONSULTA = "prest-consulta";
export const LIMPIEZA = "prest-limpieza";

let secuencia = 0;

export function turno(
  fecha: string,
  hora: string,
  minutos: number,
  estado: EstadoTurno,
  extra: Partial<Omit<TurnoEstadistica, "inicio" | "fin" | "estado">> = {},
): TurnoEstadistica {
  const inicio = aInstante(fecha, hora);
  secuencia += 1;
  return {
    id: `t-${secuencia}`,
    inicio,
    fin: new Date(inicio.getTime() + minutos * 60_000),
    estado,
    profesionalId: CORTEZ,
    prestacionId: CONSULTA,
    motivoCancelacion: estado === "CANCELADO" ? "Paciente avisó" : null,
    ...extra,
  };
}

/** n turnos de 30 minutos en el estado dado, uno por hora desde las 08:00 del día. */
export function varios(n: number, estado: EstadoTurno, fecha = "2026-11-23", extra: Partial<TurnoEstadistica> = {}): TurnoEstadistica[] {
  return Array.from({ length: n }, (_, i) => {
    const h = 8 + (i % 12);
    return turno(sumarFecha(fecha, Math.floor(i / 12)), `${String(h).padStart(2, "0")}:00`, 30, estado, extra);
  });
}

function sumarFecha(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

export function franja(diaSemana: number, horaDesde: string, horaHasta: string, profesionalId = CORTEZ): FranjaEstadistica {
  return { profesionalId, diaSemana, horaDesde, horaHasta };
}

export function bloqueo(fecha: string, desde: string, hasta: string, profesionalId = CORTEZ): BloqueoEstadistica {
  return { profesionalId, desde: aInstante(fecha, desde), hasta: aInstante(fecha, hasta) };
}
