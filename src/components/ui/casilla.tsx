"use client";

import "./estilos/interactivos.css";
import { forwardRef, type ReactNode } from "react";
import { Checkbox } from "radix-ui";
import { cn } from "./cn";
import { Icono } from "./icono";
import type { PropsAccesibles } from "./tipos";

export type EstadoCasilla = boolean | "mixto";

export type CasillaProps = PropsAccesibles & {
  /** true, false o "mixto" (algunos de un grupo están marcados). */
  marcada?: EstadoCasilla;
  marcadaInicial?: EstadoCasilla;
  alCambiar?: (marcada: boolean) => void;
  /** Texto a la derecha. Sin etiqueta, pasá `aria-label`. */
  etiqueta?: ReactNode;
  descripcion?: ReactNode;
  name?: string;
  value?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

const aRadix = (m: EstadoCasilla | undefined) => (m === "mixto" ? "indeterminate" : m);

/** Checkbox (Radix) con estado mixto. Espacio la marca o desmarca. */
export const Casilla = forwardRef<HTMLButtonElement, CasillaProps>(function Casilla(
  { marcada, marcadaInicial, alCambiar, etiqueta, descripcion, className, ...resto },
  ref,
) {
  const control = (
    <Checkbox.Root
      ref={ref}
      className="box"
      checked={aRadix(marcada)}
      defaultChecked={aRadix(marcadaInicial)}
      onCheckedChange={(v) => alCambiar?.(v === true)}
      {...resto}
    >
      <Checkbox.Indicator>
        <Icono nombre="check" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
  if (!etiqueta) return <span className={className}>{control}</span>;
  return (
    <label className={cn("choice", className)}>
      {control}
      <span>
        {etiqueta}
        {descripcion ? <small>{descripcion}</small> : null}
      </span>
    </label>
  );
});
