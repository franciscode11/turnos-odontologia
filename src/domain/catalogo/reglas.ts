/**
 * Reglas del catálogo (knowledge-base/05 §RN-CA). Funciones puras: sin base ni red.
 */

export const DURACION_MINIMA = 10;
export const DURACION_MAXIMA = 240;
export const PASO_DURACION = 5;

export const MENSAJE_DURACION = "La duración debe ser múltiplo de 5 entre 10 y 240 minutos";

/** RN-CA-02: múltiplo de 5 entre 10 y 240, ambos incluidos. Devuelve el error o null. */
export function validarDuracion(minutos: number): string | null {
  const valida =
    Number.isInteger(minutos) &&
    minutos >= DURACION_MINIMA &&
    minutos <= DURACION_MAXIMA &&
    minutos % PASO_DURACION === 0;
  return valida ? null : MENSAJE_DURACION;
}

/** Forma canónica de la matrícula: sin espacios en los extremos y en mayúsculas. */
export function normalizarMatricula(matricula: string): string {
  return matricula.trim().toUpperCase();
}

function mismaClave(a: string, b: string): boolean {
  return a.trim().toLocaleUpperCase("es-AR") === b.trim().toLocaleUpperCase("es-AR");
}

/**
 * RN-CA-01: la matrícula no puede repetirse entre profesionales, activos o inactivos.
 * `idEditado` es el profesional que se está editando: su propia matrícula no cuenta.
 */
export function validarMatriculaUnica(
  matricula: string,
  existentes: readonly { id: string; matricula: string }[],
  idEditado?: string,
): string | null {
  const repetido = existentes.find((p) => p.id !== idEditado && mismaClave(p.matricula, matricula));
  return repetido ? `Ya existe un profesional con la matrícula ${repetido.matricula}` : null;
}

/** RN-CA-03: el nombre del sillón/box no puede repetirse (sin distinguir mayúsculas). */
export function validarNombreSillonUnico(
  nombre: string,
  existentes: readonly { id: string; nombre: string }[],
  idEditado?: string,
): string | null {
  const repetido = existentes.find((s) => s.id !== idEditado && mismaClave(s.nombre, nombre));
  return repetido ? `Ya existe un sillón con el nombre ${repetido.nombre}` : null;
}
