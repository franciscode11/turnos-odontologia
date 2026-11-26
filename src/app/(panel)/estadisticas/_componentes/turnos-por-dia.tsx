import { Tarjeta } from "@/components/ui";
import type { TurnosDelDia } from "@/domain/estadisticas/desgloses";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;

/** "2026-11-23" → "23 nov". */
function diaCorto(fecha: string): string {
  const [, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  return `${dia} ${MESES[mes - 1]}`;
}

/** Hasta 4 fechas repartidas para el eje (primera, intermedias y última). */
function marcasDelEje(dias: readonly TurnosDelDia[]): string[] {
  if (dias.length <= 4) return dias.map((d) => diaCorto(d.fecha));
  const indices = [0, Math.round((dias.length - 1) / 3), Math.round(((dias.length - 1) * 2) / 3), dias.length - 1];
  return indices.map((i) => diaCorto(dias[i]!.fecha));
}

/** Barras apiladas por día (atendidos abajo, ausentes arriba), con HTML/CSS y tokens: sin librerías de gráficos. */
export function TurnosPorDia({ dias }: { dias: TurnosDelDia[] }) {
  const maximo = Math.max(1, ...dias.map((d) => d.atendidos + d.ausentes));
  const descripcion = (d: TurnosDelDia) => `${diaCorto(d.fecha)}: ${d.atendidos} atendidos, ${d.ausentes} ausentes`;
  return (
    <Tarjeta
      titulo="Turnos por día"
      acciones={
        <div className="legend">
          <span><i style={{ background: "var(--color-accent-600)" }} />Atendidos</span>
          <span><i style={{ background: "var(--estado-ausente-fg)" }} />Ausentes</span>
        </div>
      }
    >
      <div role="img" aria-label="Turnos atendidos y ausentes por día del período" style={{ display: "flex", alignItems: "flex-end", gap: dias.length > 40 ? 1 : 3, height: 200 }}>
        {dias.map((d) => (
          <div key={d.fecha} title={descripcion(d)} style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column-reverse" }}>
            <div style={{ height: `${(d.atendidos / maximo) * 100}%`, background: "var(--color-accent-600)", borderRadius: 2 }} />
            <div style={{ height: `${(d.ausentes / maximo) * 100}%`, background: "var(--estado-ausente-fg)", borderRadius: 2, marginBottom: d.ausentes && d.atendidos ? 1 : 0 }} />
          </div>
        ))}
      </div>
      <div className="chart-axis">
        {marcasDelEje(dias).map((m, i) => (
          <span key={`${m}-${i}`}>{m}</span>
        ))}
      </div>
      <ul className="sr-only">
        {dias.map((d) => (
          <li key={d.fecha}>{descripcion(d)}</li>
        ))}
      </ul>
    </Tarjeta>
  );
}
