import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = { titulo?: ReactNode; acciones?: ReactNode; pie?: ReactNode; children?: ReactNode; className?: string; sinPadding?: boolean };

export function Tarjeta({ titulo, acciones, pie, children, className, sinPadding }: Props) {
  return (
    <section className={cn("card", className)}>
      {titulo || acciones ? (
        <header className="card-head">
          {titulo ? <h2 className="card-title">{titulo}</h2> : <span />}
          {acciones}
        </header>
      ) : null}
      <div className={sinPadding ? undefined : "card-body"}>{children}</div>
      {pie ? <footer className="card-foot">{pie}</footer> : null}
    </section>
  );
}
