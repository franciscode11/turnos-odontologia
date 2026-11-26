import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { permisosCatalogo } from "@/server/catalogo/permisos";
import { listarPrestaciones } from "@/server/catalogo/repositorios";
import { SinPermiso } from "../../_shell/sin-permiso";
import { ListaPrestaciones } from "./lista-prestaciones";

export const metadata: Metadata = { title: "Prestaciones" };

/** /configuracion/prestaciones: todos consultan, solo ADMIN edita (RN-CA-06). */
export default async function PaginaConfiguracionPrestaciones() {
  const { usuario, permitido } = await accesoPagina("prestaciones.ver");
  if (!permitido) return <SinPermiso />;
  const prestaciones = await listarPrestaciones();
  return <ListaPrestaciones prestaciones={prestaciones} puedeEditar={permisosCatalogo(usuario.rol, "prestaciones").editar} />;
}
