/** Resultado estándar de toda Server Action (knowledge-base/07 §Flujo 2). */
export type Resultado<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; campos?: Record<string, string[]> };

export function exito<T>(data: T): Resultado<T> {
  return { ok: true, data };
}

export function fallo(error: string, campos?: Record<string, string[]>): Resultado<never> {
  return campos ? { ok: false, error, campos } : { ok: false, error };
}

/**
 * Envuelve una Server Action: si requireRol/requireSesion lanzan ErrorDeAcceso,
 * devuelve `fallo("No autenticado" | "Sin permisos")` en lugar de romper.
 * Cualquier otro error se propaga (lo muestra el error boundary).
 */
export async function conAcceso<T>(accion: () => Promise<Resultado<T>>): Promise<Resultado<T>> {
  try {
    return await accion();
  } catch (error) {
    if (error instanceof Error && error.name === "ErrorDeAcceso") return fallo(error.message);
    throw error;
  }
}
