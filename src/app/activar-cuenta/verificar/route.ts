import { NextResponse, type NextRequest } from "next/server";
import { crearClienteSupabase } from "@/server/auth/supabase";

/**
 * Destino del enlace de invitación. La plantilla de email de Supabase (la configura C-07)
 * apunta a: {{ .SiteURL }}/activar-cuenta/verificar?token_hash={{ .TokenHash }}&type=invite
 * Verifica el token, crea la sesión y lleva a /activar-cuenta para definir la contraseña.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tipo = request.nextUrl.searchParams.get("type");
  const destino = new URL("/activar-cuenta", request.url);

  if (!tokenHash || tipo !== "invite") {
    destino.searchParams.set("error", "invalida");
    return NextResponse.redirect(destino);
  }

  const supabase = await crearClienteSupabase();
  const { error } = await supabase.auth.verifyOtp({ type: "invite", token_hash: tokenHash });
  if (error) destino.searchParams.set("error", "invalida");
  return NextResponse.redirect(destino);
}
