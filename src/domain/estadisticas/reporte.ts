import { compararIndicadores, type IndicadorComparable, type Variacion } from "./comparacion";
import { agruparMotivos, turnosPorDia, turnosPorPrestacion, type MotivoAgrupado, type PrestacionContada, type PrestacionEstadistica, type TurnosDelDia } from "./desgloses";
import { calcularIndicadores } from "./indicadores";
import { etiquetaComparacion, etiquetaPeriodo, periodoAnterior, type Periodo } from "./periodos";
import type { BloqueoEstadistica, FranjaEstadistica, Indicadores, TurnoEstadistica } from "./tipos";

export type ProfesionalEstadistica = { id: string; nombre: string; especialidad: string | null; avatar: string | null; activo: boolean };

/** Datos crudos del período actual y del anterior (los lee src/server/estadisticas). */
export type DatosEstadisticas = {
  turnos: TurnoEstadistica[];
  franjas: FranjaEstadistica[];
  bloqueos: BloqueoEstadistica[];
  profesionales: ProfesionalEstadistica[];
  prestaciones: PrestacionEstadistica[];
};

export type FilaProfesional = { profesional: ProfesionalEstadistica; indicadores: Indicadores; prestacionMasDada: string | null };

export type Reporte = {
  periodo: Periodo;
  periodoAnterior: Periodo;
  etiqueta: string;
  comparadoCon: string;
  /** Profesional filtrado o null (todos). */
  profesionalId: string | null;
  actual: Indicadores;
  anterior: Indicadores;
  variaciones: Record<IndicadorComparable, Variacion>;
  turnosPorDia: TurnosDelDia[];
  motivos: MotivoAgrupado[];
  prestaciones: PrestacionContada[];
  profesionales: FilaProfesional[];
  /** true si el período no tiene turnos dados (estado vacío). */
  sinTurnos: boolean;
};

/** Profesional pedido por searchParams; inexistente o inválido → null (todos). */
export function resolverProfesional(valor: string | string[] | undefined, profesionales: readonly ProfesionalEstadistica[]): string | null {
  if (typeof valor !== "string") return null;
  return profesionales.some((p) => p.id === valor) ? valor : null;
}

function delProfesional<T extends { profesionalId: string }>(items: readonly T[], id: string): T[] {
  return items.filter((x) => x.profesionalId === id);
}

/**
 * Arma todo lo que muestra /estadisticas (RN-ST-02 a RN-ST-06), como función pura (RN-ST-07).
 * El filtro por profesional limita todos los indicadores; sin filtro, la tabla incluye a los
 * profesionales activos y a los inactivos con turnos en el período.
 */
export function armarReporte(datos: DatosEstadisticas, periodo: Periodo, profesionalId: string | null): Reporte {
  const filtro = profesionalId !== null && datos.profesionales.some((p) => p.id === profesionalId) ? profesionalId : null;
  const turnos = filtro ? delProfesional(datos.turnos, filtro) : datos.turnos;
  const franjas = filtro ? delProfesional(datos.franjas, filtro) : datos.franjas;
  const bloqueos = filtro ? delProfesional(datos.bloqueos, filtro) : datos.bloqueos;
  const anteriorPeriodo = periodoAnterior(periodo);

  const actual = calcularIndicadores(turnos, franjas, bloqueos, periodo);
  const anterior = calcularIndicadores(turnos, franjas, bloqueos, anteriorPeriodo);

  const profesionales = datos.profesionales
    .filter((p) => (filtro ? p.id === filtro : true))
    .map((profesional): FilaProfesional => {
      const propios = delProfesional(turnos, profesional.id);
      return {
        profesional,
        indicadores: calcularIndicadores(propios, delProfesional(franjas, profesional.id), delProfesional(bloqueos, profesional.id), periodo),
        prestacionMasDada: turnosPorPrestacion(propios, periodo, datos.prestaciones)[0]?.nombre ?? null,
      };
    })
    .filter((f) => f.profesional.activo || f.indicadores.turnosDados > 0)
    .sort((a, b) => b.indicadores.turnosDados - a.indicadores.turnosDados || a.profesional.nombre.localeCompare(b.profesional.nombre, "es"));

  return {
    periodo,
    periodoAnterior: anteriorPeriodo,
    etiqueta: etiquetaPeriodo(periodo),
    comparadoCon: etiquetaComparacion(periodo),
    profesionalId: filtro,
    actual,
    anterior,
    variaciones: compararIndicadores(actual, anterior),
    turnosPorDia: turnosPorDia(turnos, periodo),
    motivos: agruparMotivos(turnos, periodo),
    prestaciones: turnosPorPrestacion(turnos, periodo, datos.prestaciones),
    profesionales,
    sinTurnos: actual.turnosDados === 0,
  };
}
