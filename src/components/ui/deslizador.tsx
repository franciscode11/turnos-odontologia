"use client";

import "./estilos/interactivos.css";
import { forwardRef } from "react";
import { Slider } from "radix-ui";
import { cn } from "./cn";
import type { PropsAccesibles } from "./tipos";

export type DeslizadorProps = PropsAccesibles & {
  valor: number;
  alCambiar: (valor: number) => void;
  /** Se llama al soltar (para guardar una sola vez). */
  alConfirmar?: (valor: number) => void;
  min?: number;
  max?: number;
  paso?: number;
  /** Texto del valor para lectores de pantalla ("15 minutos"). */
  textoValor?: (valor: number) => string;
  /** Muestra min y max debajo. */
  mostrarEscala?: boolean;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Rango (reemplaza `<input type="range">`) con Radix Slider. Flechas suman o restan `paso`,
 * RePág/AvPág saltan más, Inicio/Fin van a los extremos. El `id` de Campo va al pulgar.
 */
export const Deslizador = forwardRef<HTMLSpanElement, DeslizadorProps>(function Deslizador(
  { valor, alCambiar, alConfirmar, min = 0, max = 100, paso = 1, textoValor, mostrarEscala, name, disabled, onBlur, className, required, id, ...aria },
  ref,
) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      <Slider.Root
        className={cn("slider ui-deslizador", className)}
        value={[valor]}
        onValueChange={([v]) => v !== undefined && alCambiar(v)}
        onValueCommit={([v]) => v !== undefined && alConfirmar?.(v)}
        min={min}
        max={max}
        step={paso}
        name={name}
        disabled={disabled}
      >
        <Slider.Track className="track">
          <Slider.Range className="fill" />
        </Slider.Track>
        <Slider.Thumb
          ref={ref}
          id={id}
          className="thumb"
          onBlur={onBlur}
          aria-required={required || undefined}
          aria-valuetext={textoValor?.(valor)}
          {...aria}
        />
      </Slider.Root>
      {mostrarEscala ? (
        <div className="slider-scale" aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      ) : null}
    </div>
  );
});
