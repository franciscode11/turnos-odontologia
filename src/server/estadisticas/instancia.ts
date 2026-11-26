import "server-only";
import type { Periodo } from "@/domain/estadisticas/periodos";
import { requireRol } from "@/server/auth";
import { crearConsultaEstadisticas } from "./consulta";
import { repositorioPrisma } from "./repositorio";

/**
 * Estadísticas del período con la sesión real y Prisma (RN-ST-01). La llama solo el
 * Server Component de /estadisticas; el período ya viene validado por `resolverPeriodo`.
 */
export function consultarEstadisticas(periodo: Periodo, profesional: string | string[] | undefined) {
  return crearConsultaEstadisticas({ requireRol, repo: repositorioPrisma() }).consultar(periodo, profesional);
}
