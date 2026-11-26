"use client";

import "./estilos/interactivos.css";
import { forwardRef, useState, type KeyboardEvent } from "react";
import { cn } from "./cn";
import { Icono } from "./icono";
import type { PropsAccesibles } from "./tipos";

export type EntradaNumeroProps = PropsAccesibles & {
  valor: number | null;
  alCambiar: (valor: number | null) => void;
  min?: number;
  max?: number;
  /** Cuánto suman o restan los botones y las flechas. Por defecto 1. */
  paso?: number;
  /** Unidad para los botones accesibles ("minutos" → "Sumar 5 minutos"). */
  unidad?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

function limitar(n: number, min?: number, max?: number): number {
  let r = n;
  if (min !== undefined) r = Math.max(min, r);
  if (max !== undefined) r = Math.min(max, r);
  return r;
}

function aTexto(n: number | null): string {
  return n === null ? "" : String(n);
}

/**
 * Número con stepper − / + (reemplaza `<input type="number">`).
 * Teclado: flechas arriba/abajo suman o restan `paso`, Inicio/Fin van a min/max.
 * Los botones no son paradas de Tab: el campo central es un `spinbutton`.
 */
export const EntradaNumero = forwardRef<HTMLInputElement, EntradaNumeroProps>(function EntradaNumero(
  { valor, alCambiar, min, max, paso = 1, unidad, name, placeholder, disabled, onBlur, className, required, ...aria },
  ref,
) {
  const [texto, setTexto] = useState(aTexto(valor));
  const [valorPrevio, setValorPrevio] = useState(valor);
  if (valorPrevio !== valor) {
    // El valor cambió desde afuera (reset del formulario, botones): sincronizar el texto.
    setValorPrevio(valor);
    if (Number(texto.replace(",", ".")) !== valor || texto === "") setTexto(aTexto(valor));
  }

  const fijar = (n: number | null) => {
    const final = n === null ? null : limitar(n, min, max);
    setTexto(aTexto(final));
    alCambiar(final);
  };
  const sumar = (signo: 1 | -1) => fijar(limitar((valor ?? min ?? 0) + signo * paso, min, max));

  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); sumar(1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); sumar(-1); }
    else if (e.key === "Home" && min !== undefined) { e.preventDefault(); fijar(min); }
    else if (e.key === "End" && max !== undefined) { e.preventDefault(); fijar(max); }
  };

  const textoUnidad = unidad ? ` ${unidad}` : "";
  return (
    <div className={cn("stepper", className)}>
      <button type="button" tabIndex={-1} onClick={() => sumar(-1)} disabled={disabled || (min !== undefined && valor !== null && valor <= min)} aria-label={`Restar ${paso}${textoUnidad}`}>
        <Icono nombre="minus" />
      </button>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        {...aria}
        aria-required={required || aria["aria-required"] || undefined}
        aria-valuenow={valor ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        value={texto}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d,.-]/g, "");
          setTexto(t);
          const n = Number(t.replace(",", "."));
          if (t === "" || t === "-") alCambiar(null);
          else if (Number.isFinite(n)) alCambiar(n);
        }}
        onBlur={() => {
          if (valor !== null) fijar(valor);
          onBlur?.();
        }}
        onKeyDown={alTeclear}
      />
      <button type="button" tabIndex={-1} onClick={() => sumar(1)} disabled={disabled || (max !== undefined && valor !== null && valor >= max)} aria-label={`Sumar ${paso}${textoUnidad}`}>
        <Icono nombre="plus" />
      </button>
    </div>
  );
});
