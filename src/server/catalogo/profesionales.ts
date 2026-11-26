import { esquemaProfesional, type DatosProfesional } from "@/domain/catalogo/esquemas";
import { validarMatriculaUnica } from "@/domain/catalogo/reglas";
import type { Profesional } from "@/domain/catalogo/tipos";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";
import {
  esErrorDeUnicidad,
  esquemaActivo,
  esquemaId,
  falloDeValidacion,
  ROLES_EDICION_CATALOGO,
  type DependenciasCatalogo,
} from "./comun";

export type RepositorioProfesionales = {
  /** Profesionales (activos o no) cuya matrícula coincide sin distinguir mayúsculas. */
  buscarPorMatricula(matricula: string): Promise<{ id: string; matricula: string }[]>;
  crear(datos: DatosProfesional): Promise<Profesional>;
  actualizar(id: string, datos: DatosProfesional): Promise<Profesional | null>;
  cambiarActivo(id: string, activo: boolean): Promise<Profesional | null>;
};

const NO_EXISTE = "El profesional no existe";

function falloMatricula(mensaje: string): Resultado<never> {
  return fallo(mensaje, { matricula: [mensaje] });
}

export function crearAccionesProfesionales({ requireRol, repositorio, alCambiar }: DependenciasCatalogo<RepositorioProfesionales>) {
  async function guardar(datos: DatosProfesional, idEditado?: string): Promise<Resultado<Profesional>> {
    const repetida = validarMatriculaUnica(datos.matricula, await repositorio.buscarPorMatricula(datos.matricula), idEditado);
    if (repetida) return falloMatricula(repetida);
    try {
      const guardado = idEditado ? await repositorio.actualizar(idEditado, datos) : await repositorio.crear(datos);
      if (!guardado) return fallo(NO_EXISTE);
      alCambiar();
      return exito(guardado);
    } catch (error) {
      if (esErrorDeUnicidad(error)) return falloMatricula(`Ya existe un profesional con la matrícula ${datos.matricula}`);
      throw error;
    }
  }

  return {
    crear(entrada: unknown): Promise<Resultado<Profesional>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const datos = esquemaProfesional.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        return guardar(datos.data);
      });
    },

    editar(id: unknown, entrada: unknown): Promise<Resultado<Profesional>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EDICION_CATALOGO);
        const idValido = esquemaId.safeParse(id);
        if (!idValido.success) return fallo(NO_EXISTE);
        const datos = esquemaProfesional.safeParse(entrada);
        if (!datos.success) return falloDeValidacion(datos.error);
        return guardar(datos.data, idValido.data);
      });
    },

    cambiarActivo(id: unknown, activo: unknown): Promise<Resultado<Profesional>> {
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
