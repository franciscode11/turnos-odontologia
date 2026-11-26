"use server";

import { redirect } from "next/navigation";
import { esquemaActivacion } from "@/domain/shared/contrasena";
import { prisma } from "@/server/db";
import { MENSAJE_INVITACION_INVALIDA } from "./mensajes";
import { crearClienteSupabase } from "./supabase";

export type EstadoActivacion = { error?: string; campos?: { nombre?: string; contrasena?: string } };

/** Activa una cuenta invitada: nombre + contraseña (10 caracteres y un número) y pasa a ACTIVO. */
export async function activarCuenta(_previo: EstadoActivacion, datos: FormData): Promise<EstadoActivacion> {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return { error: MENSAJE_INVITACION_INVALIDA };

  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { estado: true } });
  if (!usuario || usuario.estado !== "INVITADO") return { error: MENSAJE_INVITACION_INVALIDA };

  const entrada = esquemaActivacion.safeParse({ nombre: datos.get("nombre"), contrasena: datos.get("contrasena") });
  if (!entrada.success) {
    const errores = entrada.error.flatten().fieldErrors;
    return {
      error: "Revisá los datos marcados.",
      campos: { nombre: errores.nombre?.[0], contrasena: errores.contrasena?.join(" · ") },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: entrada.data.contrasena });
  if (error) return { error: "No pudimos guardar la contraseña. Probá de nuevo." };

  await prisma.usuario.update({
    where: { id },
    data: { nombre: entrada.data.nombre, estado: "ACTIVO", ultimoIngreso: new Date() },
  });
  redirect("/turnos");
}
