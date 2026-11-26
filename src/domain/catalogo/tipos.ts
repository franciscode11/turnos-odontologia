/** Datos del catálogo tal como los usan las acciones y las pantallas (sin tipos de Prisma). */

export type Profesional = {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string | null;
  /** Archivo de public/avatars (puede faltar: se muestra un ícono). */
  avatar?: string | null;
  activo: boolean;
};

export type Prestacion = {
  id: string;
  nombre: string;
  duracionMinutos: number;
  precioReferencia: number | null;
  activo: boolean;
};

export type Sillon = {
  id: string;
  nombre: string;
  activo: boolean;
};
