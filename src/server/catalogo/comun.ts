import { z } from "zod";
import type { Rol } from "@/generated/prisma/enums";
import type { UsuarioSesion } from "@/server/auth/acceso";
import { fallo, type Resultado } from "@/server/resultado";

/** Dependencias que reciben las fábricas de acciones del catálogo (design.md D2). */
export type DependenciasCatalogo<R> = {
  requireRol: (roles: readonly Rol[]) => Promise<UsuarioSesion>;
  repositorio: R;
  /** Se llama después de cada escritura exitosa (en producción: revalidatePath). */
  alCambiar: () => void;
};

/** RN-CA-06: solo ADMIN modifica el catálogo. */
export const ROLES_EDICION_CATALOGO = ["ADMIN"] as const satisfies readonly Rol[];

export const MENSAJE_DATOS_INVALIDOS = "Revisá los datos del formulario";

export function falloDeValidacion(error: z.ZodError): Resultado<never> {
  const campos: Record<string, string[]> = {};
  for (const [campo, mensajes] of Object.entries(z.flattenError(error).fieldErrors)) {
    if (Array.isArray(mensajes) && mensajes.length > 0) campos[campo] = mensajes;
  }
  return fallo(MENSAJE_DATOS_INVALIDOS, campos);
}

export const esquemaId = z.uuid("Identificador inválido");
export const esquemaActivo = z.boolean("Valor de activo inválido");

/** Error de índice único de Prisma (dos altas que compiten, design.md D3). */
export function esErrorDeUnicidad(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
