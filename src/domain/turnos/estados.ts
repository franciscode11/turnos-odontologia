import { esEstadoFinal, type EstadoTurno } from "@/domain/shared/estados";
import type { Rol } from "@/generated/prisma/enums";

const DESTINOS = ["CONFIRMADO", "CANCELADO", "ATENDIDO", "AUSENTE"] as const satisfies readonly EstadoTurno[];
export type DestinoTurno = (typeof DESTINOS)[number];

type TurnoConEstado = { estado: EstadoTurno; inicio: Date };

export const MOTIVO_CANCELACION_REQUERIDO = "Ingresá el motivo de la cancelación.";

export function transicionValida(actual: EstadoTurno, destino: EstadoTurno): boolean {
  if (esEstadoFinal(actual) || destino === "RESERVADO") return false;
  return destino !== "CONFIRMADO" || actual === "RESERVADO";
}

function impedimento(
  turno: TurnoConEstado,
  destino: DestinoTurno,
  rol: Rol,
  esPropio: boolean,
  ahora: Date,
): string | null {
  const esAsistencia = destino === "ATENDIDO" || destino === "AUSENTE";
  const autorizado = rol === "ADMIN" || (esAsistencia ? rol === "PROFESIONAL" && esPropio : rol === "RECEPCION");
  if (!autorizado) return "Sin permisos";
  if (esEstadoFinal(turno.estado)) return "El turno está en un estado final.";
  if (!transicionValida(turno.estado, destino)) return "El cambio de estado no está disponible para este turno.";
  if (esAsistencia && turno.inicio > ahora) return "El turno todavía no empezó.";
  return null;
}

export function accionesDisponibles(turno: TurnoConEstado, rol: Rol, esPropio: boolean, ahora: Date): DestinoTurno[] {
  return DESTINOS.filter((destino) => impedimento(turno, destino, rol, esPropio, ahora) === null);
}

export function validarTransicion(
  turno: TurnoConEstado,
  destino: DestinoTurno,
  rol: Rol,
  esPropio: boolean,
  ahora: Date,
  motivo?: string,
): string | null {
  const error = impedimento(turno, destino, rol, esPropio, ahora);
  if (error) return error;
  return destino === "CANCELADO" && !motivo?.trim() ? MOTIVO_CANCELACION_REQUERIDO : null;
}
