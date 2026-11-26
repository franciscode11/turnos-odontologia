"use client";

import "./estilos/interactivos.css";
import { useRef, type KeyboardEvent } from "react";
import { cn } from "./cn";

export type OpcionSegmento<V extends string> = { valor: V; etiqueta: string };

export type ControlSegmentadoProps<V extends string> = {
  opciones: ReadonlyArray<OpcionSegmento<V>>;
  valor: V;
  alCambiar: (valor: V) => void;
  /** Nombre del grupo para lectores de pantalla (obligatorio: no tiene etiqueta visible). */
  etiqueta: string;
  disabled?: boolean;
  className?: string;
};

/** Control segmentado (Día / Semana / Mes). Botones con `aria-pressed`; flechas izquierda/derecha cambian la opción. */
export function ControlSegmentado<V extends string>({ opciones, valor, alCambiar, etiqueta, disabled, className }: ControlSegmentadoProps<V>) {
  const grupo = useRef<HTMLDivElement>(null);
  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = opciones.findIndex((o) => o.valor === valor);
    const siguiente = opciones[(i + (e.key === "ArrowRight" ? 1 : -1) + opciones.length) % opciones.length];
    if (!siguiente) return;
    alCambiar(siguiente.valor);
    grupo.current?.querySelector<HTMLButtonElement>(`[data-valor="${siguiente.valor}"]`)?.focus();
  };
  return (
    <div ref={grupo} className={cn("segmented", className)} role="group" aria-label={etiqueta} onKeyDown={alTeclear}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          data-valor={o.valor}
          aria-pressed={o.valor === valor}
          tabIndex={o.valor === valor ? 0 : -1}
          disabled={disabled}
          onClick={() => alCambiar(o.valor)}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
