import { esquemaSillon, type DatosSillon } from "@/domain/catalogo/esquemas";
import { validarNombreSillonUnico } from "@/domain/catalogo/reglas";
import type { Sillon } from "@/domain/catalogo/tipos";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";
import {
  esErrorDeUnicidad,
  esquemaActivo,
  esquemaId,
  falloDeValidacion,
  ROLES_EDICION_CATALOGO,
  type DependenciasCatalogo,
} from "./comun";

export type RepositorioSillones = {
  /** Sillones (activos o no) cuyo nombre coincide sin distinguir mayúsculas. */
  buscarPorNombre(nombre: string): Promise<{ id: string; nombre: string }[]>;
  crear(datos: DatosSillon): Promise<Sillon>;
  actualizar(id: string, datos: DatosSillon): Promise<Sillon | null>;
  cambiarActivo(id: string, activo: boolean): Promise<Sillon | null>;
};

const NO_EXISTE = "El sillón no existe";

function falloNombre(mensaje: string): Resultado<never> {
  return fallo(mensaje, { nombre: [mensaje] });
}

export function crearAccionesSillones({ requireRol, repositorio, alCambiar }: DependenciasCatalogo<RepositorioSillones>) {
  async function guardar(datos: DatosSillon, idEditado?: string): Promise<Resultado<Sillon>> {
    const repetido = validarNombreSillonUnico(datos.nombre, await repositorio.buscarPorNombre(datos.nombre), idEditado);
    if (repetido) return falloNombre(repetido);
    try {
      const guardado = idEditado ? await repositorio.actualizar(idEditado, datos) : await repositorio.crear(datos);
      if (!guardado) return fallo(NO_EXISTE);
      alCambiar();
      return exito(guardado);
    } catch (error) {
      if (esErrorDeUnicidad(error)) return falloNombre(`Ya existe un sillón con el nombre ${datos.nombre}`);
      throw error;
    }
  }

  return {
    crear(entrada: unknown): Promise<Resultado<Sillon>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const datos = esquemaSillon.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        return guardar(datos.data);
      });
    },

    editar(id: unknown, entrada: unknown): Promise<Resultado<Sillon>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const idValido = esquemaId.safeParse(id);
        if (!idValido.success) return fallo(NO_EXISTE);
        const datos = esquemaSillon.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        return guardar(datos.data, idValido.data);
      });
    },

    cambiarActivo(id: unknown, activo: unknown): Promise<Resultado<Sillon>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const idValido = esquemaId.safeParse(id);
        const activoValido = esquemaActivo.safeParse(activo);
        if (!idValido.success || !activoValido.success) return fallo(NO_EXISTE);
        const actualizado = await repositorio.cambiarActivo(idValido.data, activoValido.data);
        if (!actualizado) return fallo(NO_EXISTE);
        alCambiar();
        return exito(actualizado);
      });
    },
  };
}
