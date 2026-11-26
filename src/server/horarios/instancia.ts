import "server-only";
import { revalidatePath } from "next/cache";
import { requireRol } from "@/server/auth";
import { crearAccionesHorarios } from "./acciones";
import { repositorioPrisma } from "./repositorio";

/** Acciones de C-04 conectadas con la sesión real, Prisma y revalidatePath. */
export function accionesHorarios() {
  return crearAccionesHorarios({ requireRol, repo: repositorioPrisma(), revalidar: (ruta) => revalidatePath(ruta) });
}
