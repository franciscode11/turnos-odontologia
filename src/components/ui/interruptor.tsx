"use client";

import "./estilos/interactivos.css";
import { forwardRef, type ReactNode } from "react";
import { Switch } from "radix-ui";
import { cn } from "./cn";
import type { PropsAccesibles } from "./tipos";

export type InterruptorProps = PropsAccesibles & {
  activo?: boolean;
  activoInicial?: boolean;
  alCambiar?: (activo: boolean) => void;
  /** Texto a la derecha. Sin etiqueta, pasá `aria-label`. */
  etiqueta?: ReactNode;
  descripcion?: ReactNode;
  name?: string;
  value?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/** Switch (Radix) para activar o desactivar algo al instante. Espacio o Enter lo cambian. */
export const Interruptor = forwardRef<HTMLButtonElement, InterruptorProps>(function Interruptor(
  { activo, activoInicial, alCambiar, etiqueta, descripcion, className, ...resto },
  ref,
) {
  const control = (
    <Switch.Root ref={ref} className="switch" checked={activo} defaultChecked={activoInicial} onCheckedChange={alCambiar} {...resto} />
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
