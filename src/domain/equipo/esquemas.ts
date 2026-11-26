import { z } from "zod";
import { MENSAJES_EQUIPO as M } from "./mensajes";
import { ROLES_EQUIPO } from "./tipos";

/** Email normalizado: sin espacios y en minúsculas (RN-EQ-02). */
export const esquemaEmail = z.string(M.emailInvalido).trim().toLowerCase().pipe(z.email(M.emailInvalido));

export const esquemaRol = z.enum(ROLES_EQUIPO, M.rolInvalido);

/** Profesional opcional: "" o ausente → null. */
const esquemaProfesionalOpcional = z
  .union([z.uuid(M.profesionalInvalido), z.literal(""), z.null()])
  .optional()
  .transform((valor) => valor || null);

type ConVinculo = { rol: (typeof ROLES_EQUIPO)[number]; profesionalId: string | null };

/** RN-EQ-03: PROFESIONAL exige vínculo. */
function exigirVinculo(datos: ConVinculo, ctx: z.RefinementCtx) {
  if (datos.rol === "PROFESIONAL" && !datos.profesionalId) {
    ctx.addIssue({ code: "custom", path: ["profesionalId"], message: M.profesionalObligatorio });
  }
}

/** Los roles que no son PROFESIONAL no llevan vínculo (CHECK del esquema de base). */
function limpiarVinculo<T extends ConVinculo>(datos: T): T {
  return { ...datos, profesionalId: datos.rol === "PROFESIONAL" ? datos.profesionalId : null };
}

/** Invitación: `{ email, rol, profesionalId? }`. Mismo esquema en el formulario y en el servidor. */
export const esquemaInvitacion = z
  .object({ email: esquemaEmail, rol: esquemaRol, profesionalId: esquemaProfesionalOpcional })
  .superRefine(exigirVinculo)
  .transform(limpiarVinculo);

export type FormularioInvitacion = z.input<typeof esquemaInvitacion>;
export type DatosInvitacion = z.output<typeof esquemaInvitacion>;

/** Cambio de rol: `{ usuarioId, rol, profesionalId? }`. */
export const esquemaCambioRol = z
  .object({ usuarioId: z.uuid(M.usuarioNoExiste), rol: esquemaRol, profesionalId: esquemaProfesionalOpcional })
  .superRefine(exigirVinculo)
  .transform(limpiarVinculo);

export type FormularioCambioRol = z.input<typeof esquemaCambioRol>;
export type DatosCambioRol = z.output<typeof esquemaCambioRol>;

/** Acciones sobre un usuario: `{ usuarioId }`. */
export const esquemaUsuarioId = z.object({ usuarioId: z.uuid(M.usuarioNoExiste) });

/** Errores de Zod por campo, para mostrarlos en el formulario. */
export function erroresPorCampo(error: z.ZodError): Record<string, string[]> {
  const campos: Record<string, string[]> = {};
  for (const [campo, mensajes] of Object.entries(z.flattenError(error).fieldErrors)) {
    if (Array.isArray(mensajes) && mensajes.length > 0) campos[campo] = mensajes;
  }
  return campos;
}
