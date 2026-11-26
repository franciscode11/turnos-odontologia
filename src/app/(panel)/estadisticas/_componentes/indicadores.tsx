import { formatearVariacion, type IndicadorComparable, type Variacion } from "@/domain/estadisticas/comparacion";
import { formatearCantidad, formatearPorcentaje } from "@/domain/estadisticas/formato";
import type { Reporte } from "@/domain/estadisticas/reporte";

const TARJETAS: ReadonlyArray<{ clave: IndicadorComparable; etiqueta: string }> = [
  { clave: "turnosDados", etiqueta: "Turnos dados" },
  { clave: "ocupacion", etiqueta: "Ocupación de agenda" },
  { clave: "ausentismo", etiqueta: "Ausentismo" },
  { clave: "cancelaciones", etiqueta: "Cancelaciones" },
];

function claseVariacion(variacion: Variacion): string | undefined {
  if (!variacion || variacion.favorable === null) return undefined;
  return variacion.favorable ? "up" : "down";
}

/** Las cuatro tarjetas de indicadores con su variación contra el período anterior (RN-ST-02 a RN-ST-06). */
export function Indicadores({ reporte }: { reporte: Reporte }) {
  const { actual, variaciones, comparadoCon } = reporte;
  const valor = (clave: IndicadorComparable) => (clave === "turnosDados" ? formatearCantidad(actual.turnosDados) : formatearPorcentaje(actual[clave]));
  return (
    <div className="kpis">
      {TARJETAS.map(({ clave, etiqueta }) => (
        <div key={clave} className="kpi">
          <div className="k-label">{etiqueta}</div>
          <div className="k-value">{valor(clave)}</div>
          <div className="k-delta">
            <span className={claseVariacion(variaciones[clave])}>{formatearVariacion(variaciones[clave])}</span> vs. {comparadoCon}
          </div>
        </div>
      ))}
    </div>
  );
}
