import type { Metadata } from "next";
import { accesoPagina } from "@/server/auth/pagina";
import { permisosCatalogo } from "@/server/catalogo/permisos";
import { listarSillones } from "@/server/catalogo/repositorios";
import { SinPermiso } from "../../_shell/sin-permiso";
import { ListaSillones } from "./lista-sillones";

export const metadata: Metadata = { title: "Sillones" };

/** /configuracion/sillones: todos consultan, solo ADMIN edita (RN-CA-06). */
export default async function PaginaConfiguracionSillones() {
  const { usuario, permitido } = await accesoPagina("sillones.ver");
  if (!permitido) return <SinPermiso />;
  const sillones = await listarSillones();
  return <ListaSillones sillones={sillones} puedeEditar={permisosCatalogo(usuario.rol, "sillones").editar} />;
}
