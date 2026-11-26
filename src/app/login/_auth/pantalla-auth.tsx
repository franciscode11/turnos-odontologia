import type { ReactNode } from "react";
import { Icono } from "@/components/ui";
import { BRAND_NAME } from "@/config/brand";
import { FondoHumo } from "./fondo-humo";

/** Pantalla partida de login y activación (design-system/screens/login.html). */
export function PantallaAuth({ frase, detalle, pie, children }: { frase: string; detalle: string; pie?: ReactNode; children: ReactNode }) {
  return (
    <main className="auth">
      <section className="auth-art" aria-hidden="true">
        <FondoHumo />
        <div className="art-top">
          <span className="mark"><Icono nombre="dental" /></span>
          <span className="sb-name">{BRAND_NAME}</span>
        </div>
        <p className="art-quote">
          {frase}
          <span>{detalle}</span>
        </p>
      </section>
      <section className="auth-panel">
        <div className="ap-top" />
        {children}
        {pie ? <p className="auth-foot">{pie}</p> : null}
      </section>
    </main>
  );
}
