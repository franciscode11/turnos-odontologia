/**
 * Props que `Campo` (y `FormField`) le pasan a cualquier control, para que la etiqueta,
 * la ayuda y el error queden conectados de forma accesible.
 */
export type PropsAccesibles = {
  id?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  required?: boolean;
};

/** Opción de Selector, SelectorMultiple y Combobox. */
export type Opcion = {
  valor: string;
  etiqueta: string;
  /** Texto secundario a la derecha (duración, DNI...). */
  meta?: string;
  deshabilitada?: boolean;
};

/** Grupo de opciones (equivalente a <optgroup>). */
export type GrupoOpciones = { grupo: string; opciones: Opcion[] };

export function esGrupo(item: Opcion | GrupoOpciones): item is GrupoOpciones {
  return "grupo" in item;
}

/** Aplana opciones con o sin grupos. */
export function aplanarOpciones(items: ReadonlyArray<Opcion | GrupoOpciones>): Opcion[] {
  return items.flatMap((item) => (esGrupo(item) ? item.opciones : [item]));
}

/** Normaliza para buscar sin importar mayúsculas ni tildes ("Gaitán" ~ "gaitan"). */
export function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Une referencias (ref de react-hook-form + ref interna). */
export function unirRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (nodo) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(nodo);
      else if (ref) (ref as React.RefObject<T | null>).current = nodo;
    }
  };
}
