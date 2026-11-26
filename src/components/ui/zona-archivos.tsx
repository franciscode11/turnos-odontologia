"use client";

import "./estilos/interactivos.css";
import { forwardRef, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Boton } from "./boton";
import { Icono } from "./icono";
import type { PropsAccesibles } from "./tipos";

export type ZonaArchivosProps = PropsAccesibles & {
  archivos: File[];
  alCambiar: (archivos: File[]) => void;
  /** Tipos aceptados, como el `accept` de un input file ("application/pdf,image/*"). */
  aceptar?: string;
  multiple?: boolean;
  /** Tamaño máximo por archivo, en MB. */
  maximoMb?: number;
  /** Avisa archivos rechazados por tipo o tamaño (para mostrar el error en Campo). */
  alRechazar?: (motivo: string) => void;
  /** Progreso de subida 0-100 por nombre de archivo (opcional). */
  progreso?: Record<string, number>;
  ayuda?: ReactNode;
  name?: string;
  disabled?: boolean;
  onBlur?: () => void;
  className?: string;
};

const formatoMb = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
const tamano = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${formatoMb.format(bytes / 1024 / 1024)} MB`);

function aceptado(archivo: File, aceptar?: string): boolean {
  if (!aceptar) return true;
  return aceptar.split(",").map((t) => t.trim().toLowerCase()).some((tipo) => {
    if (tipo.startsWith(".")) return archivo.name.toLowerCase().endsWith(tipo);
    if (tipo.endsWith("/*")) return archivo.type.startsWith(tipo.slice(0, -1));
    return archivo.type === tipo;
  });
}

/**
 * Archivos (reemplaza `<input type="file">`): zona para arrastrar o elegir, con teclado
 * (Enter o Espacio abre el selector del sistema) y lista de archivos con botón para quitar.
 */
export const ZonaArchivos = forwardRef<HTMLDivElement, ZonaArchivosProps>(function ZonaArchivos(
  { archivos, alCambiar, aceptar, multiple, maximoMb, alRechazar, progreso, ayuda, name, disabled, onBlur, className, required: _requerido, "aria-required": _ariaRequerido, id, ...aria },
  ref,
) {
  void _requerido; void _ariaRequerido; // aria-required no es válido en role="button".
  const input = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const agregar = (lista: FileList | null) => {
    if (!lista || disabled) return;
    const nuevos = Array.from(lista);
    const validos = nuevos.filter((a) => aceptado(a, aceptar) && (!maximoMb || a.size <= maximoMb * 1024 * 1024));
    if (validos.length < nuevos.length) {
      alRechazar?.(maximoMb ? `Solo se aceptan archivos del tipo indicado y de hasta ${maximoMb} MB.` : "Ese tipo de archivo no se acepta.");
    }
    if (validos.length) alCambiar(multiple ? [...archivos, ...validos] : validos.slice(0, 1));
  };

  const soltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    agregar(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        id={id}
        className="dropzone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        data-arrastrando={arrastrando || undefined}
        onClick={() => !disabled && input.current?.click()}
        onKeyDown={(e) => {
          if (disabled || (e.key !== "Enter" && e.key !== " ")) return;
          e.preventDefault();
          input.current?.click();
        }}
        onBlur={onBlur}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={soltar}
        {...aria}
      >
        <div className="dz-icon"><Icono nombre="upload" /></div>
        <b>Arrastrá {multiple ? "archivos" : "un archivo"}</b> o hacé clic para {multiple ? "elegirlos" : "elegirlo"}
        {ayuda ? <div className="help">{ayuda}</div> : null}
      </div>
      <input
        ref={input}
        type="file"
        name={name}
        accept={aceptar}
        multiple={multiple}
        disabled={disabled}
        hidden
        tabIndex={-1}
        onChange={(e) => {
          agregar(e.target.files);
          e.target.value = "";
        }}
      />
      {archivos.length ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Archivos elegidos">
          {archivos.map((a, i) => {
            const p = progreso?.[a.name];
            return (
              <li key={`${a.name}-${i}`} className="file">
                <Icono nombre="file-text" className="subtle" />
                <div className="f-meta">
                  {a.name}
                  <span className="num">{p !== undefined && p < 100 ? `${tamano((a.size * p) / 100)} de ${tamano(a.size)}` : tamano(a.size)}</span>
                  {p !== undefined && p < 100 ? (
                    <div className="progress" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={`Subiendo ${a.name}`}>
                      <i style={{ width: `${p}%` }} />
                    </div>
                  ) : null}
                </div>
                <Boton
                  variante="fantasma"
                  tamano="sm"
                  icono="x"
                  etiqueta={`Quitar ${a.name}`}
                  disabled={disabled}
                  onClick={() => alCambiar(archivos.filter((_, j) => j !== i))}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});
