import { CuerpoPagina, EncabezadoPagina, EstadoVacio, type NombreIcono } from "@/components/ui";

/** Página provisoria del C-01: el change de cada módulo la reemplaza por la pantalla real. */
export function PaginaPendiente({ titulo, descripcion, change, icono }: { titulo: string; descripcion: string; change: string; icono: NombreIcono }) {
  return (
    <>
      <EncabezadoPagina titulo={titulo} descripcion={descripcion} />
      <CuerpoPagina>
        <EstadoVacio icono={icono} titulo={`${titulo} llega con el ${change}`} descripcion="Esta sección todavía está en construcción." />
      </CuerpoPagina>
    </>
  );
}
