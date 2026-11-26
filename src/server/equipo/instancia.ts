import "server-only";
import { revalidatePath } from "next/cache";
import { requireRol } from "@/server/auth";
import { crearAccionesEquipo, RUTA_EQUIPO } from "./fabrica";
import { origenDelSitio } from "./origen";
import { repositorioEquipo } from "./repositorio";
import { authAdminSupabase } from "./supabase-admin";

/** Acciones de C-07 conectadas con la sesión real, Prisma, Supabase Auth admin y revalidatePath. */
export function accionesEquipo() {
  return crearAccionesEquipo({
    requireRol,
    repo: repositorioEquipo,
    auth: authAdminSupabase,
    origen: origenDelSitio,
    revalidar: () => revalidatePath(RUTA_EQUIPO),
    registrarError: (mensaje, detalle) => console.error(`[equipo] ${mensaje}`, detalle),
  });
}
