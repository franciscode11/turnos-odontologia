import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { PaginaPendiente } from "../../_shell/pagina-pendiente";
import { SinPermiso } from "../../_shell/sin-permiso";

export const metadata: Metadata = { title: "Nuevo turno" };

// Placeholder del C-01. Lo reemplaza el C-05.
export default async function PaginaTurnosNuevo() {
  const { permitido } = await accesoPagina("turnos.crear");
  if (!permitido) return <SinPermiso />;
  return <PaginaPendiente titulo="Nuevo turno" descripcion="Reservá un turno sin superposiciones." change="C-05" icono="calendar-event" />;
}
