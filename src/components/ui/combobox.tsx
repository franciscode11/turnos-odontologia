"use client";

import "./estilos/interactivos.css";
import { forwardRef, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Popover } from "radix-ui";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";
import { normalizarTexto, unirRefs, type Opcion, type PropsAccesibles } from "./tipos";

export type ComboboxProps = PropsAccesibles & {
  opciones: ReadonlyArray<Opcion>;
  /** Valor elegido (el `valor` de una opción) o null. */
  valor: string | null;
  alCambiar: (valor: string | null) => void;
  /**
   * Avisa el texto escrito (por ejemplo para buscar en el servidor con 250 ms de espera).
   * Si filtrás afuera, pasá `filtrar={false}` y mandá ya filtradas las `opciones`.
   */
  alCambiarTexto?: (texto: string) => void;
  filtrar?: boolean;
  placeholder?: string;
  iconoInicial?: NombreIcono;
  sinResultados?: string;
  cargando?: boolean;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

function resaltar(texto: string, consulta: string): ReactNode {
  const q = normalizarTexto(consulta.trim());
  if (!q) return texto;
  const i = normalizarTexto(texto).indexOf(q);
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <mark>{texto.slice(i, i + q.length)}</mark>
      {texto.slice(i + q.length)}
    </>
  );
}

/**
 * Combobox con sugerencias filtradas al escribir (reemplaza `<datalist>`).
 * Patrón ARIA "combobox con listbox": el foco queda en el campo y la opción activa
 * se anuncia con `aria-activedescendant`. Flechas recorren, Enter elige, Escape cierra
 * (y con la lista cerrada, Escape borra el texto).
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    opciones, valor, alCambiar, alCambiarTexto, filtrar = true, placeholder, iconoInicial = "search",
    sinResultados = "Sin resultados", cargando, name, disabled, onBlur, className, required, ...aria
  },
  ref,
) {
  const elegida = opciones.find((o) => o.valor === valor) ?? null;
  const [texto, setTexto] = useState(elegida?.etiqueta ?? "");
  const [valorPrevio, setValorPrevio] = useState(valor);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const ancla = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const idLista = useId();

  if (valorPrevio !== valor) {
    // Cambio externo (reset del formulario): mostrar la etiqueta de la opción elegida.
    setValorPrevio(valor);
    setTexto(elegida?.etiqueta ?? "");
  }

  const consulta = elegida && texto === elegida.etiqueta ? "" : texto;
  const visibles = filtrar
    ? opciones.filter((o) => {
        const q = normalizarTexto(consulta.trim());
        return !q || normalizarTexto(`${o.etiqueta} ${o.meta ?? ""}`).includes(q);
      })
    : [...opciones];

  const elegir = (o: Opcion) => {
    if (o.deshabilitada) return;
    setValorPrevio(o.valor);
    setTexto(o.etiqueta);
    alCambiar(o.valor);
    setAbierto(false);
    setActivo(-1);
  };

  const mover = (paso: 1 | -1) => {
    if (!visibles.length) return;
    let j = activo;
    for (let i = 0; i < visibles.length; i++) {
      j = (j + paso + visibles.length) % visibles.length;
      if (!visibles[j]?.deshabilitada) break;
    }
    setActivo(j);
    document.getElementById(`${idLista}-${j}`)?.scrollIntoView({ block: "nearest" });
  };

  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierto) setAbierto(true);
      mover(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" && abierto) {
      const o = visibles[activo];
      if (o) {
        e.preventDefault();
        elegir(o);
      }
    } else if (e.key === "Escape" && !abierto && texto) {
      e.preventDefault();
      setTexto("");
      alCambiarTexto?.("");
      if (valor !== null) alCambiar(null);
    }
  };

  const textoAyuda = cargando ? "Buscando…" : sinResultados;
  return (
    <Popover.Root open={abierto && !disabled} onOpenChange={setAbierto}>
      <Popover.Anchor asChild>
        <div ref={ancla} className={cn("input-wrap", iconoInicial && "has-lead", className)}>
          {iconoInicial ? <Icono nombre={iconoInicial} className="lead" /> : null}
          <input
            ref={unirRefs(ref, campo)}
            className="control"
            type="text"
            role="combobox"
            autoComplete="off"
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            aria-autocomplete="list"
            aria-expanded={abierto}
            aria-controls={abierto ? idLista : undefined}
            aria-activedescendant={abierto && activo >= 0 ? `${idLista}-${activo}` : undefined}
            aria-required={required || undefined}
            aria-busy={cargando || undefined}
            {...aria}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              alCambiarTexto?.(e.target.value);
              setAbierto(true);
              setActivo(-1);
              if (valor !== null && e.target.value !== elegida?.etiqueta) alCambiar(null);
            }}
            onClick={() => setAbierto(true)}
            onBlur={onBlur}
            onKeyDown={alTeclear}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="popover ui-flotante"
          sideOffset={6}
          align="start"
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (ancla.current?.contains(e.target as Node)) e.preventDefault();
          }}
        >
          <div id={idLista} role="listbox" aria-label={aria["aria-label"] ?? "Sugerencias"}>
            {visibles.length === 0 ? <div className="lb-vacio" role="status">{textoAyuda}</div> : null}
            {visibles.map((o, i) => (
              <div
                key={o.valor}
                id={`${idLista}-${i}`}
                className="lb-opt"
                role="option"
                aria-selected={o.valor === valor}
                aria-disabled={o.deshabilitada || undefined}
                data-highlighted={i === activo ? "" : undefined}
                onMouseMove={() => !o.deshabilitada && setActivo(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  elegir(o);
                  campo.current?.focus();
                }}
              >
                <span>{resaltar(o.etiqueta, consulta)}</span>
                {o.meta ? <span className="meta mono">{resaltar(o.meta, consulta)}</span> : null}
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
