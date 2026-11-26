import { CuerpoPagina, EstadoVacio } from "@/components/ui";

/** Se muestra cuando el rol no tiene acceso a la sección (spec autorizacion-por-rol). */
export function SinPermiso() {
  return (
    <CuerpoPagina>
      <EstadoVacio icono="lock" titulo="No tenés permisos para ver esta sección" descripcion="Si necesitás acceso, pedíselo al administrador del consultorio." />
    </CuerpoPagina>
  );
}
