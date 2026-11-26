"use client";

import "./estilos/interactivos.css";
import { forwardRef, useState } from "react";
import { Popover } from "radix-ui";
import { Calendario, DisparadorControl } from "./calendario";
import { fechaCorta, fechaValidaONula } from "./fechas-ui";
import type { PropsAccesibles } from "./tipos";

export type SelectorFechaProps = PropsAccesibles & {
  /** Fecha local de Argentina "AAAA-MM-DD" o null. */
  valor: string | null;
  alCambiar: (fecha: string) => void;
  min?: string;
  max?: string;
  /** Días no disponibles (feriados, sin atención): se ven tachados. */
  deshabilitarFecha?: (fecha: string) => boolean;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Selector de fecha propio (reemplaza `<input type="date">`): igual en todos los navegadores
 * y en hora de Argentina. Enter abre el calendario, flechas recorren, Enter elige y Escape cierra.
 */
export const SelectorFecha = forwardRef<HTMLButtonElement, SelectorFechaProps>(function SelectorFecha(
  { valor, alCambiar, min, max, deshabilitarFecha, placeholder = "Elegí una fecha", name, disabled, onBlur, className, required, ...aria },
  ref,
) {
  const [abierto, setAbierto] = useState(false);
  const fecha = fechaValidaONula(valor);
  return (
    <Popover.Root open={abierto} onOpenChange={setAbierto}>
      <Popover.Trigger asChild>
        <DisparadorControl
          ref={ref}
          texto={fecha ? fechaCorta(fecha) : null}
          placeholder={placeholder}
          icono="calendar-event"
          disabled={disabled}
          onBlur={onBlur}
          className={className}
          data-obligatorio={required || undefined}
          {...aria}
        />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={fecha ?? ""} /> : null}
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          aria-label="Elegir fecha"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendario
            seleccionada={fecha}
            min={min}
            max={max}
            deshabilitarFecha={deshabilitarFecha}
            enfocarAlMontar
            alElegir={(f) => {
              alCambiar(f);
              setAbierto(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
