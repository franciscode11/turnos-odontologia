import Image from "next/image";
import type { ReactNode } from "react";
import { BRAND_NAME } from "@/config/brand";

/** Pantalla partida de login y activación (design system Revision 4: panel ilustrado). */
export function PantallaAuth({ frase, detalle, pie, children }: { frase: ReactNode; detalle: string; pie?: ReactNode; children: ReactNode }) {
  return (
    <main className="auth">
      <aside className="auth-art">
        <Image className="auth-foto" src="/ilustracion-dental.webp" alt="" fill priority sizes="(max-width: 899px) 0px, 52vw" />
        <Image className="auth-logo" src="/logo.svg" alt={BRAND_NAME} width={250} height={60} priority />
        <div className="art-quote">
          <h2>{frase}</h2>
          <p>{detalle}</p>
        </div>
      </aside>
      <section className="auth-panel">
        <Image className="auth-logo-movil" src="/logo.svg" alt={BRAND_NAME} width={210} height={50} />
        {children}
        {pie ? <p className="auth-foot">{pie}</p> : null}
      </section>
    </main>
  );
}
