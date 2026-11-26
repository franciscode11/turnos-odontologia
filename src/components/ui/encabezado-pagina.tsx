import type { ReactNode } from "react";

/** Encabezado de 64 px de cada página del panel. */
export function EncabezadoPagina({ titulo, descripcion, acciones }: { titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-title">{titulo}</h1>
        {descripcion ? <p className="page-sub">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="row">{acciones}</div> : null}
    </header>
  );
}

export function CuerpoPagina({ children }: { children: ReactNode }) {
  return <div className="page-body">{children}</div>;
}
