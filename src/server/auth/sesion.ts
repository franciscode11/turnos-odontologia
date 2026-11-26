import "server-only";
import { cache } from "react";
import { prisma } from "@/server/db";
import { crearClienteSupabase } from "./supabase";
import type { UsuarioSesion } from "./acceso";

export type EstadoSesion =
  | { tipo: "sin-sesion" }
  | { tipo: "inactivo" }
  | { tipo: "activo"; usuario: UsuarioSesion };

/**
 * Lee la sesión verificada (getClaims valida la firma del JWT) y carga el Usuario.
 * El rol sale SIEMPRE de la tabla usuario, nunca de user_metadata (RN-AU-02).
 * Solo un usuario ACTIVO opera (RN-AU-05). Se memoriza por request.
 */
export const leerSesion = cache(async (): Promise<EstadoSesion> => {
  const supabase = await crearClienteSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (error || !id) return { tipo: "sin-sesion" };

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, email: true, nombre: true, rol: true, estado: true, profesionalId: true, avatar: true },
  });
  if (!usuario || usuario.estado !== "ACTIVO") return { tipo: "inactivo" };

  return {
    tipo: "activo",
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      profesionalId: usuario.profesionalId,
      avatar: usuario.avatar,
    },
  };
});

export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  const sesion = await leerSesion();
  return sesion.tipo === "activo" ? sesion.usuario : null;
}
