"use client";

import { useEffect, useRef, useState } from "react";

/** Tiempos de reacción del design system (tokens.css). */
export const DEMORA_SPINNER_MS = 150;
export const MINIMO_SPINNER_MS = 400;

/**
 * Devuelve si hay que mostrar el indicador de carga: aparece solo si `cargando`
 * dura más de 150 ms y, una vez visible, se mantiene al menos 400 ms.
 */
export function useCargandoVisible(cargando: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const desde = useRef<number | null>(null);

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    if (cargando) {
      temporizador = setTimeout(() => {
        desde.current = Date.now();
        setVisible(true);
      }, DEMORA_SPINNER_MS);
    } else if (desde.current !== null) {
      const restante = Math.max(0, MINIMO_SPINNER_MS - (Date.now() - desde.current));
      temporizador = setTimeout(() => {
        desde.current = null;
        setVisible(false);
      }, restante);
    }
    return () => clearTimeout(temporizador);
  }, [cargando]);

  return visible;
}
