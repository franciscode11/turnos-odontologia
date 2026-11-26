"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";
import { useCargandoVisible } from "./use-cargando-visible";

type Variante = "primario" | "secundario" | "fantasma" | "peligro" | "peligro-fantasma";

const CLASE_VARIANTE: Record<Variante, string> = {
  primario: "btn-primary",
  secundario: "btn-secondary",
  fantasma: "btn-ghost",
  peligro: "btn-danger",
  "peligro-fantasma": "btn-danger-ghost",
};

export type BotonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variante?: Variante;
  tamano?: "md" | "sm";
  /** Botón cuadrado con solo un ícono: obligatorio `etiqueta`. */
  icono?: NombreIcono;
  iconoFinal?: NombreIcono;
  /** Muestra spinner solo si la acción tarda más de 150 ms, y al menos 400 ms (tokens de reacción). */
  cargando?: boolean;
  bloque?: boolean;
  etiqueta?: string;
  children?: ReactNode;
};

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  { variante = "primario", tamano = "md", icono, iconoFinal, cargando = false, bloque, etiqueta, className, children, disabled, type = "button", ...resto },
  ref,
) {
  const spinner = useCargandoVisible(cargando);
  const soloIcono = Boolean(icono) && !children;
  return (
    <button
      ref={ref}
      type={type}
      className={cn("btn", CLASE_VARIANTE[variante], tamano === "sm" && "btn-sm", soloIcono && "btn-icon", bloque && "btn-block", className)}
      disabled={disabled || cargando}
      data-loading={spinner || undefined}
      aria-busy={cargando || undefined}
      aria-label={soloIcono ? etiqueta : undefined}
      title={soloIcono ? etiqueta : undefined}
      {...resto}
    >
      {spinner ? <Icono nombre="loader" className="spin" /> : icono ? <Icono nombre={icono} /> : null}
      {children}
      {iconoFinal && !spinner ? <Icono nombre={iconoFinal} className={iconoFinal === "arrow-right" ? "arrow" : undefined} /> : null}
    </button>
  );
});
