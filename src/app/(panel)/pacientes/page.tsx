import type { Metadata } from "next";
import { puede } from "@/server/auth/matriz";
import { accesoPagina } from "@/server/auth/pagina";
import { buscarPacientes } from "@/server/pacientes/acciones";
import { SinPermiso } from "../_shell/sin-permiso";
import { ListaPacientes } from "./lista-pacientes";

export const metadata: Metadata = { title: "Pacientes" };

export default async function PaginaPacientes() {
  const { permitido, usuario } = await accesoPagina("pacientes.ver");
  if (!permitido) return <SinPermiso />;
  const inicial = await buscarPacientes({ consulta: "", pagina: 1 });
  return <ListaPacientes inicial={inicial} puedeEditar={puede(usuario.rol, "pacientes.editar")} />;
}
