import { fechaLocal } from "@/domain/shared/fechas";
import { turnosDelPeriodo } from "./indicadores";
import { fechasDelPeriodo, type Periodo } from "./periodos";
import type { TurnoEstadistica } from "./tipos";

export type TurnosDelDia = { fecha: string; atendidos: number; ausentes: number };
export type MotivoAgrupado = { motivo: string; cantidad: number };
export type PrestacionContada = { prestacionId: string; nombre: string; cantidad: number };
export type PrestacionEstadistica = { id: string; nombre: string };

export const SIN_MOTIVO = "Sin motivo";
export const PRESTACION_SIN_NOMBRE = "Prestación sin nombre";

/** Atendidos y ausentes de cada fecha del período, en hora de Argentina (RN-ST-02, RN-GL-03). */
export function turnosPorDia(turnos: readonly TurnoEstadistica[], periodo: Periodo): TurnosDelDia[] {
  const dias = new Map(fechasDelPeriodo(periodo).map((fecha) => [fecha, { fecha, atendidos: 0, ausentes: 0 }]));
  for (const t of turnosDelPeriodo(turnos, periodo)) {
    const dia = dias.get(fechaLocal(t.inicio));
    if (!dia) continue;
    if (t.estado === "ATENDIDO") dia.atendidos += 1;
    else if (t.estado === "AUSENTE") dia.ausentes += 1;
  }
  return [...dias.values()];
}

/** RN-ST-05: texto normalizado (sin espacios extra, minúsculas y sin tildes). */
export function normalizarMotivo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Ordena de mayor a menor cantidad y, ante empate, alfabéticamente. */
function porCantidad<T extends { cantidad: number }>(clave: (x: T) => string) {
  return (a: T, b: T) => b.cantidad - a.cantidad || clave(a).localeCompare(clave(b), "es");
}

/**
 * RN-ST-05: motivos de los turnos cancelados del período agrupados por texto normalizado.
 * La etiqueta es la primera forma encontrada (recortada); un motivo vacío cuenta como "Sin motivo".
 */
export function agruparMotivos(turnos: readonly TurnoEstadistica[], periodo: Periodo): MotivoAgrupado[] {
  const grupos = new Map<string, MotivoAgrupado>();
  for (const t of turnosDelPeriodo(turnos, periodo)) {
    if (t.estado !== "CANCELADO") continue;
    const original = (t.motivoCancelacion ?? "").replace(/\s+/g, " ").trim();
    const clave = normalizarMotivo(original);
    const grupo = grupos.get(clave) ?? { motivo: original || SIN_MOTIVO, cantidad: 0 };
    grupo.cantidad += 1;
    grupos.set(clave, grupo);
  }
  return [...grupos.values()].sort(porCantidad((m) => m.motivo));
}

/** Turnos dados del período por prestación (RN-ST-02), de mayor a menor. */
export function turnosPorPrestacion(
  turnos: readonly TurnoEstadistica[],
  periodo: Periodo,
  prestaciones: readonly PrestacionEstadistica[],
): PrestacionContada[] {
  const nombres = new Map(prestaciones.map((p) => [p.id, p.nombre]));
  const conteo = new Map<string, PrestacionContada>();
  for (const t of turnosDelPeriodo(turnos, periodo)) {
    const fila = conteo.get(t.prestacionId) ?? { prestacionId: t.prestacionId, nombre: nombres.get(t.prestacionId) ?? PRESTACION_SIN_NOMBRE, cantidad: 0 };
    fila.cantidad += 1;
    conteo.set(t.prestacionId, fila);
  }
  return [...conteo.values()].sort(porCantidad((p) => p.nombre));
}
