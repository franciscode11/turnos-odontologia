import type { Rol } from "@/generated/prisma/enums";
import { erroresPorCampo, esquemaCambioRol, esquemaInvitacion, esquemaUsuarioId } from "@/domain/equipo/esquemas";
import { MENSAJES_EQUIPO as M } from "@/domain/equipo/mensajes";
import {
  validarCambioRol,
  validarDesactivacion,
  validarInvitacion,
  validarInvitacionPendiente,
  validarReactivacion,
} from "@/domain/equipo/reglas";
import type { ErrorRegla, UsuarioEquipo } from "@/domain/equipo/tipos";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";
import type { DependenciasEquipo, ResumenUsuario } from "./tipos";

/** RN-EQ-01: solo ADMIN gestiona el equipo. */
export const ROLES_EQUIPO_GESTION = ["ADMIN"] as const satisfies readonly Rol[];

/** Ruta donde se ve el equipo (se revalida después de cada escritura). */
export const RUTA_EQUIPO = "/equipo";

/** Ruta del enlace de la invitación (Route Handler de C-01). */
export const RUTA_VERIFICAR_INVITACION = "/activar-cuenta/verificar";

function falloDeRegla(error: ErrorRegla): Resultado<never> {
  return error.campo ? fallo(error.mensaje, { [error.campo]: [error.mensaje] }) : fallo(error.mensaje);
}

function falloDeValidacion(campos: Record<string, string[]>): Resultado<never> {
  const primero = Object.values(campos)[0]?.[0];
  return fallo(primero ?? M.datosInvalidos, campos);
}

/** Error de índice único de Prisma (P2002) y el campo involucrado, si lo informa. */
function campoUnicoViolado(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "P2002") return null;
  const meta = "meta" in error ? (error.meta as { target?: unknown } | undefined) : undefined;
  return JSON.stringify(meta?.target ?? "").includes("email") ? "email" : "profesional";
}

function resumen(usuario: UsuarioEquipo): ResumenUsuario {
  return { id: usuario.id, email: usuario.email };
}

/**
 * Lógica de las Server Actions de equipo con dependencias inyectadas (knowledge-base/07 §Flujo 2):
 * sesión → rol ADMIN → Zod → carga → regla de dominio → escritura → revalidar.
 * `acciones.ts` ("use server") la conecta con requireRol, Prisma y Supabase reales.
 */
export function crearAccionesEquipo(dependencias: DependenciasEquipo) {
  const { requireRol, repo, auth, origen, revalidar } = dependencias;
  const ahora = dependencias.ahora ?? (() => new Date());
  const registrarError = dependencias.registrarError ?? (() => undefined);

  /** Valida `{ usuarioId }` y carga el usuario; devuelve un fallo si no existe. */
  async function cargarObjetivo(entrada: unknown): Promise<UsuarioEquipo | Resultado<never>> {
    const parseo = esquemaUsuarioId.safeParse(entrada);
    if (!parseo.success) return fallo(M.usuarioNoExiste);
    return (await repo.buscarPorId(parseo.data.usuarioId)) ?? fallo(M.usuarioNoExiste);
  }

  function esFallo(valor: UsuarioEquipo | Resultado<never>): valor is Resultado<never> {
    return "ok" in valor;
  }

  async function enlace(): Promise<string> {
    return `${(await origen()).replace(/\/+$/, "")}${RUTA_VERIFICAR_INVITACION}`;
  }

  return {
    /** RN-EQ-02, RN-EQ-03, RN-AU-01: invita y deja al usuario INVITADO (design D1). */
    invitar(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        const admin = await requireRol(ROLES_EQUIPO_GESTION);
        const parseo = esquemaInvitacion.safeParse(entrada);
        if (!parseo.success) return falloDeValidacion(erroresPorCampo(parseo.error));
        const datos = parseo.data;

        const [existente, profesional] = await Promise.all([
          repo.buscarPorEmail(datos.email),
          datos.profesionalId ? repo.buscarProfesional(datos.profesionalId) : Promise.resolve(null),
        ]);
        const error = validarInvitacion(datos, { existente, profesional });
        if (error) return falloDeRegla(error);

        const invitacion = await auth.invitar(datos.email, await enlace());
        if (!invitacion.ok) {
          if (invitacion.motivo === "ya-registrado") return fallo(M.emailRegistradoEnAuth);
          registrarError("Supabase rechazó la invitación", invitacion.detalle);
          return fallo(M.envioFallido);
        }

        try {
          const creado = await repo.crearInvitado({
            id: invitacion.id,
            email: datos.email,
            rol: datos.rol,
            profesionalId: datos.profesionalId,
            invitadoPorId: admin.id,
            invitadoEn: ahora(),
          });
          revalidar();
          return exito(resumen(creado));
        } catch (errorGuardado) {
          // Compensación: sin fila en la tabla, el usuario de Auth no debe quedar.
          const borrado = await auth.eliminar(invitacion.id);
          if (!borrado.ok) registrarError("No se pudo compensar la invitación en Supabase Auth", borrado.detalle);
          const campo = campoUnicoViolado(errorGuardado);
          if (campo === "email") return falloDeRegla({ mensaje: M.emailEnUso(datos.email), campo: "email" });
          if (campo === "profesional") return falloDeRegla({ mensaje: M.profesionalOcupado, campo: "profesionalId" });
          registrarError("No se pudo guardar la invitación", errorGuardado);
          return fallo(M.guardadoFallido);
        }
      });
    },

    /** RN-EQ-04: vuelve a mandar el email y renueva el plazo (design D6). */
    reenviar(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        const admin = await requireRol(ROLES_EQUIPO_GESTION);
        const objetivo = await cargarObjetivo(entrada);
        if (esFallo(objetivo)) return objetivo;
        const error = validarInvitacionPendiente(objetivo);
        if (error) return falloDeRegla(error);

        const invitacion = await auth.invitar(objetivo.email, await enlace());
        if (!invitacion.ok) {
          if (invitacion.motivo === "ya-registrado") return fallo(M.yaAbrioEnlace);
          registrarError("Supabase rechazó el reenvío", invitacion.detalle);
          return fallo(M.envioFallido);
        }
        if (invitacion.id !== objetivo.id) {
          registrarError("El reenvío devolvió otro id de Auth", { esperado: objetivo.id, recibido: invitacion.id });
          return fallo(M.envioFallido);
        }
        await repo.renovarInvitacion(objetivo.id, admin.id, ahora());
        revalidar();
        return exito(resumen(objetivo));
      });
    },

    /** Borra una invitación pendiente: primero Auth, después la fila (design D7). */
    revocar(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EQUIPO_GESTION);
        const objetivo = await cargarObjetivo(entrada);
        if (esFallo(objetivo)) return objetivo;
        const error = validarInvitacionPendiente(objetivo);
        if (error) return falloDeRegla(error);

        const borrado = await auth.eliminar(objetivo.id);
        if (!borrado.ok) {
          registrarError("Supabase no pudo borrar el usuario invitado", borrado.detalle);
          return fallo(M.revocacionFallida);
        }
        await repo.eliminar(objetivo.id);
        revalidar();
        return exito(resumen(objetivo));
      });
    },

    /** RN-EQ-06, RN-EQ-03, RN-AU-02. */
    cambiarRol(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EQUIPO_GESTION);
        const parseo = esquemaCambioRol.safeParse(entrada);
        if (!parseo.success) return falloDeValidacion(erroresPorCampo(parseo.error));
        const { usuarioId, rol, profesionalId } = parseo.data;

        const objetivo = await repo.buscarPorId(usuarioId);
        if (!objetivo) return fallo(M.usuarioNoExiste);
        const [adminsActivos, profesional] = await Promise.all([
          repo.contarAdminsActivos(),
          profesionalId ? repo.buscarProfesional(profesionalId) : Promise.resolve(null),
        ]);
        const error = validarCambioRol({ objetivo, rol, profesionalId, adminsActivos, profesional });
        if (error) return falloDeRegla(error);

        try {
          const actualizado = await repo.cambiarRol(usuarioId, rol, profesionalId);
          revalidar();
          return exito(resumen(actualizado));
        } catch (errorGuardado) {
          if (campoUnicoViolado(errorGuardado)) return falloDeRegla({ mensaje: M.profesionalOcupado, campo: "profesionalId" });
          throw errorGuardado;
        }
      });
    },

    /** RN-EQ-06, RN-EQ-07, RN-AU-05: pasa a INACTIVO sin borrar nada. */
    desactivar(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        const admin = await requireRol(ROLES_EQUIPO_GESTION);
        const objetivo = await cargarObjetivo(entrada);
        if (esFallo(objetivo)) return objetivo;
        const error = validarDesactivacion({ objetivo, actorId: admin.id, adminsActivos: await repo.contarAdminsActivos() });
        if (error) return falloDeRegla(error);
        const actualizado = await repo.cambiarEstado(objetivo.id, "INACTIVO");
        revalidar();
        return exito(resumen(actualizado));
      });
    },

    /** Vuelve a ACTIVO a un usuario desactivado, con su mismo rol. */
    reactivar(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
      return conAcceso(async () => {
        await requireRol(ROLES_EQUIPO_GESTION);
        const objetivo = await cargarObjetivo(entrada);
        if (esFallo(objetivo)) return objetivo;
        const error = validarReactivacion(objetivo);
        if (error) return falloDeRegla(error);
        const actualizado = await repo.cambiarEstado(objetivo.id, "ACTIVO");
        revalidar();
        return exito(resumen(actualizado));
      });
    },
  };
}

export type AccionesEquipo = ReturnType<typeof crearAccionesEquipo>;
