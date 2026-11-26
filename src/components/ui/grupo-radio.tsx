"use client";

import "./estilos/interactivos.css";
import { forwardRef, type ReactNode } from "react";
import { RadioGroup } from "radix-ui";
import { cn } from "./cn";
import type { PropsAccesibles } from "./tipos";

export type OpcionRadio = { valor: string; etiqueta: ReactNode; descripcion?: ReactNode; deshabilitada?: boolean };

export type GrupoRadioProps = PropsAccesibles & {
  opciones: OpcionRadio[];
  valor?: string | null;
  valorInicial?: string;
  alCambiar?: (valor: string) => void;
  orientacion?: "vertical" | "horizontal";
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Grupo de radios (Radix). Tab entra al grupo y las flechas cambian la opción.
 * Dentro de `Campo` la etiqueta no puede apuntar a un grupo con `for`: pasá además `aria-label`.
 */
export const GrupoRadio = forwardRef<HTMLDivElement, GrupoRadioProps>(function GrupoRadio(
  { opciones, valor, valorInicial, alCambiar, orientacion = "vertical", className, "aria-invalid": invalido, ...resto },
  ref,
) {
  return (
    <RadioGroup.Root
      ref={ref}
      className={cn("ui-radios", orientacion === "horizontal" && "horizontal", className)}
      value={valor === undefined ? undefined : (valor ?? "")}
      defaultValue={valorInicial}
      onValueChange={alCambiar}
      orientation={orientacion}
      aria-invalid={invalido}
      {...resto}
    >
      {opciones.map((o) => (
        <label key={o.valor} className="choice">
          <RadioGroup.Item className="box radio" value={o.valor} disabled={o.deshabilitada} aria-invalid={invalido} />
          <span>
            {o.etiqueta}
            {o.descripcion ? <small>{o.descripcion}</small> : null}
          </span>
        </label>
      ))}
    </RadioGroup.Root>
  );
});
