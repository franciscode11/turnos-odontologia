import { CuerpoPagina, Esqueleto } from "@/components/ui";

/** Esqueleto mientras se calculan las estadísticas: indicadores, gráfico, barras y tabla. */
export default function CargandoEstadisticas() {
  return (
    <CuerpoPagina>
      <Esqueleto alto={104} />
      <div className="grid g-21" style={{ marginTop: 24 }}>
        <Esqueleto alto={280} />
        <div className="stack" style={{ gap: 24 }}>
          <Esqueleto alto={128} />
          <Esqueleto alto={128} />
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Esqueleto alto={200} />
      </div>
    </CuerpoPagina>
  );
}
