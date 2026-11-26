import type { Rol } from "@/generated/prisma/enums";
import { periodoAnterior, rangoUtc, type Periodo } from "@/domain/estadisticas/periodos";
import { armarReporte, resolverProfesional, type DatosEstadisticas, type ProfesionalEstadistica, type Reporte } from "@/domain/estadisticas/reporte";
import type { UsuarioSesion } from "@/server/auth/acceso";
import { conAcceso, exito, type Resultado } from "@/server/resultado";

/** RN-ST-01: solo ADMIN ve estadísticas (coincide con `estadisticas.ver` de la matriz). */
export const ROLES_ESTADISTICAS = ["ADMIN"] as const satisfies readonly Rol[];

/** Lecturas que necesita el cálculo (solo lectura, RN-ST-07). */
export type RepositorioEstadisticas = {
  /** Turnos con inicio en [inicio, fin), franjas, bloqueos que se superponen, profesionales y prestaciones. */
  leerDatos: (rango: { inicio: Date; fin: Date }) => Promise<DatosEstadisticas>;
};

export type DependenciasEstadisticas = {
  /** `requireRol` de src/server/auth: lanza ErrorDeAcceso ("No autenticado" / "Sin permisos"). */
  requireRol: (roles: readonly Rol[]) => Promise<UsuarioSesion>;
  repo: RepositorioEstadisticas;
};

export type ResultadoEstadisticas = { reporte: Reporte; profesionales: ProfesionalEstadistica[] };

/**
 * Consulta de estadísticas inyectable (design D6). Primero la sesión y el rol; recién
 * después lee una sola vez el período actual más el anterior y arma el reporte con el dominio.
 */
export function crearConsultaEstadisticas({ requireRol, repo }: DependenciasEstadisticas) {
  return {
    consultar(periodo: Periodo, profesional: string | string[] | undefined): Promise<Resultado<ResultadoEstadisticas>> {
      return conAcceso(async () => {
        await requireRol(ROLES_ESTADISTICAS);
        const rango = { inicio: rangoUtc(periodoAnterior(periodo)).inicio, fin: rangoUtc(periodo).fin };
        const datos = await repo.leerDatos(rango);
        const reporte = armarReporte(datos, periodo, resolverProfesional(profesional, datos.profesionales));
        const profesionales = datos.profesionales.filter((p) => p.activo || reporte.profesionales.some((f) => f.profesional.id === p.id));
        return exito({ reporte, profesionales });
      });
    },
  };
}
