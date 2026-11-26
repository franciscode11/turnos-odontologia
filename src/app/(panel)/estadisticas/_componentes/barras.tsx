import { EstadoVacio, Tarjeta } from "@/components/ui";
import { formatearCantidad } from "@/domain/estadisticas/formato";

type Fila = { clave: string; etiqueta: string; cantidad: number };

/** Tarjeta con barras horizontales (.bar-row del design system): motivos de cancelación y prestaciones. */
export function TarjetaBarras({ titulo, filas, vacio }: { titulo: string; filas: Fila[]; vacio: string }) {
  const total = filas.reduce((s, f) => s + f.cantidad, 0);
  const maximo = Math.max(1, ...filas.map((f) => f.cantidad));
  return (
    <Tarjeta
      titulo={titulo}
      acciones={total > 0 ? <span className="subtle num" style={{ fontSize: 12 }}>{formatearCantidad(total)} en total</span> : null}
    >
      {filas.length === 0 ? (
        <EstadoVacio icono="inbox" titulo={vacio} />
      ) : (
        filas.map((f, i) => (
          <div key={f.clave} className="bar-row">
            <span title={f.etiqueta} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.etiqueta}</span>
            <span>
              <span className={i < 3 ? "bar" : "bar soft"} style={{ width: `${Math.max(2, (f.cantidad / maximo) * 100)}%`, display: "block" }} />
            </span>
            <span className="v">{formatearCantidad(f.cantidad)}</span>
          </div>
        ))
      )}
    </Tarjeta>
  );
}
