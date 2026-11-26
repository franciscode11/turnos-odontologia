import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Prestaciones" };

// Placeholder del C-01. Lo reemplaza el C-03.
export default async function PaginaConfiguracionPrestaciones() {
  const { permitido } = await accesoPagina("prestaciones.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Prestaciones" descripcion="Tratamientos con su duración." change="C-03" icono="clipboard-list" />;
}
