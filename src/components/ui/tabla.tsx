import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { Avatar } from "./avatar";
import { cn } from "./cn";
import { EstadoVacio } from "./estado-vacio";
import type { NombreIcono } from "./icono";

type TablaProps = {
  /** Título accesible de la tabla (caption oculto). */
  titulo: string;
  /** Pie con paginación o totales (debajo de la tabla). */
  pie?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Tabla del design system: borde, encabezado gris y scroll horizontal propio (nunca de la página). */
export function Tabla({ titulo, pie, children, className }: TablaProps) {
  return (
    <div className={cn("table-wrap", className)}>
      <table>
        <caption className="sr-only">{titulo}</caption>
        {children}
      </table>
      {pie ? <div className="table-foot">{pie}</div> : null}
    </div>
  );
}

export function TablaEncabezado({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

/** Cuerpo con números tabulares. */
export function TablaCuerpo({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cn("num", className)}>{children}</tbody>;
}

type FilaProps = HTMLAttributes<HTMLTableRowElement> & { cancelada?: boolean };

/** Fila; `cancelada` la atenúa y tacha la hora (turnos cancelados). */
export function TablaFila({ cancelada, className, ...resto }: FilaProps) {
  return <tr className={cn(cancelada && "is-cancel", className)} {...resto} />;
}

export function TablaCeldaEncabezado({ className, ...resto }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={className} {...resto} />;
}

type CeldaProps = TdHTMLAttributes<HTMLTableCellElement> & {
  /** Texto principal en negrita media. */
  destacada?: boolean;
  /** Texto secundario gris. */
  apagada?: boolean;
  /** Celda de hora (se tacha en filas canceladas). */
  hora?: boolean;
};

export function TablaCelda({ destacada, apagada, hora, className, ...resto }: CeldaProps) {
  return <td className={cn(destacada && "strong", apagada && "muted", hora && "time", className)} {...resto} />;
}

type CeldaPersonaProps = { nombre: string; detalle?: ReactNode; avatar?: string | null; detalleMono?: boolean };

/** Persona con avatar (o ícono si no tiene), nombre y un dato secundario (DNI, rol). */
export function CeldaPersona({ nombre, detalle, avatar, detalleMono = true }: CeldaPersonaProps) {
  return (
    <div className="cell-person">
      <Avatar avatar={avatar} />
      <div>
        <b>{nombre}</b>
        {detalle ? <span className={detalleMono ? "mono" : undefined}>{detalle}</span> : null}
      </div>
    </div>
  );
}

type TablaVaciaProps = { columnas: number; titulo: string; descripcion?: ReactNode; icono?: NombreIcono; accion?: ReactNode };

/** Fila única con estado vacío que ocupa todas las columnas. */
export function TablaVacia({ columnas, titulo, descripcion, icono, accion }: TablaVaciaProps) {
  return (
    <tr>
      <td colSpan={columnas} style={{ whiteSpace: "normal", height: "auto" }}>
        <EstadoVacio titulo={titulo} descripcion={descripcion} icono={icono} accion={accion} />
      </td>
    </tr>
  );
}
