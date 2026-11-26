import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configSupabase } from "@/config/supabase";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Usa solo la publishable key; la sesión vive en cookies (RN-AU-04).
 */
export async function crearClienteSupabase() {
  // Leer las cookies primero marca la ruta como dinámica (no se prerenderiza en el build).
  const almacen = await cookies();
  const { url, clavePublica } = configSupabase();
  return createServerClient(url, clavePublica, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(cookiesAEscribir) {
        try {
          for (const { name, value, options } of cookiesAEscribir) almacen.set(name, value, options);
        } catch {
          // En un Server Component no se pueden escribir cookies: el proxy refresca la sesión.
        }
      },
    },
  });
}
