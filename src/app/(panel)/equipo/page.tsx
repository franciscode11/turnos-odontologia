import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../_shell/pagina-pendiente";
import { SinPermiso } from "../_shell/sin-permiso";

export const metadata: Metadata = { title: "Equipo" };

// Placeholder del C-01. Lo reemplaza el C-07.
export default async function PaginaEquipo() {
  const { permitido } = await accesoPagina("equipo.gestionar");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Equipo" descripcion="Quién puede entrar al sistema y con qué rol." change="C-07" icono="user-plus" />;
}
