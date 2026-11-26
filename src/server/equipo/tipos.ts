import type { EstadoUsuario, Rol } from "@/generated/prisma/enums";
import type { ProfesionalVinculable, UsuarioEquipo } from "@/domain/equipo/tipos";
import type { UsuarioSesion } from "@/server/auth/acceso";

/** Persona que se muestra en la tabla de /equipo. */
export type Miembro = {
  id: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  estado: EstadoUsuario;
  avatar: string | null;
  invitadoEn: Date | null;
  ultimoIngreso: Date | null;
  profesionalId: string | null;
  profesional: string | null;
};

/** Profesional activo para el selector de vínculo (con su usuario, si ya tiene). */
export type OpcionProfesional = { id: string; etiqueta: string; usuarioId: string | null };

export type NuevaInvitacion = {
  id: string;
  email: string;
  rol: Rol;
  profesionalId: string | null;
  invitadoPorId: string;
  invitadoEn: Date;
};

/** Acceso a datos del módulo (Prisma en producción, memoria en los tests). */
export interface RepositorioEquipo {
  buscarPorEmail(email: string): Promise<UsuarioEquipo | null>;
  buscarPorId(id: string): Promise<UsuarioEquipo | null>;
  contarAdminsActivos(): Promise<number>;
  buscarProfesional(id: string): Promise<ProfesionalVinculable | null>;
  crearInvitado(datos: NuevaInvitacion): Promise<UsuarioEquipo>;
  renovarInvitacion(id: string, invitadoPorId: string, invitadoEn: Date): Promise<void>;
  cambiarRol(id: string, rol: Rol, profesionalId: string | null): Promise<UsuarioEquipo>;
  cambiarEstado(id: string, estado: EstadoUsuario): Promise<UsuarioEquipo>;
  eliminar(id: string): Promise<void>;
}

export type ResultadoInvitarAuth =
  | { ok: true; id: string }
  | { ok: false; motivo: "ya-registrado" | "error"; detalle?: string };

/** API de administración de Supabase Auth (solo servidor, clave secreta). */
export interface ServicioAuthAdmin {
  invitar(email: string, redirectTo: string): Promise<ResultadoInvitarAuth>;
  /** Un usuario que ya no existe cuenta como eliminado. */
  eliminar(id: string): Promise<{ ok: boolean; detalle?: string }>;
}

export type DependenciasEquipo = {
  requireRol: (roles: readonly Rol[]) => Promise<UsuarioSesion>;
  repo: RepositorioEquipo;
  auth: ServicioAuthAdmin;
  /** Origen del sitio (https://...) para el enlace de la invitación. */
  origen: () => Promise<string>;
  /** Se llama después de cada escritura exitosa (en producción: revalidatePath("/equipo")). */
  revalidar: () => void;
  ahora?: () => Date;
  registrarError?: (mensaje: string, detalle?: unknown) => void;
};

/** Datos que devuelven las acciones al cliente. */
export type ResumenUsuario = { id: string; email: string };
