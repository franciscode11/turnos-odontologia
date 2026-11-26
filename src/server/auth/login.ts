"use server";

import { redirect } from "next/navigation";
import { esquemaLogin } from "@/domain/shared/contrasena";
import { prisma } from "@/server/db";
import { MENSAJE_CREDENCIALES, MENSAJE_INACTIVO } from "./mensajes";
import { crearClienteSupabase } from "./supabase";

export type EstadoLogin = { error?: string; email?: string };


/** Inicio de sesión con email y contraseña (spec autenticacion, RN-AU-01, RN-AU-05). */
export async function iniciarSesion(_previo: EstadoLogin, datos: FormData): Promise<EstadoLogin> {
  const entrada = esquemaLogin.safeParse({ email: datos.get("email"), contrasena: datos.get("contrasena") });
  const email = typeof datos.get("email") === "string" ? String(datos.get("email")) : "";
  if (!entrada.success) return { error: MENSAJE_CREDENCIALES, email };

  const supabase = await crearClienteSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: entrada.data.email,
    password: entrada.data.contrasena,
  });
  // Mensaje genérico: no revela si el email existe.
  if (error || !data.user) return { error: MENSAJE_CREDENCIALES, email };

  const usuario = await prisma.usuario.findUnique({ where: { id: data.user.id }, select: { estado: true } });
  if (!usuario || usuario.estado !== "ACTIVO") {
    await supabase.auth.signOut();
    return { error: MENSAJE_INACTIVO, email };
  }

  await prisma.usuario.update({ where: { id: data.user.id }, data: { ultimoIngreso: new Date() } });
  redirect("/turnos");
}
