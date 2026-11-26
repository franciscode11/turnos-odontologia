import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";

type Props = { titulo: string; descripcion?: ReactNode; icono?: NombreIcono; accion?: ReactNode; className?: string };

export function EstadoVacio({ titulo, descripcion, icono = "inbox", accion, className }: Props) {
  return (
    <div className={cn("empty", className)}>
      <div className="e-icon"><Icono nombre={icono} /></div>
      <h4>{titulo}</h4>
      {descripcion ? <p>{descripcion}</p> : null}
      {accion}
    </div>
  );
}
