import { MENSAJES_EQUIPO as M } from "./mensajes";
import type { ErrorRegla, EstadoUsuario, ProfesionalVinculable, Rol, UsuarioEquipo } from "./tipos";

/** RN-EQ-04: la invitación vence a los 7 días desde `invitadoEn`. */
export const DIAS_VENCIMIENTO_INVITACION = 7;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function vencimientoInvitacion(invitadoEn: Date): Date {
  return new Date(invitadoEn.getTime() + DIAS_VENCIMIENTO_INVITACION * MS_POR_DIA);
}

/** Vencida a partir del instante exacto de los 7 días (RN-EQ-04). Sin fecha (seed) no vence. */
export function estaVencida(invitadoEn: Date | null, ahora: Date): boolean {
  return invitadoEn !== null && ahora.getTime() >= vencimientoInvitacion(invitadoEn).getTime();
}

/** RN-EQ-03: vínculo con un profesional existente y libre (o que ya es del mismo usuario). */
function validarVinculo(profesionalId: string | null, profesional: ProfesionalVinculable | null, usuarioPropioId?: string): ErrorRegla | null {
  if (!profesionalId) return { mensaje: M.profesionalObligatorio, campo: "profesionalId" };
  if (!profesional) return { mensaje: M.profesionalNoExiste, campo: "profesionalId" };
  if (profesional.usuarioId && profesional.usuarioId !== usuarioPropioId) return { mensaje: M.profesionalOcupado, campo: "profesionalId" };
  return null;
}

type DatosInvitacion = { email: string; rol: Rol; profesionalId: string | null };

/**
 * RN-EQ-02 y RN-EQ-03. `existente` es el usuario con ese email (si hay) y `profesional`
 * el profesional elegido con su usuario vinculado.
 */
export function validarInvitacion(
  datos: DatosInvitacion,
  contexto: { existente: { estado: EstadoUsuario } | null; profesional: ProfesionalVinculable | null },
): ErrorRegla | null {
  if (contexto.existente) {
    // El email es único en la tabla: a un INACTIVO se lo reactiva, no se lo vuelve a invitar.
    const mensaje = contexto.existente.estado === "INACTIVO" ? M.emailInactivo(datos.email) : M.emailEnUso(datos.email);
    return { mensaje, campo: "email" };
  }
  return datos.rol === "PROFESIONAL" ? validarVinculo(datos.profesionalId, contexto.profesional) : null;
}

/** ¿Cuenta como ADMIN activo para RN-EQ-06? */
function esAdminActivo(usuario: UsuarioEquipo): boolean {
  return usuario.rol === "ADMIN" && usuario.estado === "ACTIVO";
}

/** RN-EQ-06, RN-EQ-03 y RN-AU-02. `adminsActivos` incluye al objetivo si es ADMIN activo. */
export function validarCambioRol(entrada: {
  objetivo: UsuarioEquipo;
  rol: Rol;
  profesionalId: string | null;
  adminsActivos: number;
  profesional: ProfesionalVinculable | null;
}): ErrorRegla | null {
  const { objetivo, rol, profesionalId, adminsActivos, profesional } = entrada;
  if (objetivo.rol === rol && objetivo.profesionalId === profesionalId) return { mensaje: M.mismoRol };
  if (esAdminActivo(objetivo) && rol !== "ADMIN" && adminsActivos <= 1) return { mensaje: M.ultimoAdmin };
  return rol === "PROFESIONAL" ? validarVinculo(profesionalId, profesional, objetivo.id) : null;
}

/** RN-EQ-06 y RN-AU-05: solo ACTIVO, nunca uno mismo ni el último ADMIN activo. */
export function validarDesactivacion(entrada: { objetivo: UsuarioEquipo; actorId: string; adminsActivos: number }): ErrorRegla | null {
  const { objetivo, actorId, adminsActivos } = entrada;
  if (objetivo.id === actorId) return { mensaje: M.desactivarseASiMismo };
  if (objetivo.estado !== "ACTIVO") return { mensaje: M.soloActivos };
  if (esAdminActivo(objetivo) && adminsActivos <= 1) return { mensaje: M.ultimoAdmin };
  return null;
}

/** Reactivar solo a un INACTIVO (RN-EQ-07: desactivar no borró nada). */
export function validarReactivacion(objetivo: UsuarioEquipo): ErrorRegla | null {
  return objetivo.estado === "INACTIVO" ? null : { mensaje: M.soloInactivos };
}

/** Reenviar o revocar solo una invitación pendiente (estado INVITADO). */
export function validarInvitacionPendiente(objetivo: UsuarioEquipo): ErrorRegla | null {
  return objetivo.estado === "INVITADO" ? null : { mensaje: M.sinInvitacionPendiente };
}
