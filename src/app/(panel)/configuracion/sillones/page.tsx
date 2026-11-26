import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Sillones" };

// Placeholder del C-01. Lo reemplaza el C-03.
export default async function PaginaConfiguracionSillones() {
  const { permitido } = await accesoPagina("sillones.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Sillones" descripcion="Sillones disponibles para los turnos." change="C-03" icono="armchair" />;
}
