import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Profesionales" };

// Placeholder del C-01. Lo reemplaza el C-03.
export default async function PaginaConfiguracionProfesionales() {
  const { permitido } = await accesoPagina("profesionales.ver");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Profesionales" descripcion="Odontólogos del consultorio y sus matrículas." change="C-03" icono="stethoscope" />;
}
