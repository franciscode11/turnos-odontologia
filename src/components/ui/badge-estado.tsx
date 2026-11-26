import { ETIQUETA_ESTADO, type EstadoTurno } from "@/domain/shared/estados";
import { cn } from "./cn";
import { Icono, type NombreIcono } from "./icono";

const ICONO_ESTADO: Record<EstadoTurno, NombreIcono> = {
  RESERVADO: "circle-dashed",
  CONFIRMADO: "circle-check",
  CANCELADO: "circle-x",
  ATENDIDO: "user-check",
  AUSENTE: "alert-triangle",
};

type Props = { estado: EstadoTurno; tamano?: "md" | "lg"; soloIcono?: boolean; className?: string };

/** Estado del turno: color con contraste AA + ícono + texto (nunca solo color). */
export function BadgeEstado({ estado, tamano = "md", soloIcono = false, className }: Props) {
  return (
    <span className={cn("badge", `st-${estado.toLowerCase()}`, tamano === "lg" && "lg", className)} title={soloIcono ? ETIQUETA_ESTADO[estado] : undefined}>
      <Icono nombre={ICONO_ESTADO[estado]} />
      {soloIcono ? <span className="sr-only">{ETIQUETA_ESTADO[estado]}</span> : ETIQUETA_ESTADO[estado]}
    </span>
  );
}

/** Etiqueta neutra (roles, categorías). */
export function Etiqueta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("tag", className)}>{children}</span>;
}
