import type { Metadata } from "next";
import { MENSAJE_INACTIVO } from "@/server/auth/mensajes";
import { PantallaAuth } from "./_auth/pantalla-auth";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Ingresar" };

/** /login (pública). Sin registro público: las cuentas las crea el ADMIN (RN-AU-01). */
export default async function PaginaLogin({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <PantallaAuth
      frase="La agenda que no se superpone."
      detalle="Turnos por profesional y por sillón, con el historial de cada cambio."
      pie="¿No tenés cuenta? La crea el administrador del consultorio desde Equipo."
    >
      <FormularioLogin errorInicial={error === "inactivo" ? MENSAJE_INACTIVO : undefined} />
    </PantallaAuth>
  );
}
