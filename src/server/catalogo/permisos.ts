import type { Rol } from "@/generated/prisma/enums";
import { puede } from "@/server/auth/matriz";

/** Secciones del catálogo y su permiso de consulta y edición (matriz de C-01, RN-CA-06). */
export const SECCIONES_CATALOGO = ["profesionales", "prestaciones", "sillones"] as const;

export type SeccionCatalogo = (typeof SECCIONES_CATALOGO)[number];

export function permisosCatalogo(rol: Rol, seccion: SeccionCatalogo): { ver: boolean; editar: boolean } {
  return { ver: puede(rol, `${seccion}.ver`), editar: puede(rol, `${seccion}.editar`) };
}
