import "server-only";
import { headers } from "next/headers";

/**
 * Origen público del sitio para el enlace de la invitación (design D3).
 * 1. NEXT_PUBLIC_SITE_URL si está configurada (no es secreta).
 * 2. Si no, el host del request (x-forwarded-* en Vercel, host en local).
 */
export async function origenDelSitio(): Promise<string> {
  const configurado = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configurado) return configurado.replace(/\/+$/, "");

  const encabezados = await headers();
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  if (!host) throw new Error("No se pudo deducir la URL del sitio: configurá NEXT_PUBLIC_SITE_URL.");
  const protocolo = encabezados.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocolo.split(",")[0]!.trim()}://${host.split(",")[0]!.trim()}`;
}
