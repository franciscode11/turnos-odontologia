import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";

type Props = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  variante?: "primario" | "secundario" | "fantasma";
  tamano?: "md" | "sm";
  icono?: NombreIcono;
  /** Obligatoria si el enlace tiene solo ícono. */
  etiqueta?: string;
  className?: string;
  children?: ReactNode;
};

const CLASE = { primario: "btn-primary", secundario: "btn-secondary", fantasma: "btn-ghost" } as const;

/** Enlace con apariencia de botón (navegación: "Hoy", "Nuevo turno", etc.). */
export function BotonEnlace({ variante = "secundario", tamano = "md", icono, etiqueta, className, children, ...resto }: Props) {
  const soloIcono = Boolean(icono) && !children;
  return (
    <Link
      className={cn("btn", CLASE[variante], tamano === "sm" && "btn-sm", soloIcono && "btn-icon", className)}
      aria-label={soloIcono ? etiqueta : undefined}
      title={soloIcono ? etiqueta : undefined}
      {...resto}
    >
      {icono ? <Icono nombre={icono} /> : null}
      {children}
    </Link>
  );
}
