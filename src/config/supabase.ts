/** Variables públicas de Supabase (seguras en el navegador). La clave secreta NUNCA va acá. */
export function configSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clavePublica) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el .env (pedíselas al líder por privado).",
    );
  }
  return { url, clavePublica };
}
