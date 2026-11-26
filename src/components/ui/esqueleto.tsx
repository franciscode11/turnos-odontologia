import { cn } from "./cn";

/** Bloque de carga (shimmer; quieto con movimiento reducido). */
export function Esqueleto({ className, alto = 16, ancho }: { className?: string; alto?: number; ancho?: number | string }) {
  return <div className={cn("sk", className)} style={{ height: alto, width: ancho ?? "100%" }} aria-hidden="true" />;
}
