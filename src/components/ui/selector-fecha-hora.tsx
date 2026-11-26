"use client";

import "./estilos/interactivos.css";
import { forwardRef, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { aInstante, esFechaValida, esHoraValida } from "@/domain/shared/fechas";
import { Calendario, DisparadorControl, ListaHorarios } from "./calendario";
import { fechaNumerica } from "./fechas-ui";
import type { PropsAccesibles } from "./tipos";

/** Separa "AAAA-MM-DDTHH:mm" en fecha y hora locales de Argentina (null si falta o es inválida). */
export function separarFechaHora(valor: string | null | undefined): { fecha: string | null; hora: string | null } {
  const [fecha = "", hora = ""] = (valor ?? "").split("T");
  return { fecha: esFechaValida(fecha) ? fecha : null, hora: esHoraValida(hora) ? hora : null };
}

/** Instante UTC de un valor "AAAA-MM-DDTHH:mm" interpretado en hora de Argentina (para guardar). */
export function instanteDeFechaHora(valor: string): Date | null {
  const { fecha, hora } = separarFechaHora(valor);
  return fecha && hora ? aInstante(fecha, hora) : null;
}

export type SelectorFechaHoraProps = PropsAccesibles & {
  /** "AAAA-MM-DDTHH:mm" en hora de Argentina (como datetime-local, sin zona) o null. */
  valor: string | null;
  alCambiar: (valor: string) => void;
  min?: string;
  max?: string;
  deshabilitarFecha?: (fecha: string) => boolean;
  paso?: number;
  desde?: string;
  hasta?: string;
  /** Horarios ocupados del día elegido. */
  ocupadas?: ReadonlyArray<string>;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Fecha y hora (reemplaza `<input type="datetime-local">`): calendario y horarios en el mismo popover.
 * Elegir el día pasa el foco a los horarios; elegir el horario confirma y cierra.
 * Para guardar, convertí con `instanteDeFechaHora` (UTC).
 */
export const SelectorFechaHora = forwardRef<HTMLButtonElement, SelectorFechaHoraProps>(function SelectorFechaHora(
  {
    valor, alCambiar, min, max, deshabilitarFecha, paso = 15, desde, hasta, ocupadas,
    placeholder = "Elegí fecha y hora", name, disabled, onBlur, className, required, ...aria
  },
  ref,
) {
  const [abierto, setAbierto] = useState(false);
  const actual = separarFechaHora(valor);
  const [fechaTemporal, setFechaTemporal] = useState<string | null>(actual.fecha);
  const horarios = useRef<HTMLDivElement>(null);
  const texto = actual.fecha && actual.hora ? `${fechaNumerica(actual.fecha)}, ${actual.hora}` : null;

  return (
    <Popover.Root
      open={abierto}
      onOpenChange={(a) => {
        setAbierto(a);
        if (a) setFechaTemporal(actual.fecha);
      }}
    >
      <Popover.Trigger asChild>
        <DisparadorControl
          ref={ref}
          texto={texto}
          placeholder={placeholder}
          icono="calendar-event"
          disabled={disabled}
          onBlur={onBlur}
          className={className}
          data-obligatorio={required || undefined}
          {...aria}
        />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={texto ? (valor ?? "") : ""} /> : null}
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          aria-label="Elegir fecha y hora"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="ui-fecha-hora">
            <Calendario
              seleccionada={fechaTemporal}
              min={min}
              max={max}
              deshabilitarFecha={deshabilitarFecha}
              enfocarAlMontar
              alElegir={(f) => {
                setFechaTemporal(f);
                if (actual.hora) alCambiar(`${f}T${actual.hora}`);
                requestAnimationFrame(() => horarios.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus());
              }}
            />
            <div ref={horarios} className="ui-hora">
              <ListaHorarios
                valor={actual.hora}
                paso={paso}
                desde={desde}
                hasta={hasta}
                ocupadas={ocupadas}
                etiqueta={fechaTemporal ? `Horarios del ${fechaNumerica(fechaTemporal)}` : "Horarios"}
                alElegir={(h) => {
                  const f = fechaTemporal ?? actual.fecha;
                  if (!f) {
                    horarios.current?.parentElement?.querySelector<HTMLButtonElement>('.cal-grid [tabindex="0"]')?.focus();
                    return;
                  }
                  alCambiar(`${f}T${h}`);
                  setAbierto(false);
                }}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
