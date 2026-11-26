import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Horarios" };

// Placeholder del C-01. Lo reemplaza el C-04.
export default async function PaginaConfiguracionHorarios() {
  const { permitido } = await accesoPagina("horarios.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Horarios" descripcion="Franjas de atención, bloqueos y disponibilidad." change="C-04" icono="clock" />;
}
