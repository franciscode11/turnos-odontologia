import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { permisosCatalogo } from "@/server/catalogo/permisos";
import { listarProfesionales } from "@/server/catalogo/repositorios";
import { SinPermiso } from "../../_shell/sin-permiso";
import { ListaProfesionales } from "./lista-profesionales";

export const metadata: Metadata = { title: "Profesionales" };

/** /configuracion/profesionales: todos consultan, solo ADMIN edita (RN-CA-06). */
export default async function PaginaConfiguracionProfesionales() {
  const { usuario, permitido } = await accesoPagina("profesionales.ver");
  if (!permitido) return <SinPermiso />;
  const profesionales = await listarProfesionales();
  return <ListaProfesionales profesionales={profesionales} puedeEditar={permisosCatalogo(usuario.rol, "profesionales").editar} />;
}
