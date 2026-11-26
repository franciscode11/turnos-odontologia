import { CuerpoPagina, Esqueleto } from "@/components/ui";

/** Esqueleto mientras cargan franjas, bloqueos y disponibilidad. */
export default function CargandoHorarios() {
  return (
    <CuerpoPagina>
      <div className="grid g-21">
        <div className="stack" style={{ gap: 24 }}>
          <Esqueleto alto={360} />
          <Esqueleto alto={180} />
        </div>
        <Esqueleto alto={420} />
      </div>
    </CuerpoPagina>
  );
}
