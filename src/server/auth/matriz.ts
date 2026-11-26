import type { Rol } from "@/generated/prisma/enums";

/**
 * Matriz de permisos de knowledge-base/03_actores_y_roles.md. Es la única fuente:
 * la usan requireRol/requirePermiso en el servidor y el menú del panel.
 */
export const ROLES = ["ADMIN", "RECEPCION", "PROFESIONAL"] as const satisfies readonly Rol[];

const TODOS = ROLES;
const ADMIN = ["ADMIN"] as const;
const ADMIN_Y_RECEPCION = ["ADMIN", "RECEPCION"] as const;

export const PERMISOS = {
  "equipo.gestionar": ADMIN,
  "estadisticas.ver": ADMIN,
  "pacientes.ver": TODOS,
  "pacientes.editar": ADMIN_Y_RECEPCION,
  "profesionales.ver": TODOS,
  "profesionales.editar": ADMIN,
  "prestaciones.ver": TODOS,
  "prestaciones.editar": ADMIN,
  "sillones.ver": TODOS,
  "sillones.editar": ADMIN,
  "horarios.ver": TODOS,
  "horarios.editar": ADMIN,
  "bloqueos.ver": TODOS,
  "bloqueos.editar": ADMIN,
  "disponibilidad.ver": TODOS,
  "turnos.ver": TODOS,
  "turnos.crear": ADMIN_Y_RECEPCION,
  "turnos.confirmar": ADMIN_Y_RECEPCION,
  "turnos.cancelar": ADMIN_Y_RECEPCION,
  /** El PROFESIONAL solo en sus propios turnos: lo verifica el dominio de C-06. */
  "turnos.marcarAsistencia": ["ADMIN", "PROFESIONAL"],
  "historial.ver": TODOS,
  "componentes.ver": TODOS,
} as const satisfies Record<string, readonly Rol[]>;

export type Permiso = keyof typeof PERMISOS;

export function puede(rol: Rol, permiso: Permiso): boolean {
  return (PERMISOS[permiso] as readonly Rol[]).includes(rol);
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: "Administrador",
  RECEPCION: "Recepción",
  PROFESIONAL: "Profesional",
};

export type IconoMenu =
  | "agenda"
  | "pacientes"
  | "estadisticas"
  | "profesionales"
  | "prestaciones"
  | "sillones"
  | "horarios"
  | "equipo"
  | "componentes";

export type SeccionMenu = {
  href: string;
  etiqueta: string;
  icono: IconoMenu;
  grupo: "principal" | "configuracion" | "consultorio";
  permiso: Permiso;
};

/** Secciones del menú lateral (design-system/screens/panel-turnos.html). */
export const SECCIONES_MENU: readonly SeccionMenu[] = [
  { href: "/turnos", etiqueta: "Agenda", icono: "agenda", grupo: "principal", permiso: "turnos.ver" },
  { href: "/pacientes", etiqueta: "Pacientes", icono: "pacientes", grupo: "principal", permiso: "pacientes.ver" },
  { href: "/estadisticas", etiqueta: "Estadísticas", icono: "estadisticas", grupo: "principal", permiso: "estadisticas.ver" },
  { href: "/configuracion/profesionales", etiqueta: "Profesionales", icono: "profesionales", grupo: "configuracion", permiso: "profesionales.ver" },
  { href: "/configuracion/prestaciones", etiqueta: "Prestaciones", icono: "prestaciones", grupo: "configuracion", permiso: "prestaciones.ver" },
  { href: "/configuracion/sillones", etiqueta: "Sillones", icono: "sillones", grupo: "configuracion", permiso: "sillones.ver" },
  { href: "/configuracion/horarios", etiqueta: "Horarios", icono: "horarios", grupo: "configuracion", permiso: "horarios.ver" },
  { href: "/equipo", etiqueta: "Equipo", icono: "equipo", grupo: "consultorio", permiso: "equipo.gestionar" },
];

export function seccionesParaRol(rol: Rol): SeccionMenu[] {
  return SECCIONES_MENU.filter((s) => puede(rol, s.permiso));
}
