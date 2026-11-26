import type { EstadoUsuario, Rol } from "@/generated/prisma/enums";

export type { EstadoUsuario, Rol };

/** Roles que se pueden asignar desde Equipo (RN-AU-02: uno por usuario). */
export const ROLES_EQUIPO = ["ADMIN", "RECEPCION", "PROFESIONAL"] as const satisfies readonly Rol[];

/** Lo mínimo de un usuario que necesitan las reglas de equipo. */
export type UsuarioEquipo = {
  id: string;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  profesionalId: string | null;
};

/** Profesional candidato a vincular y el usuario que ya lo tiene (si hay). */
export type ProfesionalVinculable = { id: string; usuarioId: string | null };

/** Error de negocio: mensaje en español y, si corresponde, el campo del formulario. */
export type ErrorRegla = { mensaje: string; campo?: "email" | "rol" | "profesionalId" };
