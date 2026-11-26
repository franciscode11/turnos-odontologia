"use client";

import "./estilos/interactivos.css";
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent } from "react";
import { hoy, sumarDias } from "@/domain/shared/fechas";
import { Boton } from "./boton";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";
import {
  DIAS_CORTOS, DIAS_LARGOS, fechaLarga, grillaDelMes, horarios, inicioSemana, partes, semanaIso, sumarMeses, tituloMes,
} from "./fechas-ui";

/* ============================== Disparador de los pickers ============================== */

type DisparadorProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  texto: string | null;
  placeholder: string;
  icono: NombreIcono;
};

/** Botón con aspecto de campo que abre un picker (lo usa Popover.Trigger con asChild). */
export const DisparadorControl = forwardRef<HTMLButtonElement, DisparadorProps>(function DisparadorControl(
  { texto, placeholder, icono, className, type = "button", "aria-required": _noValidoEnBoton, ...resto },
  ref,
) {
  void _noValidoEnBoton; // aria-required no es válido en un botón: la etiqueta ya muestra el asterisco.
  return (
    <button ref={ref} type={type} className={cn("control", className)} aria-haspopup="dialog" {...resto}>
      <span className={texto ? "num" : "placeholder"}>{texto ?? placeholder}</span>
      <Icono nombre={icono} />
    </button>
  );
});

/* ============================== Calendario de mes ============================== */

export type CalendarioProps = {
  /** Fecha elegida "AAAA-MM-DD" (marca y foco inicial). */
  seleccionada: string | null;
  alElegir: (fecha: string) => void;
  /** Para marcar varias fechas como elegidas (por ejemplo, una semana). */
  esSeleccionada?: (fecha: string) => boolean;
  min?: string;
  max?: string;
  deshabilitarFecha?: (fecha: string) => boolean;
  mostrarSemanas?: boolean;
  enfocarAlMontar?: boolean;
  className?: string;
};

/**
 * Calendario de un mes, lunes primero, en español. Teclado: flechas mueven un día o una
 * semana, Inicio/Fin van al lunes/domingo, RePág/AvPág cambian de mes (con Mayús, de año),
 * Enter o Espacio eligen. Los días no disponibles se ven tachados y no se eligen.
 */
export function Calendario({
  seleccionada, alElegir, esSeleccionada, min, max, deshabilitarFecha, mostrarSemanas, enfocarAlMontar, className,
}: CalendarioProps) {
  const hoyLocal = hoy();
  const [enfoque, setEnfoque] = useState(() => seleccionada ?? hoyLocal);
  const debeEnfocar = useRef(Boolean(enfocarAlMontar));
  const grilla = useRef<HTMLDivElement>(null);
  const { anio, mes } = partes(enfoque);

  useEffect(() => {
    if (!debeEnfocar.current) return;
    grilla.current?.querySelector<HTMLButtonElement>(`[data-fecha="${enfoque}"]`)?.focus();
  }, [enfoque]);

  const noDisponible = (f: string) => Boolean((min && f < min) || (max && f > max) || deshabilitarFecha?.(f));
  const elegida = (f: string) => (esSeleccionada ? esSeleccionada(f) : f === seleccionada);

  const irA = (f: string, enfocar: boolean) => {
    debeEnfocar.current = enfocar;
    setEnfoque(f);
  };

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const destinos: Record<string, () => string> = {
      ArrowLeft: () => sumarDias(enfoque, -1),
      ArrowRight: () => sumarDias(enfoque, 1),
      ArrowUp: () => sumarDias(enfoque, -7),
      ArrowDown: () => sumarDias(enfoque, 7),
      Home: () => inicioSemana(enfoque),
      End: () => sumarDias(inicioSemana(enfoque), 6),
      PageUp: () => sumarMeses(enfoque, e.shiftKey ? -12 : -1),
      PageDown: () => sumarMeses(enfoque, e.shiftKey ? 12 : 1),
    };
    const destino = destinos[e.key];
    if (!destino) return;
    e.preventDefault();
    irA(destino(), true);
  };

  const semanas = grillaDelMes(enfoque);
  return (
    <div className={cn("cal", mostrarSemanas && "ui-cal-semanas", className)}>
      <div className="cal-head">
        <Boton variante="fantasma" tamano="sm" icono="chevron-left" etiqueta="Mes anterior" onClick={() => irA(sumarMeses(enfoque, -1), false)} />
        <span aria-live="polite">{tituloMes(anio, mes)}</span>
        <Boton variante="fantasma" tamano="sm" icono="chevron-right" etiqueta="Mes siguiente" onClick={() => irA(sumarMeses(enfoque, 1), false)} />
      </div>
      <div ref={grilla} className="cal-grid" role="grid" aria-label={tituloMes(anio, mes)} onKeyDown={alTeclear}>
        <div className="ui-fila" role="row">
          {mostrarSemanas ? <span className="dow" role="columnheader" aria-label="Semana">#</span> : null}
          {DIAS_CORTOS.map((d, i) => (
            <span key={d} className="dow" role="columnheader" aria-label={DIAS_LARGOS[i]}>{d}</span>
          ))}
        </div>
        {semanas.map((semana) => (
          <div key={semana[0]} className="ui-fila" role="row">
            {mostrarSemanas && semana[0] ? <span className="wk" role="rowheader">{Number(semanaIso(semana[0]).slice(-2))}</span> : null}
            {semana.map((f) => {
              const off = noDisponible(f);
              const sel = elegida(f);
              const fuera = partes(f).mes !== mes;
              return (
                <button
                  key={f}
                  type="button"
                  role="gridcell"
                  data-fecha={f}
                  tabIndex={f === enfoque ? 0 : -1}
                  className={cn("d", fuera && "out", f === hoyLocal && "today", off && "off", sel && (esSeleccionada ? "ui-sem" : "sel"))}
                  aria-selected={sel}
                  aria-disabled={off || undefined}
                  aria-current={f === hoyLocal ? "date" : undefined}
                  aria-label={fechaLarga(f)}
                  onFocus={() => f !== enfoque && irA(f, true)}
                  onClick={() => {
                    if (off) return;
                    alElegir(f);
                  }}
                >
                  {partes(f).dia}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== Lista de horarios ============================== */

export type ListaHorariosProps = {
  valor: string | null;
  alElegir: (hora: string) => void;
  /** Minutos entre horarios. Por defecto 15. */
  paso?: number;
  desde?: string;
  hasta?: string;
  /** Horarios ocupados o bloqueados: se ven tachados y no se eligen. */
  ocupadas?: ReadonlyArray<string>;
  enfocarAlMontar?: boolean;
  etiqueta?: string;
};

const COLUMNAS = 4;

/** Grilla de horarios (listbox). Flechas mueven (arriba/abajo una fila), Inicio/Fin, Enter o Espacio eligen. */
export function ListaHorarios({
  valor, alElegir, paso = 15, desde = "08:00", hasta = "20:00", ocupadas = [], enfocarAlMontar, etiqueta = "Horarios",
}: ListaHorariosProps) {
  const lista = horarios(desde, hasta, paso);
  const inicial = valor && lista.includes(valor) ? valor : (lista.find((h) => !ocupadas.includes(h)) ?? lista[0] ?? null);
  const [enfoque, setEnfoque] = useState(inicial);
  const contenedor = useRef<HTMLDivElement>(null);
  const debeEnfocar = useRef(Boolean(enfocarAlMontar));

  useEffect(() => {
    const boton = contenedor.current?.querySelector<HTMLButtonElement>(`[data-hora="${enfoque}"]`);
    boton?.scrollIntoView({ block: "nearest" });
    if (debeEnfocar.current) boton?.focus();
  }, [enfoque]);

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = enfoque ? lista.indexOf(enfoque) : 0;
    const saltos: Record<string, number> = { ArrowLeft: i - 1, ArrowRight: i + 1, ArrowUp: i - COLUMNAS, ArrowDown: i + COLUMNAS, Home: 0, End: lista.length - 1 };
    const j = saltos[e.key];
    if (j === undefined) return;
    e.preventDefault();
    const destino = lista[Math.min(lista.length - 1, Math.max(0, j))];
    if (!destino) return;
    debeEnfocar.current = true;
    setEnfoque(destino);
  };

  return (
    <div ref={contenedor} className="slots" role="listbox" aria-label={etiqueta} onKeyDown={alTeclear}>
      {lista.map((h) => {
        const off = ocupadas.includes(h);
        return (
          <button
            key={h}
            type="button"
            role="option"
            data-hora={h}
            tabIndex={h === enfoque ? 0 : -1}
            className={cn("slot", h === valor && "sel", off && "off")}
            aria-selected={h === valor}
            aria-disabled={off || undefined}
            aria-label={off ? `${h}, ocupado` : h}
            onFocus={() => h !== enfoque && setEnfoque(h)}
            onClick={() => !off && alElegir(h)}
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}
