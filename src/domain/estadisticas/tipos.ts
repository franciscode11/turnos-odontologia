import type { EstadoTurno } from "@/domain/shared/estados";

/**
 * Tipos de entrada del módulo (RN-ST-07): no dependen de los tipos generados de Prisma,
 * así el cálculo se testea sin base.
 */
export type TurnoEstadistica = {
  id: string;
  inicio: Date;
  fin: Date;
  estado: EstadoTurno;
  profesionalId: string;
  prestacionId: string;
  motivoCancelacion: string | null;
};

/** Franja semanal: diaSemana ISO (1 = lunes) y horas locales "HH:mm". */
export type FranjaEstadistica = { profesionalId: string; diaSemana: number; horaDesde: string; horaHasta: string };

export type BloqueoEstadistica = { profesionalId: string; desde: Date; hasta: Date };

/** Proporción entre 0 y 1; null = "Sin datos" (denominador 0). */
export type Proporcion = number | null;

export type Indicadores = {
  turnosDados: number;
  atendidos: number;
  ausentes: number;
  cancelados: number;
  minutosOcupados: number;
  minutosDeAtencion: number;
  ocupacion: Proporcion;
  ausentismo: Proporcion;
  cancelaciones: Proporcion;
};
