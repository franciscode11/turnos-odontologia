"use client";

import "./estilos/interactivos.css";
import { forwardRef, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "./cn";
import type { PropsAccesibles } from "./tipos";

/** Paleta cerrada de la agenda (design system): 4 tonos con contraste AA, sin selector libre. */
export const COLORES_AGENDA = [
  { valor: "verde-azulado", etiqueta: "Verde azulado", variable: "--color-accent-600" },
  { valor: "azul", etiqueta: "Azul", variable: "--estado-confirmado-fg" },
  { valor: "ambar", etiqueta: "Ámbar", variable: "--estado-ausente-fg" },
  { valor: "gris", etiqueta: "Gris", variable: "--color-text-muted" },
] as const;

export type ColorAgenda = (typeof COLORES_AGENDA)[number]["valor"];

export type SelectorColorProps = PropsAccesibles & {
  valor: ColorAgenda | null;
  alCambiar: (valor: ColorAgenda) => void;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Color (reemplaza `<input type="color">`): grupo de radios con la paleta cerrada.
 * Tab entra al grupo y las flechas cambian el color. El ref apunta al color activo (foco de errores).
 */
export const SelectorColor = forwardRef<HTMLButtonElement, SelectorColorProps>(function SelectorColor(
  { valor, alCambiar, disabled, onBlur, className, required, id, ...aria },
  ref,
) {
  const grupo = useRef<HTMLDivElement>(null);
  const indice = Math.max(0, COLORES_AGENDA.findIndex((c) => c.valor === valor));

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const pasos: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const paso = pasos[e.key];
    if (paso === undefined) return;
    e.preventDefault();
    const siguiente = COLORES_AGENDA[(indice + paso + COLORES_AGENDA.length) % COLORES_AGENDA.length];
    if (!siguiente) return;
    alCambiar(siguiente.valor);
    grupo.current?.querySelector<HTMLButtonElement>(`[data-valor="${siguiente.valor}"]`)?.focus();
  };

  return (
    <div
      ref={grupo}
      id={id}
      className={cn("swatches", className)}
      role="radiogroup"
      aria-required={required || undefined}
      onKeyDown={alTeclear}
      onBlur={onBlur}
      {...aria}
    >
      {COLORES_AGENDA.map((c, i) => (
        <button
          key={c.valor}
          ref={i === indice ? ref : undefined}
          type="button"
          role="radio"
          data-valor={c.valor}
          className="swatch"
          style={{ "--sw": `var(${c.variable})` } as CSSProperties}
          aria-checked={c.valor === valor}
          aria-label={c.etiqueta}
          title={c.etiqueta}
          tabIndex={i === indice ? 0 : -1}
          disabled={disabled}
          onClick={() => alCambiar(c.valor)}
        />
      ))}
    </div>
  );
});
