import type { Rol } from "@/generated/prisma/enums";
import { puede, type Permiso } from "./matriz";

/** Datos del usuario con sesión que necesitan las acciones y el layout. */
export type UsuarioSesion = {
  id: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  profesionalId: string | null;
  avatar: string | null;
};

export const MENSAJE_NO_AUTENTICADO = "No autenticado";
export const MENSAJE_SIN_PERMISOS = "Sin permisos";

export class ErrorDeAcceso extends Error {
  constructor(readonly codigo: "NO_AUTENTICADO" | "SIN_PERMISOS") {
    super(codigo === "NO_AUTENTICADO" ? MENSAJE_NO_AUTENTICADO : MENSAJE_SIN_PERMISOS);
    this.name = "ErrorDeAcceso";
  }
}

export type ObtenerUsuario = () => Promise<UsuarioSesion | null>;

/**
 * Crea requireRol/requirePermiso a partir de cómo se obtiene el usuario.
 * Se separa así para testear la lógica sin base ni Supabase (RN-AU-03).
 * Orden fijo: primero la sesión, después el rol.
 */
export function crearControlDeAcceso(obtenerUsuario: ObtenerUsuario) {
  async function requireSesion(): Promise<UsuarioSesion> {
    const usuario = await obtenerUsuario();
    if (!usuario) throw new ErrorDeAcceso("NO_AUTENTICADO");
    return usuario;
  }

  async function requireRol(roles: readonly Rol[]): Promise<UsuarioSesion> {
    const usuario = await requireSesion();
    if (!roles.includes(usuario.rol)) throw new ErrorDeAcceso("SIN_PERMISOS");
    return usuario;
  }

  async function requirePermiso(permiso: Permiso): Promise<UsuarioSesion> {
    const usuario = await requireSesion();
    if (!puede(usuario.rol, permiso)) throw new ErrorDeAcceso("SIN_PERMISOS");
    return usuario;
  }

  return { requireSesion, requireRol, requirePermiso };
}
