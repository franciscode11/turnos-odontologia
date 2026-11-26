import { redirect } from "next/navigation";

/** Inicio del panel: lleva a la agenda del día (spec agenda-del-dia). */
export default function InicioPanel() {
  redirect("/turnos");
}
