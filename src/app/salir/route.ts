import { NextResponse, type NextRequest } from "next/server";
import { crearClienteSupabase } from "@/server/auth/supabase";

/**
 * Cierra la sesión de un usuario autenticado en Supabase que no está ACTIVO
 * (o no tiene fila en la tabla usuario) y lo manda al login con el aviso (RN-AU-05).
 * Un Server Component no puede borrar cookies: por eso el layout redirige acá.
 */
export async function GET(request: NextRequest) {
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();
  const destino = new URL("/login", request.url);
  if (request.nextUrl.searchParams.get("motivo") === "inactivo") destino.searchParams.set("error", "inactivo");
  return NextResponse.redirect(destino);
}
