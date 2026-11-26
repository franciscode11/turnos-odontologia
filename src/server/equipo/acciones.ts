"use server";

import type { Resultado } from "@/server/resultado";
import { accionesEquipo } from "./instancia";
import type { ResumenUsuario } from "./tipos";

// Server Actions de Equipo (C-07). Solo ADMIN (RN-EQ-01): lo verifica cada acción con requireRol.
// Reciben `unknown` a propósito: todo lo que llega del cliente pasa por el esquema Zod.

/** Entrada: `{ email, rol, profesionalId? }`. */
export async function invitarMiembro(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().invitar(entrada);
}

/** Entrada: `{ usuarioId }`. */
export async function reenviarInvitacion(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().reenviar(entrada);
}

/** Entrada: `{ usuarioId }`. */
export async function revocarInvitacion(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().revocar(entrada);
}

/** Entrada: `{ usuarioId, rol, profesionalId? }`. */
export async function cambiarRol(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().cambiarRol(entrada);
}

/** Entrada: `{ usuarioId }`. */
export async function desactivarUsuario(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().desactivar(entrada);
}

/** Entrada: `{ usuarioId }`. */
export async function reactivarUsuario(entrada: unknown): Promise<Resultado<ResumenUsuario>> {
  return accionesEquipo().reactivar(entrada);
}
