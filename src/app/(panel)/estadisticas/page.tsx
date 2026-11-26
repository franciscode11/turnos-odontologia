import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../_shell/pagina-pendiente";
import { SinPermiso } from "../_shell/sin-permiso";

export const metadata: Metadata = { title: "Estadísticas" };

// Placeholder del C-01. Lo reemplaza el C-08.
export default async function PaginaEstadisticas() {
  const { permitido } = await accesoPagina("estadisticas.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Estadísticas" descripcion="Ocupación, ausentismo y cancelaciones del consultorio." change="C-08" icono="chart-bar" />;
}
