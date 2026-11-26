"use client";

import "./estilos/interactivos.css";
import { forwardRef, useState } from "react";
import { Popover } from "radix-ui";
import { Calendario, DisparadorControl } from "./calendario";
import { esSemanaValida, lunesDeSemana, semanaIso, textoSemana } from "./fechas-ui";
import type { PropsAccesibles } from "./tipos";

export type SelectorSemanaProps = PropsAccesibles & {
  /** Semana ISO 8601 "AAAA-Www" (como `<input type="week">`) o null. */
  valor: string | null;
  alCambiar: (semana: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Selector de semana (reemplaza `<input type="week">`): calendario con número de semana,
 * lunes primero. Elegir cualquier día elige su semana. Mismo teclado que SelectorFecha.
 */
export const SelectorSemana = forwardRef<HTMLButtonElement, SelectorSemanaProps>(function SelectorSemana(
  { valor, alCambiar, placeholder = "Elegí una semana", name, disabled, onBlur, className, required, ...aria },
  ref,
) {
  const [abierto, setAbierto] = useState(false);
  const semana = valor && esSemanaValida(valor) ? valor : null;
  return (
    <Popover.Root open={abierto} onOpenChange={setAbierto}>
      <Popover.Trigger asChild>
        <DisparadorControl
          ref={ref}
          texto={semana ? textoSemana(semana) : null}
          placeholder={placeholder}
          icono="calendar-week"
          disabled={disabled}
          onBlur={onBlur}
          className={className}
          data-obligatorio={required || undefined}
          {...aria}
        />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={semana ?? ""} /> : null}
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          aria-label="Elegir semana"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendario
            seleccionada={semana ? lunesDeSemana(semana) : null}
            esSeleccionada={(f) => semanaIso(f) === semana}
            mostrarSemanas
            enfocarAlMontar
            alElegir={(f) => {
              alCambiar(semanaIso(f));
              setAbierto(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
