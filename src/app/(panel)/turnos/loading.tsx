import { CuerpoPagina, Esqueleto } from "@/components/ui";

/** Esqueleto mientras carga la agenda (spec agenda-del-dia, "Carga lenta"). */
export default function CargandoAgenda() {
  return (
    <CuerpoPagina>
      <div className="stack" style={{ gap: 12 }}>
        <Esqueleto alto={28} ancho={220} />
        <Esqueleto alto={420} />
      </div>
    </CuerpoPagina>
  );
}
