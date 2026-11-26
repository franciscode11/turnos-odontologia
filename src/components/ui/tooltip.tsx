"use client";

import "./estilos/interactivos.css";
import { createContext, useContext, type ReactNode } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";

const DEMORA_TOOLTIP_MS = 400;
const SALTO_DEMORA_MS = 300;

const HayProveedor = createContext(false);

/**
 * Proveedor común: el primer tooltip aparece a los 400 ms y los siguientes, sin demora.
 * Ponelo una vez en el layout; sin él, cada Tooltip usa el suyo.
 */
export function ProveedorTooltip({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={DEMORA_TOOLTIP_MS} skipDelayDuration={SALTO_DEMORA_MS}>
      <HayProveedor.Provider value>{children}</HayProveedor.Provider>
    </RadixTooltip.Provider>
  );
}

export type TooltipProps = {
  texto: ReactNode;
  /** Un único elemento enfocable que acepte ref (Boton, enlace...). */
  children: ReactNode;
  lado?: "top" | "right" | "bottom" | "left";
};

/** Tooltip (Radix): aparece con mouse o foco, a los 400 ms, en 125 ms. Escape lo cierra. */
export function Tooltip({ texto, children, lado = "top" }: TooltipProps) {
  const hayProveedor = useContext(HayProveedor);
  const tooltip = (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className="ui-tip" side={lado} sideOffset={6} collisionPadding={8}>
          {texto}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
  return hayProveedor ? tooltip : <ProveedorTooltip>{tooltip}</ProveedorTooltip>;
}
