import "server-only";
import { crearControlDeAcceso } from "./acceso";
import { obtenerUsuarioActual } from "./sesion";

/**
 * Uso en TODA Server Action (knowledge-base/07 §Flujo 2):
 *
 *   const usuario = await requireRol(["ADMIN", "RECEPCION"]);
 *
 * Lanza ErrorDeAcceso ("No autenticado" / "Sin permisos"). Envolvé la acción con
 * `try/catch` y devolvé `fallo(error.message)`, o usá `conAcceso` de src/server/resultado.ts.
 */
export const { requireSesion, requireRol, requirePermiso } = crearControlDeAcceso(obtenerUsuarioActual);

export { ErrorDeAcceso, MENSAJE_NO_AUTENTICADO, MENSAJE_SIN_PERMISOS, type UsuarioSesion } from "./acceso";
export { puede, ETIQUETA_ROL, type Permiso } from "./matriz";
export { obtenerUsuarioActual, leerSesion } from "./sesion";
