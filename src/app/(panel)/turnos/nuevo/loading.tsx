import { CuerpoPagina, EncabezadoPagina, Esqueleto, Tarjeta } from "@/components/ui";

export default function CargandoNuevoTurno() {
  return (
    <>
      <EncabezadoPagina titulo="Nuevo turno" />
      <CuerpoPagina>
        <Tarjeta className="max-w-3xl">
          <div role="status" aria-label="Cargando datos para reservar">
            <Esqueleto alto={300} />
          </div>
        </Tarjeta>
      </CuerpoPagina>
    </>
  );
}
