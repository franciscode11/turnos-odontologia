import "server-only";
import { redirect } from "next/navigation";
import { puede, type Permiso } from "./matriz";
import { leerSesion } from "./sesion";
import type { UsuarioSesion } from "./acceso";

/**
 * Para Server Components de páginas del panel. Sin sesión → /login; inactivo → /salir.
 * Devuelve el usuario y si su rol tiene el permiso; si no lo tiene, la página
 * muestra <SinPermiso /> (spec autorizacion-por-rol, acceso directo a una sección).
 */
export async function accesoPagina(permiso: Permiso): Promise<{ usuario: UsuarioSesion; permitido: boolean }> {
  const sesion = await leerSesion();
  if (sesion.tipo === "sin-sesion") redirect("/login");
  if (sesion.tipo === "inactivo") redirect("/salir?motivo=inactivo");
  return { usuario: sesion.usuario, permitido: puede(sesion.usuario.rol, permiso) };
}
