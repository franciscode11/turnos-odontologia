"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";

type Tipo = "text" | "email" | "tel" | "url" | "search" | "password";

export type EntradaProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  tipo?: Tipo;
  iconoInicial?: NombreIcono;
  /** Solo en tipo "search": botón para limpiar. */
  alLimpiar?: () => void;
};

/** Campo de texto (text, email, tel, url, search con limpiar, password con mostrar/ocultar). */
export const Entrada = forwardRef<HTMLInputElement, EntradaProps>(function Entrada(
  { tipo = "text", iconoInicial, alLimpiar, className, ...resto },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const esPassword = tipo === "password";
  const esBusqueda = tipo === "search";
  const lead = iconoInicial ?? (esBusqueda ? "search" : undefined);
  const conValor = resto.value !== undefined && resto.value !== "";
  const trail = esPassword || (esBusqueda && alLimpiar && conValor);
  return (
    <div className={cn("input-wrap", lead && "has-lead", trail && "has-trail", className)}>
      {lead ? <Icono nombre={lead} className="lead" /> : null}
      <input ref={ref} className="control" type={esPassword && visible ? "text" : tipo} {...resto} />
      {esPassword ? (
        <button
          type="button"
          className="trail-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          <Icono nombre={visible ? "eye-off" : "eye"} />
        </button>
      ) : null}
      {esBusqueda && alLimpiar && conValor ? (
        <button type="button" className="trail-btn" onClick={alLimpiar} aria-label="Limpiar búsqueda">
          <Icono nombre="x" />
        </button>
      ) : null}
    </div>
  );
});
