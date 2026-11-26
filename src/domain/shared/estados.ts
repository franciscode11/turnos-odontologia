/** Estados del turno (deben coincidir con el enum EstadoTurno de prisma/schema.prisma). */
export const ESTADOS_TURNO = ["RESERVADO", "CONFIRMADO", "CANCELADO", "ATENDIDO", "AUSENTE"] as const;

export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

/**
 * RN-TU-04: ocupan agenda todos los estados salvo CANCELADO.
 * Debe coincidir con el `WHERE (estado <> 'CANCELADO')` de las restricciones de exclusión.
 */
export const ESTADOS_QUE_OCUPAN_AGENDA = ["RESERVADO", "CONFIRMADO", "ATENDIDO", "AUSENTE"] as const satisfies readonly EstadoTurno[];

/** Estados desde los que no se puede pasar a otro (DD-09). */
export const ESTADOS_FINALES = ["CANCELADO", "ATENDIDO", "AUSENTE"] as const satisfies readonly EstadoTurno[];

export function ocupaAgenda(estado: EstadoTurno): boolean {
  return (ESTADOS_QUE_OCUPAN_AGENDA as readonly EstadoTurno[]).includes(estado);
}

export function esEstadoFinal(estado: EstadoTurno): boolean {
  return (ESTADOS_FINALES as readonly EstadoTurno[]).includes(estado);
}

/** Textos para la interfaz. */
export const ETIQUETA_ESTADO: Record<EstadoTurno, string> = {
  RESERVADO: "Reservado",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  ATENDIDO: "Atendido",
  AUSENTE: "Ausente",
};
