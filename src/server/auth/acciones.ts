"use server";

import { redirect } from "next/navigation";
import { crearClienteSupabase } from "./supabase";

/** Cierra la sesión y vuelve al login (spec autenticacion, "Cierre de sesión"). */
export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
