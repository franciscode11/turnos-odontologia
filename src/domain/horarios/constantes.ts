/** Paso entre inicios disponibles (RN-HO-05, suposición SU-03: cambiar a 15 no toca el modelo). */
export const PASO_MINUTOS = 5;

/** Duración de una consulta de disponibilidad: múltiplo de 5 entre 10 y 240 (RN-CA-02). */
export const DURACION_MINIMA = 10;
export const DURACION_MAXIMA = 240;
export const DURACION_PREDETERMINADA = 30;

/** Días ISO 1 = lunes ... 7 = domingo (KB 04, HorarioAtencion.diaSemana). */
export const NOMBRES_DIA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

/** Mensajes del módulo: los usan el dominio, los esquemas y las acciones (mismo texto en pantalla y servidor). */
export const MENSAJES = {
  franjaInvertida: "La hora desde debe ser anterior a la hora hasta",
  horaInvalida: "Ingresá una hora válida (HH:mm)",
  diaInvalido: "Elegí un día de la semana",
  profesionalObligatorio: "Elegí un profesional",
  bloqueoInvertido: "La fecha y hora desde debe ser anterior a la fecha y hora hasta",
  fechaHoraInvalida: "Ingresá una fecha y hora válidas",
  motivoObligatorio: "El motivo es obligatorio",
  fechaInvalida: "Ingresá una fecha válida",
  duracionInvalida: "La duración debe ser un múltiplo de 5 entre 10 y 240 minutos",
  noAtiende: "El profesional no atiende ese día",
  sinHorarios: "No hay horarios disponibles para esa duración",
  profesionalInactivo: "El profesional no está activo",
  profesionalInexistente: "El profesional no existe",
  franjaInexistente: "La franja ya no existe",
  bloqueoInexistente: "El bloqueo ya no existe",
  datosInvalidos: "Revisá los datos ingresados",
} as const;

export function franjaSuperpuesta(etiquetaExistente: string): string {
  return `La franja se superpone con otra del mismo día (${etiquetaExistente})`;
}
