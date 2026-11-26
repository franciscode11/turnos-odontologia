import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiToast } from "@/components/ui";
import type { Resultado } from "@/server/resultado";

/**
 * Muestra el resultado de una Server Action en el formulario: errores por campo (mismo texto
 * que el esquema del dominio) y un toast. Devuelve true si la acción salió bien.
 */
export function aplicarResultado<T extends FieldValues, D>(
  resultado: Resultado<D>,
  toast: ApiToast,
  setError: UseFormSetError<T>,
  campos: readonly Path<T>[],
  exito: string,
): boolean {
  if (resultado.ok) {
    toast.exito(exito);
    return true;
  }
  for (const [campo, mensajes] of Object.entries(resultado.campos ?? {})) {
    const nombre = campos.find((c) => c === campo);
    if (nombre && mensajes[0]) setError(nombre, { type: "server", message: mensajes[0] });
  }
  toast.error(resultado.error);
  return false;
}
