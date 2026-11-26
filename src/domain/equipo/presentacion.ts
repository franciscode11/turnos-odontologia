import { fechaLocal, formatearFecha, formatearHora, sumarDias } from "@/domain/shared/fechas";
import { estaVencida } from "./reglas";
import type { EstadoUsuario } from "./tipos";

/** Estado que se muestra en la tabla (la invitación vencida se deriva de `invitadoEn`, RN-EQ-04). */
export type EstadoVisible = "ACTIVO" | "PENDIENTE" | "VENCIDA" | "INACTIVO";

export const ETIQUETA_ESTADO_VISIBLE: Record<EstadoVisible, string> = {
  ACTIVO: "Activo",
  PENDIENTE: "Invitación pendiente",
  VENCIDA: "Invitación vencida",
  INACTIVO: "Inactivo",
};

export function estadoVisible(usuario: { estado: EstadoUsuario; invitadoEn: Date | null }, ahora: Date): EstadoVisible {
  if (usuario.estado === "ACTIVO") return "ACTIVO";
  if (usuario.estado === "INACTIVO") return "INACTIVO";
  return estaVencida(usuario.invitadoEn, ahora) ? "VENCIDA" : "PENDIENTE";
}

/** "Hoy, 08:02", "Ayer, 18:40", "20/11/2026" o "Nunca", en hora de Argentina (RN-GL-03). */
export function formatearUltimoIngreso(instante: Date | null, ahora: Date): string {
  if (!instante) return "Nunca";
  const dia = fechaLocal(instante);
  const hoy = fechaLocal(ahora);
  if (dia === hoy) return `Hoy, ${formatearHora(instante)}`;
  if (dia === sumarDias(hoy, -1)) return `Ayer, ${formatearHora(instante)}`;
  return formatearFecha(instante);
}

/** "24/11" en hora de Argentina. */
export function formatearDiaMes(instante: Date): string {
  const [, mes, dia] = fechaLocal(instante).split("-");
  return `${dia}/${mes}`;
}

const ORDEN_ESTADO: Record<EstadoUsuario, number> = { ACTIVO: 0, INVITADO: 1, INACTIVO: 2 };

/** Activos, después invitaciones, después inactivos; dentro de cada grupo por nombre (o email). */
export function ordenarMiembros<T extends { estado: EstadoUsuario; nombre: string | null; email: string }>(filas: readonly T[]): T[] {
  return [...filas].sort(
    (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] || (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email, "es"),
  );
}
