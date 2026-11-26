import type { Rol } from "@/generated/prisma/enums";
import { MENSAJES } from "@/domain/horarios/constantes";
import { validarBloqueo, instanteDeFechaHoraLocal } from "@/domain/horarios/bloqueos";
import { calcularDisponibilidadPorFranja, mensajeSinDisponibilidad, unirInicios } from "@/domain/horarios/disponibilidad";
import {
  erroresDeCampo,
  esquemaBloqueo,
  esquemaConsultaDisponibilidad,
  esquemaFranja,
  esquemaId,
  type DatosBloqueo,
} from "@/domain/horarios/esquemas";
import { validarFranja, validarFranjaContraExistentes } from "@/domain/horarios/franjas";
import { diaSemanaIso, rangoDelDia } from "@/domain/shared/fechas";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";
import { RestriccionDeBloqueo, type BloqueoGuardado, type DependenciasHorarios, type FranjaGuardada, type ResultadoDisponibilidad } from "./tipos";

/** Ruta que se revalida después de cada escritura. */
export const RUTA_HORARIOS = "/configuracion/horarios";

/** RN-HO-06: solo ADMIN carga franjas y bloqueos; todos los roles consultan disponibilidad. */
export const ROLES_EDICION = ["ADMIN"] as const satisfies readonly Rol[];
export const ROLES_CONSULTA = ["ADMIN", "RECEPCION", "PROFESIONAL"] as const satisfies readonly Rol[];

/** Error de negocio que corta una transacción sin escribir nada. */
class RechazoDeNegocio extends Error {
  constructor(readonly resultado: Resultado<never>) {
    super(resultado.ok ? "" : resultado.error);
  }
}

/** Rechazo con errores por campo: el mensaje general es el primero de los campos. */
function rechazoPorCampos(campos: Record<string, string[]>): Resultado<never> {
  const primero = Object.values(campos).find((m) => m.length > 0)?.[0];
  return fallo(primero ?? MENSAJES.datosInvalidos, campos);
}

/** Separa `{ id, datos }` de una edición; devuelve null si falta el id. */
function separarEdicion(entrada: unknown): { id: string; datos: unknown } | null {
  const { id, datos } = (entrada ?? {}) as { id?: unknown; datos?: unknown };
  const parseo = esquemaId.safeParse({ id });
  return parseo.success ? { id: parseo.data.id, datos } : null;
}

function aBloqueo(datos: DatosBloqueo) {
  // El esquema ya validó el formato: los instantes no son null.
  return {
    profesionalId: datos.profesionalId,
    desde: instanteDeFechaHoraLocal(datos.desde) as Date,
    hasta: instanteDeFechaHoraLocal(datos.hasta) as Date,
    motivo: datos.motivo,
  };
}

/**
 * Lógica de las Server Actions de C-04 con dependencias inyectadas (knowledge-base/07 §Flujo 2):
 * sesión → rol → Zod → carga → dominio → escritura → revalidatePath.
 * Los archivos "use server" (franjas.ts, bloqueos.ts, disponibilidad.ts) la conectan con
 * requireRol, Prisma y revalidatePath reales; los tests, con dobles en memoria.
 */
export function crearAccionesHorarios({ requireRol, repo, revalidar }: DependenciasHorarios) {
  async function guardarFranja(entrada: unknown, idEnEdicion?: string): Promise<Resultado<FranjaGuardada>> {
    const parseo = esquemaFranja.safeParse(entrada);
    if (!parseo.success) return rechazoPorCampos(erroresDeCampo(parseo.error));
    const datos = parseo.data;
    const errores = validarFranja(datos);
    if (errores) return rechazoPorCampos(errores);

    try {
      const guardada = await repo.enTransaccion(async (tx) => {
        const profesional = await tx.buscarProfesional(datos.profesionalId);
        if (!profesional) throw new RechazoDeNegocio(rechazoPorCampos({ profesionalId: [MENSAJES.profesionalInexistente] }));
        if (idEnEdicion !== undefined && !(await tx.buscarFranja(idEnEdicion))) throw new RechazoDeNegocio(fallo(MENSAJES.franjaInexistente));
        const existentes = await tx.franjasDelDia(datos.profesionalId, datos.diaSemana);
        const choque = validarFranjaContraExistentes(datos, existentes, idEnEdicion);
        if (choque) throw new RechazoDeNegocio(fallo(choque, { horaDesde: [choque] }));
        return idEnEdicion === undefined ? tx.crearFranja(datos) : tx.actualizarFranja(idEnEdicion, datos);
      });
      revalidar(RUTA_HORARIOS);
      return exito(guardada);
    } catch (error) {
      if (error instanceof RechazoDeNegocio) return error.resultado;
      throw error;
    }
  }

  async function guardarBloqueo(entrada: unknown, idEnEdicion?: string): Promise<Resultado<BloqueoGuardado>> {
    const parseo = esquemaBloqueo.safeParse(entrada);
    if (!parseo.success) return rechazoPorCampos(erroresDeCampo(parseo.error));
    const bloqueo = aBloqueo(parseo.data);
    const errores = validarBloqueo(bloqueo);
    if (errores) return rechazoPorCampos(errores);

    const profesional = await repo.buscarProfesional(bloqueo.profesionalId);
    if (!profesional) return rechazoPorCampos({ profesionalId: [MENSAJES.profesionalInexistente] });
    if (idEnEdicion !== undefined && !(await repo.buscarBloqueo(idEnEdicion))) return fallo(MENSAJES.bloqueoInexistente);

    // D4: un bloqueo nunca modifica ni cancela turnos existentes.
    try {
      const guardado = idEnEdicion === undefined ? await repo.crearBloqueo(bloqueo) : await repo.actualizarBloqueo(idEnEdicion, bloqueo);
      revalidar(RUTA_HORARIOS);
      return exito(guardado);
    } catch (error) {
      if (!(error instanceof RestriccionDeBloqueo)) throw error;
      return rechazoPorCampos({ [error.campo]: [error.campo === "motivo" ? MENSAJES.motivoObligatorio : MENSAJES.bloqueoInvertido] });
    }
  }

  return {
    /** RN-HO-01, RN-HO-02, RN-HO-06 */
    crearFranja: (entrada: unknown) =>
      conAcceso(async () => {
        await requireRol(ROLES_EDICION);
        return guardarFranja(entrada);
      }),

    /** RN-HO-01, RN-HO-02 (sin compararse consigo misma), RN-HO-06 */
    editarFranja: (entrada: unknown) =>
      conAcceso(async () => {
        await requireRol(ROLES_EDICION);
        const edicion = separarEdicion(entrada);
        if (!edicion) return fallo(MENSAJES.franjaInexistente);
        return guardarFranja(edicion.datos, edicion.id);
      }),

    /** Borrado físico (D9): la franja no tiene turnos asociados. RN-HO-06 */
    eliminarFranja: (entrada: unknown) =>
      conAcceso(async (): Promise<Resultado<{ id: string }>> => {
        await requireRol(ROLES_EDICION);
        const parseo = esquemaId.safeParse(entrada);
        if (!parseo.success) return fallo(MENSAJES.franjaInexistente);
        if (!(await repo.buscarFranja(parseo.data.id))) return fallo(MENSAJES.franjaInexistente);
        await repo.eliminarFranja(parseo.data.id);
        revalidar(RUTA_HORARIOS);
        return exito({ id: parseo.data.id });
      }),

    /** RN-HO-03, RN-GL-03, RN-HO-06 */
    crearBloqueo: (entrada: unknown) =>
      conAcceso(async () => {
        await requireRol(ROLES_EDICION);
        return guardarBloqueo(entrada);
      }),

    /** RN-HO-03, RN-HO-06 */
    editarBloqueo: (entrada: unknown) =>
      conAcceso(async () => {
        await requireRol(ROLES_EDICION);
        const edicion = separarEdicion(entrada);
        if (!edicion) return fallo(MENSAJES.bloqueoInexistente);
        return guardarBloqueo(edicion.datos, edicion.id);
      }),

    /** Borrado físico (D9). RN-HO-06 */
    eliminarBloqueo: (entrada: unknown) =>
      conAcceso(async (): Promise<Resultado<{ id: string }>> => {
        await requireRol(ROLES_EDICION);
        const parseo = esquemaId.safeParse(entrada);
        if (!parseo.success) return fallo(MENSAJES.bloqueoInexistente);
        if (!(await repo.buscarBloqueo(parseo.data.id))) return fallo(MENSAJES.bloqueoInexistente);
        await repo.eliminarBloqueo(parseo.data.id);
        revalidar(RUTA_HORARIOS);
        return exito({ id: parseo.data.id });
      }),

    /** RN-HO-04, RN-HO-05, RN-TU-04, RN-CA-02, RN-CA-05, RN-HO-06. Solo lectura: no revalida. */
    consultarDisponibilidad: (entrada: unknown) =>
      conAcceso(async (): Promise<Resultado<ResultadoDisponibilidad>> => {
        await requireRol(ROLES_CONSULTA);
        const parseo = esquemaConsultaDisponibilidad.safeParse(entrada);
        if (!parseo.success) return rechazoPorCampos(erroresDeCampo(parseo.error));
        const { profesionalId, fecha, duracion } = parseo.data;
        const profesional = await repo.buscarProfesional(profesionalId);
        if (!profesional?.activo) return fallo(MENSAJES.profesionalInactivo, { profesionalId: [MENSAJES.profesionalInactivo] });

        const dia = rangoDelDia(fecha);
        const [franjas, bloqueos, turnos] = await Promise.all([
          repo.franjasDelDia(profesionalId, diaSemanaIso(fecha)),
          repo.bloqueosEnRango(profesionalId, dia.inicio, dia.fin),
          repo.turnosQueOcupanEnRango(profesionalId, dia.inicio, dia.fin),
        ]);
        const grupos = calcularDisponibilidadPorFranja(franjas, bloqueos, turnos, fecha, duracion);
        const inicios = unirInicios(grupos);
        return exito({ profesionalId, fecha, duracion, inicios, grupos, mensajeVacio: mensajeSinDisponibilidad(franjas, fecha, inicios) });
      }),
  };
}

export type AccionesHorarios = ReturnType<typeof crearAccionesHorarios>;
