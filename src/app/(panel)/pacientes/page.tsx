import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../_shell/pagina-pendiente";
import { SinPermiso } from "../_shell/sin-permiso";

export const metadata: Metadata = { title: "Pacientes" };

// Placeholder del C-01. Lo reemplaza el C-02.
export default async function PaginaPacientes() {
  const { permitido } = await accesoPagina("pacientes.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Pacientes" descripcion="Listado, búsqueda, alta y edición de pacientes." change="C-02" icono="users" />;
}
