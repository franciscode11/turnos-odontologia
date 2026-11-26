"use client";

import "./estilos/interactivos.css";
import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { cn } from "./cn";

export type DialogoProps = {
  /** Controlado: estado y callback. Si se omiten, lo abre `disparador`. */
  abierto?: boolean;
  alCambiarAbierto?: (abierto: boolean) => void;
  /** Elemento que abre el diálogo (por ejemplo un Boton); se usa con asChild. */
  disparador?: ReactNode;
  titulo: ReactNode;
  descripcion?: ReactNode;
  /** Botones del pie. Para cerrar desde un botón, envolvelo en `CerrarDialogo`. */
  acciones?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Diálogo modal (Radix) para confirmar acciones con consecuencias. Escape y el clic afuera lo cierran,
 * el foco queda atrapado adentro y vuelve al disparador al cerrar. Entra en 220 ms y sale en 150 ms
 * (con movimiento reducido, solo un fundido de 120 ms).
 */
export function Dialogo({ abierto, alCambiarAbierto, disparador, titulo, descripcion, acciones, children, className }: DialogoProps) {
  return (
    <Dialog.Root open={abierto} onOpenChange={alCambiarAbierto}>
      {disparador ? <Dialog.Trigger asChild>{disparador}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="overlay ui-overlay">
          <Dialog.Content className={cn("dialog", className)} {...(descripcion ? {} : { "aria-describedby": undefined })}>
            <div className="dialog-head">
              <Dialog.Title asChild>
                <h3>{titulo}</h3>
              </Dialog.Title>
              {descripcion ? (
                <Dialog.Description asChild>
                  <p>{descripcion}</p>
                </Dialog.Description>
              ) : null}
            </div>
            {children ? <div className="dialog-body">{children}</div> : null}
            {acciones ? <div className="dialog-foot">{acciones}</div> : null}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Envuelve un botón del diálogo para que lo cierre al hacer clic. */
export function CerrarDialogo({ children }: { children: ReactNode }) {
  return <Dialog.Close asChild>{children}</Dialog.Close>;
}
