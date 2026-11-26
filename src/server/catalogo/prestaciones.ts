import { esquemaPrestacion, type DatosPrestacion } from "@/domain/catalogo/esquemas";
import type { Prestacion } from "@/domain/catalogo/tipos";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";
import {
  esquemaActivo,
  esquemaId,
  falloDeValidacion,
  ROLES_EDICION_CATALOGO,
  type DependenciasCatalogo,
} from "./comun";

export type RepositorioPrestaciones = {
  crear(datos: DatosPrestacion): Promise<Prestacion>;
  actualizar(id: string, datos: DatosPrestacion): Promise<Prestacion | null>;
  cambiarActivo(id: string, activo: boolean): Promise<Prestacion | null>;
};

const NO_EXISTE = "La prestación no existe";

/**
 * Acciones de prestaciones con el Flujo 2 (knowledge-base/07): sesión → rol → Zod → escritura.
 * La regla de duración (RN-CA-02) la aplica el esquema con `validarDuracion` del dominio.
 */
export function crearAccionesPrestaciones({ requireRol, repositorio, alCambiar }: DependenciasCatalogo<RepositorioPrestaciones>) {
  return {
    crear(entrada: unknown): Promise<Resultado<Prestacion>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const datos = esquemaPrestacion.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        const creada = await repositorio.crear(datos.data);
        alCambiar();
        return exito(creada);
      });
    },

    editar(id: unknown, entrada: unknown): Promise<Resultado<Prestacion>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const idValido = esquemaId.safeParse(id);
        if (!idValido.success) return fallo(NO_EXISTE);
        const datos = esquemaPrestacion.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        const actualizada = await repositorio.actualizar(idValido.data, datos.data);
        if (!actualizada) return fallo(NO_EXISTE);
        alCambiar();
        return exito(actualizada);
      });
    },

    /** RN-CA-04: desactivar o reactivar; nunca se borra. */
    cambiarActivo(id: unknown, activo: unknown): Promise<Resultado<Prestacion>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const idValido = esquemaId.safeParse(id);
        const activoValido = esquemaActivo.safeParse(activo);
        if (!idValido.success || !activoValido.success) return fallo(NO_EXISTE);
        const actualizada = await repositorio.cambiarActivo(idValido.data, activoValido.data);
        if (!actualizada) return fallo(NO_EXISTE);
        alCambiar();
        return exito(actualizada);
      });
    },
  };
}
