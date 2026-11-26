/** Intervalo semiabierto [inicio, fin): incluye el inicio y excluye el fin. */
export type Intervalo = { inicio: Date; fin: Date };

/**
 * RN-TU-01: dos intervalos se superponen si inicioA < finB y inicioB < finA.
 * Un intervalo que empieza justo cuando termina otro NO se superpone.
 * Es la única definición de solapamiento del proyecto (la usan C-04 y C-05).
 */
export function seSuperponen(a: Intervalo, b: Intervalo): boolean {
  return a.inicio.getTime() < b.fin.getTime() && b.inicio.getTime() < a.fin.getTime();
}
