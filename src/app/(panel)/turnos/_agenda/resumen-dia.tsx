import { ESTADOS_TURNO, ETIQUETA_ESTADO, type EstadoTurno } from "@/domain/shared/estados";

const ORDEN: readonly EstadoTurno[] = ["RESERVADO", "CONFIRMADO", "ATENDIDO", "AUSENTE", "CANCELADO"];
import type { TurnoAgenda } from "./datos";

/** Franja de totales del día por estado (los cancelados se cuentan aparte: no ocupan agenda). */
export function ResumenDia({ turnos }: { turnos: TurnoAgenda[] }) {
  const conteo = new Map<EstadoTurno, number>(ESTADOS_TURNO.map((e) => [e, 0]));
  for (const t of turnos) conteo.set(t.estado, (conteo.get(t.estado) ?? 0) + 1);
  const activos = turnos.filter((t) => t.estado !== "CANCELADO").length;
  return (
    <dl className="ag-resumen" aria-label="Resumen del día">
      <div className="ag-kpi ag-kpi-total">
        <dt>Turnos del día</dt>
        <dd className="num">{activos}</dd>
      </div>
      {ORDEN.map((estado) => (
        <div className={`ag-kpi k-${estado.toLowerCase()}`} key={estado}>
          <dt><span className="ag-punto" aria-hidden="true" />{ETIQUETA_ESTADO[estado]}</dt>
          <dd className="num">{conteo.get(estado) ?? 0}</dd>
        </div>
      ))}
    </dl>
  );
}
