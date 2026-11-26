"use client";

import "./estilos/interactivos.css";
import { forwardRef, useState } from "react";
import { Popover } from "radix-ui";
import { esHoraValida } from "@/domain/shared/fechas";
import { DisparadorControl, ListaHorarios } from "./calendario";
import type { PropsAccesibles } from "./tipos";

export type SelectorHoraProps = PropsAccesibles & {
  /** Hora local de Argentina "HH:mm" (24 h) o null. */
  valor: string | null;
  alCambiar: (hora: string) => void;
  /** Minutos entre horarios. Por defecto 15. */
  paso?: number;
  desde?: string;
  hasta?: string;
  /** Horarios ocupados o bloqueados ("HH:mm"): se ven tachados. */
  ocupadas?: ReadonlyArray<string>;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Selector de hora propio (reemplaza `<input type="time">`): grilla de horarios cada `paso` minutos.
 * Enter abre, flechas recorren, Enter elige y Escape cierra.
 */
export const SelectorHora = forwardRef<HTMLButtonElement, SelectorHoraProps>(function SelectorHora(
  { valor, alCambiar, paso = 15, desde, hasta, ocupadas, placeholder = "Elegí un horario", name, disabled, onBlur, className, required, ...aria },
  ref,
) {
  const [abierto, setAbierto] = useState(false);
  const hora = valor && esHoraValida(valor) ? valor : null;
  return (
    <Popover.Root open={abierto} onOpenChange={setAbierto}>
      <Popover.Trigger asChild>
        <DisparadorControl
          ref={ref}
          texto={hora}
          placeholder={placeholder}
          icono="clock"
          disabled={disabled}
          onBlur={onBlur}
          className={className}
          data-obligatorio={required || undefined}
          {...aria}
        />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={hora ?? ""} /> : null}
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante ui-hora"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          aria-label="Elegir horario"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ListaHorarios
            valor={hora}
            paso={paso}
            desde={desde}
            hasta={hasta}
            ocupadas={ocupadas}
            enfocarAlMontar
            alElegir={(h) => {
              alCambiar(h);
              setAbierto(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
