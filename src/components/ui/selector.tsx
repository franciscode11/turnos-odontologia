"use client";

import "./estilos/interactivos.css";
import { forwardRef, Fragment, useId, useRef, useState, type KeyboardEvent } from "react";
import { Popover, Select } from "radix-ui";
import { cn } from "./cn";
import { Icono } from "./icono";
import { aplanarOpciones, esGrupo, unirRefs, type GrupoOpciones, type Opcion, type PropsAccesibles } from "./tipos";

/* ============================== Selector simple ============================== */

export type SelectorProps = PropsAccesibles & {
  /** Opciones sueltas o agrupadas (`{ grupo, opciones }`, equivalente a optgroup). */
  opciones: ReadonlyArray<Opcion | GrupoOpciones>;
  valor?: string | null;
  alCambiar?: (valor: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  /** Muestra un spinner y bloquea el control mientras llegan las opciones. */
  cargando?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Select (Radix) con grupos. Teclado: Enter/Espacio/flechas abren, flechas recorren,
 * letras buscan, Enter elige y Escape cierra.
 */
export const Selector = forwardRef<HTMLButtonElement, SelectorProps>(function Selector(
  { opciones, valor, alCambiar, placeholder = "Elegí una opción", name, disabled, cargando, onBlur, className, required, ...aria },
  ref,
) {
  // Etiqueta explícita: el valor elegido se ve también antes de que Radix monte las opciones.
  const elegida = valor ? opciones.flatMap((item) => (esGrupo(item) ? item.opciones : [item])).find((o) => o.valor === valor) : undefined;
  return (
    <Select.Root
      value={valor === undefined ? undefined : (valor ?? "")}
      onValueChange={alCambiar}
      name={name}
      disabled={disabled || cargando}
      required={required}
    >
      <Select.Trigger ref={ref} className={cn("control", className)} onBlur={onBlur} aria-busy={cargando || undefined} {...aria}>
        <Select.Value placeholder={cargando ? "Cargando…" : placeholder}>{elegida?.etiqueta}</Select.Value>
        <Select.Icon className="ui-icono-control">
          {cargando ? <Icono nombre="loader" className="spin" /> : <Icono nombre="selector" />}
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="popover ui-flotante" position="popper" sideOffset={6} align="start" collisionPadding={8}>
          <Select.Viewport className="ui-select-viewport">
            {opciones.map((item, i) =>
              esGrupo(item) ? (
                <Fragment key={item.grupo}>
                  {i > 0 ? <Select.Separator className="lb-sep" /> : null}
                  <Select.Group>
                    <Select.Label className="lb-group">{item.grupo}</Select.Label>
                    {item.opciones.map((o) => <ItemSelector key={o.valor} opcion={o} />)}
                  </Select.Group>
                </Fragment>
              ) : (
                <ItemSelector key={item.valor} opcion={item} />
              ),
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
});

function ItemSelector({ opcion }: { opcion: Opcion }) {
  return (
    <Select.Item className="lb-opt" value={opcion.valor} disabled={opcion.deshabilitada}>
      <span className="chk">
        <Select.ItemIndicator>
          <Icono nombre="check" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{opcion.etiqueta}</Select.ItemText>
      {opcion.meta ? <span className="meta">{opcion.meta}</span> : null}
    </Select.Item>
  );
}

/* ============================== Selector múltiple ============================== */

export type SelectorMultipleProps = PropsAccesibles & {
  opciones: ReadonlyArray<Opcion | GrupoOpciones>;
  valor: string[];
  alCambiar: (valor: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  cargando?: boolean;
  onBlur?: () => void;
  className?: string;
};

/**
 * Select múltiple: chips con botón para quitar y una lista con casillas en un popover.
 * Teclado: Enter/Espacio/flecha abajo abren, flechas recorren, Enter/Espacio marcan, Escape cierra.
 */
export const SelectorMultiple = forwardRef<HTMLButtonElement, SelectorMultipleProps>(function SelectorMultiple(
  { opciones, valor, alCambiar, placeholder = "Elegí una o más", disabled, cargando, onBlur, className, required: _requerido, "aria-required": _ariaRequerido, ...aria },
  ref,
) {
  void _requerido; void _ariaRequerido; // aria-required no es válido en el botón disparador.
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const disparador = useRef<HTMLButtonElement>(null);
  const idLista = useId();
  const planas = aplanarOpciones(opciones);
  const seleccionadas = planas.filter((o) => valor.includes(o.valor));
  const bloqueado = disabled || cargando;

  const alternar = (o: Opcion) => {
    if (o.deshabilitada) return;
    alCambiar(valor.includes(o.valor) ? valor.filter((v) => v !== o.valor) : [...valor, o.valor]);
  };

  const mover = (desde: number, paso: 1 | -1) => {
    for (let i = 1; i <= planas.length; i++) {
      const j = (desde + paso * i + planas.length) % planas.length;
      if (!planas[j]?.deshabilitada) return j;
    }
    return desde;
  };

  const alTeclearLista = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActivo((a) => mover(a, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => mover(a, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActivo(mover(-1, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActivo(mover(planas.length, -1)); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const o = planas[activo];
      if (o) alternar(o);
    } else if (e.key === "Tab") setAbierto(false);
  };

  const textoResumen = seleccionadas.length ? seleccionadas.map((o) => o.etiqueta).join(", ") : placeholder;

  return (
    <Popover.Root
      open={abierto}
      onOpenChange={(a) => {
        if (bloqueado) return;
        setAbierto(a);
        if (a) setActivo(Math.max(0, planas.findIndex((o) => !o.deshabilitada)));
      }}
    >
      <Popover.Anchor asChild>
        <div
          className={cn("control chips ui-multiple", className)}
          aria-disabled={bloqueado || undefined}
          onClick={(e) => {
            if (bloqueado || (e.target as HTMLElement).closest("button")) return;
            setAbierto(true);
            disparador.current?.focus();
          }}
        >
          {seleccionadas.length === 0 ? <span className="placeholder">{cargando ? "Cargando…" : placeholder}</span> : null}
          {seleccionadas.map((o) => (
            <span key={o.valor} className="chip">
              {o.etiqueta}
              <button
                type="button"
                aria-label={`Quitar ${o.etiqueta}`}
                disabled={bloqueado}
                onClick={() => alCambiar(valor.filter((v) => v !== o.valor))}
              >
                <Icono nombre="x" tamano="sm" />
              </button>
            </span>
          ))}
          <Popover.Trigger asChild>
            <button
              ref={unirRefs(ref, disparador)}
              type="button"
              className="trail-btn"
              disabled={bloqueado}
              aria-haspopup="listbox"
              aria-controls={abierto ? idLista : undefined}
              aria-busy={cargando || undefined}
              onBlur={onBlur}
              {...aria}
            >
              <span className="sr-only">{textoResumen}</span>
              <Icono nombre={cargando ? "loader" : "selector"} className={cargando ? "spin" : undefined} />
            </button>
          </Popover.Trigger>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById(idLista)?.focus();
          }}
        >
          <div
            id={idLista}
            className="ui-listbox"
            role="listbox"
            aria-multiselectable="true"
            aria-label={aria["aria-label"] ?? "Opciones"}
            tabIndex={0}
            aria-activedescendant={planas[activo] ? `${idLista}-${activo}` : undefined}
            onKeyDown={alTeclearLista}
          >
            {opciones.map((item, gi) => {
              const lista = esGrupo(item) ? item.opciones : [item];
              return (
                <Fragment key={esGrupo(item) ? item.grupo : item.valor}>
                  {esGrupo(item) && gi > 0 ? <div className="lb-sep" role="separator" /> : null}
                  {esGrupo(item) ? <div className="lb-group" role="presentation">{item.grupo}</div> : null}
                  {lista.map((o) => {
                    const indice = planas.indexOf(o);
                    const marcada = valor.includes(o.valor);
                    return (
                      <div
                        key={o.valor}
                        id={`${idLista}-${indice}`}
                        className="lb-opt"
                        role="option"
                        aria-selected={marcada}
                        aria-disabled={o.deshabilitada || undefined}
                        data-highlighted={indice === activo ? "" : undefined}
                        onMouseMove={() => !o.deshabilitada && setActivo(indice)}
                        onClick={() => alternar(o)}
                      >
                        <span className="box" data-state={marcada ? "checked" : "unchecked"} aria-hidden="true">
                          {marcada ? <Icono nombre="check" /> : null}
                        </span>
                        {o.etiqueta}
                        {o.meta ? <span className="meta">{o.meta}</span> : null}
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
