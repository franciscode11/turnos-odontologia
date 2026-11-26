import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Detalle del turno" };

// Placeholder del C-01. Lo reemplaza el C-06.
export default async function PaginaTurnosDetalle() {
  const { permitido } = await accesoPagina("turnos.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Detalle del turno" descripcion="Estado, acciones e historial del turno." change="C-06" icono="file-text" />;
}
