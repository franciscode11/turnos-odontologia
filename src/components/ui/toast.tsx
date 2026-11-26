"use client";

import "./estilos/interactivos.css";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icono, type NombreIcono } from "./icono";

export type VarianteToast = "exito" | "error" | "aviso" | "info";

/** Duraciones del design system: éxito/aviso/info 4 s, error 6 s. Se pausan con el mouse o el foco. */
export const DURACION_TOAST_MS: Record<VarianteToast, number> = { exito: 4000, error: 6000, aviso: 4000, info: 4000 };
const SALIDA_MS = 160; // --dur-toast-exit
const MAXIMO_VISIBLES = 4;

const CLASE: Record<VarianteToast, string> = { exito: "t-success", error: "t-error", aviso: "t-warning", info: "t-info" };
const ICONO: Record<VarianteToast, NombreIcono> = { exito: "circle-check", error: "circle-x", aviso: "alert-triangle", info: "info-circle" };

export type OpcionesToast = { variante: VarianteToast; titulo: string; detalle?: string; duracionMs?: number };
type ToastActivo = OpcionesToast & { id: number };

export type ApiToast = {
  mostrar: (opciones: OpcionesToast) => number;
  exito: (titulo: string, detalle?: string) => number;
  error: (titulo: string, detalle?: string) => number;
  aviso: (titulo: string, detalle?: string) => number;
  info: (titulo: string, detalle?: string) => number;
  cerrar: (id: number) => void;
};

const ContextoToast = createContext<ApiToast | null>(null);

/**
 * Proveedor de toasts: ponelo una vez en el layout. Si ya hay uno más arriba, no crea otro.
 * Los toasts aparecen abajo a la derecha, se apilan y se anuncian en una región `aria-live`.
 */
export function ProveedorToast({ children }: { children: ReactNode }) {
  const existente = useContext(ContextoToast);
  if (existente) return <>{children}</>;
  return <ProveedorToastRaiz>{children}</ProveedorToastRaiz>;
}

function ProveedorToastRaiz({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastActivo[]>([]);
  const siguienteId = useRef(1);

  const cerrar = useCallback((id: number) => setToasts((lista) => lista.filter((t) => t.id !== id)), []);
  const mostrar = useCallback((opciones: OpcionesToast) => {
    const id = siguienteId.current++;
    setToasts((lista) => [...lista, { ...opciones, id }].slice(-MAXIMO_VISIBLES));
    return id;
  }, []);

  const api = useMemo<ApiToast>(
    () => ({
      mostrar,
      cerrar,
      exito: (titulo, detalle) => mostrar({ variante: "exito", titulo, detalle }),
      error: (titulo, detalle) => mostrar({ variante: "error", titulo, detalle }),
      aviso: (titulo, detalle) => mostrar({ variante: "aviso", titulo, detalle }),
      info: (titulo, detalle) => mostrar({ variante: "info", titulo, detalle }),
    }),
    [mostrar, cerrar],
  );

  return (
    <ContextoToast.Provider value={api}>
      {children}
      <section className="toaster" aria-label="Notificaciones" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <ItemToast key={t.id} toast={t} alCerrar={() => cerrar(t.id)} />
        ))}
      </section>
    </ContextoToast.Provider>
  );
}

function ItemToast({ toast, alCerrar }: { toast: ToastActivo; alCerrar: () => void }) {
  const [entrando, setEntrando] = useState(true);
  const [saliendo, setSaliendo] = useState(false);
  const [pausado, setPausado] = useState({ mouse: false, foco: false });
  const restante = useRef(toast.duracionMs ?? DURACION_TOAST_MS[toast.variante]);
  const cerrarRef = useRef(alCerrar);

  useEffect(() => {
    cerrarRef.current = alCerrar;
  }, [alCerrar]);

  // Entrada: se quita data-entering dos cuadros después de montar para que corra la transición.
  useEffect(() => {
    let segundo = 0;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setEntrando(false));
    });
    return () => {
      cancelAnimationFrame(primero);
      cancelAnimationFrame(segundo);
    };
  }, []);

  // Salida: anima 160 ms y después se quita de la lista.
  useEffect(() => {
    if (!saliendo) return;
    const t = setTimeout(() => cerrarRef.current(), SALIDA_MS);
    return () => clearTimeout(t);
  }, [saliendo]);

  // Temporizador con pausa: guarda el tiempo restante al pausar.
  const enPausa = pausado.mouse || pausado.foco;
  useEffect(() => {
    if (enPausa || saliendo) return;
    const inicio = Date.now();
    const t = setTimeout(() => setSaliendo(true), restante.current);
    return () => {
      clearTimeout(t);
      restante.current = Math.max(0, restante.current - (Date.now() - inicio));
    };
  }, [enPausa, saliendo]);

  return (
    <div
      className={`toast ${CLASE[toast.variante]}`}
      role={toast.variante === "error" ? "alert" : "status"}
      data-entering={entrando || undefined}
      data-leaving={saliendo || undefined}
      onMouseEnter={() => setPausado((p) => ({ ...p, mouse: true }))}
      onMouseLeave={() => setPausado((p) => ({ ...p, mouse: false }))}
      onFocus={() => setPausado((p) => ({ ...p, foco: true }))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPausado((p) => ({ ...p, foco: false }));
      }}
    >
      <Icono nombre={ICONO[toast.variante]} />
      <div className="t-text">
        <b>{toast.titulo}</b>
        {toast.detalle ? <> <span>{toast.detalle}</span></> : null}
      </div>
      <button type="button" className="t-close" aria-label="Cerrar notificación" onClick={() => setSaliendo(true)}>
        <Icono nombre="x" tamano="sm" />
      </button>
    </div>
  );
}

/** Muestra toasts: `const toast = useToast(); toast.exito("Turno creado", "Martina Sosa, 10:30")`. */
export function useToast(): ApiToast {
  const api = useContext(ContextoToast);
  if (!api) throw new Error("useToast necesita <ProveedorToast> más arriba en el árbol.");
  return api;
}

/** Toast quieto, para mostrar el diseño en el catálogo o en una pantalla de ayuda. */
export function ToastEstatico({ variante, titulo, detalle }: Omit<OpcionesToast, "duracionMs">) {
  return (
    <div className={`toast static ${CLASE[variante]}`}>
      <Icono nombre={ICONO[variante]} />
      <div className="t-text">
        <b>{titulo}</b>
        {detalle ? <> <span>{detalle}</span></> : null}
      </div>
    </div>
  );
}
