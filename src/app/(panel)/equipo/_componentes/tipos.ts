import type { EstadoVisible } from "@/domain/equipo/presentacion";
import type { EstadoUsuario, Rol } from "@/domain/equipo/tipos";
import type { ApiToast, Opcion, OpcionRadio } from "@/components/ui";
import type { Resultado } from "@/server/resultado";

/** Fila de la tabla ya formateada en el servidor (fechas en hora de Argentina). */
export type FilaEquipo = {
  id: string;
  email: string;
  titulo: string;
  detalle: string;
  rol: Rol;
  estado: EstadoUsuario;
  estadoVisible: EstadoVisible;
  avatar: string | null;
  ultimoIngreso: string;
  profesionalId: string | null;
  esUsuarioActual: boolean;
};

export type ProfesionalVinculo = { id: string; etiqueta: string; usuarioId: string | null };

/** Opciones de rol con la descripción de la referencia (design-system/screens/equipo.html). */
export const OPCIONES_ROL: OpcionRadio[] = [
  { valor: "RECEPCION", etiqueta: "Recepción", descripcion: "Pacientes y turnos." },
  { valor: "PROFESIONAL", etiqueta: "Profesional", descripcion: "Su agenda y la asistencia de sus turnos." },
  { valor: "ADMIN", etiqueta: "Administrador", descripcion: "Todo, incluida la configuración y el equipo." },
];

/** Profesionales para el Selector: los que ya tienen otro usuario quedan deshabilitados (RN-EQ-03). */
export function opcionesProfesional(profesionales: readonly ProfesionalVinculo[], usuarioPropioId?: string): Opcion[] {
  return profesionales.map((p) => {
    const ocupado = p.usuarioId !== null && p.usuarioId !== usuarioPropioId;
    return { valor: p.id, etiqueta: p.etiqueta, deshabilitada: ocupado, meta: ocupado ? "Ya tiene usuario" : undefined };
  });
}

/** Toast según el resultado de una acción; devuelve true si salió bien. */
export function avisarResultado<T>(resultado: Resultado<T>, toast: ApiToast, titulo: string, detalle: string): boolean {
  if (resultado.ok) {
    toast.exito(titulo, detalle);
    return true;
  }
  toast.error("No se pudo completar la acción", resultado.error);
  return false;
}
