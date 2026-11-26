import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ResultadoInvitarAuth, ServicioAuthAdmin } from "./tipos";

/**
 * Cliente de administración de Supabase Auth. Usa SUPABASE_SECRET_KEY, que SOLO existe en el
 * servidor (nunca en NEXT_PUBLIC_*). Se crea en el primer uso: `next build` y los tests no lo necesitan.
 */
let cliente: SupabaseClient | null = null;

function clienteAdmin(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveSecreta = process.env.SUPABASE_SECRET_KEY;
  if (!url || !claveSecreta) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY para enviar invitaciones (pedíselas al líder).");
  }
  cliente = createClient(url, claveSecreta, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return cliente;
}

type ErrorAuth = { code?: string; status?: number; message?: string };

/** El email ya pertenece a un usuario confirmado de Auth (por ejemplo, abrió la invitación). */
function esEmailRegistrado(error: ErrorAuth): boolean {
  return error.code === "email_exists" || error.code === "user_already_exists" || /already been registered/i.test(error.message ?? "");
}

function esUsuarioInexistente(error: ErrorAuth): boolean {
  return error.code === "user_not_found" || error.status === 404;
}

export const authAdminSupabase: ServicioAuthAdmin = {
  async invitar(email, redirectTo): Promise<ResultadoInvitarAuth> {
    const { data, error } = await clienteAdmin().auth.admin.inviteUserByEmail(email, { redirectTo });
    if (error) return { ok: false, motivo: esEmailRegistrado(error) ? "ya-registrado" : "error", detalle: error.code ?? error.message };
    if (!data.user) return { ok: false, motivo: "error", detalle: "sin usuario en la respuesta" };
    return { ok: true, id: data.user.id };
  },

  async eliminar(id) {
    const { error } = await clienteAdmin().auth.admin.deleteUser(id);
    if (error && !esUsuarioInexistente(error)) return { ok: false, detalle: error.code ?? error.message };
    return { ok: true };
  },
};
