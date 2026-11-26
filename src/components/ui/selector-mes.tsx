"use client";

import "./estilos/interactivos.css";
import { forwardRef, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Popover } from "radix-ui";
import { hoy } from "@/domain/shared/fechas";
import { Boton } from "./boton";
import { DisparadorControl } from "./calendario";
import { cn } from "./cn";
import { esMesValido, MESES_CORTOS, MESES_LARGOS, tituloMes } from "./fechas-ui";
import type { PropsAccesibles } from "./tipos";

export type SelectorMesProps = PropsAccesibles & {
  /** Mes "AAAA-MM" o null. */
  valor: string | null;
  alCambiar: (mes: string) => void;
  /** Límites "AAAA-MM" (inclusive). */
  min?: string;
  max?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

const aMes = (anio: number, mes: number) => `${anio}-${String(mes).padStart(2, "0")}`;

/**
 * Selector de mes (reemplaza `<input type="month">`). Flechas recorren los meses
 * (arriba/abajo de a 4), RePág/AvPág cambian de año, Enter elige y Escape cierra.
 */
export const SelectorMes = forwardRef<HTMLButtonElement, SelectorMesProps>(function SelectorMes(
  { valor, alCambiar, min, max, placeholder = "Elegí un mes", name, disabled, onBlur, className, required, ...aria },
  ref,
) {
  const [abierto, setAbierto] = useState(false);
  const mes = valor && esMesValido(valor) ? valor : null;
  const [anio = 0, numero = 1] = (mes ?? "").split("-").map(Number);
  return (
    <Popover.Root open={abierto} onOpenChange={setAbierto}>
      <Popover.Trigger asChild>
        <DisparadorControl
          ref={ref}
          texto={mes ? tituloMes(anio, numero) : null}
          placeholder={placeholder}
          icono="calendar-event"
          disabled={disabled}
          onBlur={onBlur}
          className={className}
          data-obligatorio={required || undefined}
          {...aria}
        />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={mes ?? ""} /> : null}
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante ui-mes"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          aria-label="Elegir mes"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <GrillaMeses
            valor={mes}
            min={min}
            max={max}
            alElegir={(m) => {
              alCambiar(m);
              setAbierto(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});

function GrillaMeses({ valor, min, max, alElegir }: { valor: string | null; min?: string; max?: string; alElegir: (mes: string) => void }) {
  const [enfoque, setEnfoque] = useState(() => valor ?? hoy().slice(0, 7));
  const debeEnfocar = useRef(true);
  const grilla = useRef<HTMLDivElement>(null);
  const [anio = 0, numero = 1] = enfoque.split("-").map(Number);

  useEffect(() => {
    if (debeEnfocar.current) grilla.current?.querySelector<HTMLButtonElement>(`[data-mes="${enfoque}"]`)?.focus();
  }, [enfoque]);

  const irA = (a: number, m: number, enfocar: boolean) => {
    const total = a * 12 + (m - 1);
    debeEnfocar.current = enfocar;
    setEnfoque(aMes(Math.floor(total / 12), (total % 12) + 1));
  };

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const saltos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4, PageUp: -12, PageDown: 12 };
    const salto = saltos[e.key];
    if (salto === undefined) return;
    e.preventDefault();
    irA(anio, numero + salto, true);
  };

  return (
    <>
      <div className="cal-head" style={{ padding: "4px 4px 0" }}>
        <Boton variante="fantasma" tamano="sm" icono="chevron-left" etiqueta="Año anterior" onClick={() => irA(anio - 1, numero, false)} />
        <span aria-live="polite">{anio}</span>
        <Boton variante="fantasma" tamano="sm" icono="chevron-right" etiqueta="Año siguiente" onClick={() => irA(anio + 1, numero, false)} />
      </div>
      <div ref={grilla} className="months" role="listbox" aria-label={`Meses de ${anio}`} onKeyDown={alTeclear}>
        {MESES_CORTOS.map((corto, i) => {
          const m = aMes(anio, i + 1);
          const off = Boolean((min && m < min) || (max && m > max));
          return (
            <button
              key={m}
              type="button"
              role="option"
              data-mes={m}
              tabIndex={m === enfoque ? 0 : -1}
              className={cn("slot", m === valor && "sel", off && "off")}
              aria-selected={m === valor}
              aria-disabled={off || undefined}
              aria-label={`${MESES_LARGOS[i]} de ${anio}`}
              onFocus={() => m !== enfoque && setEnfoque(m)}
              onClick={() => !off && alElegir(m)}
            >
              {corto}
            </button>
          );
        })}
      </div>
    </>
  );
}
