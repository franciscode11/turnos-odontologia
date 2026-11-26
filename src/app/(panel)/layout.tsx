import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BRAND_NAME } from "@/config/brand";
import { ETIQUETA_ROL } from "@/server/auth/matriz";
import { seccionesParaRol } from "@/server/auth/matriz";
import { leerSesion } from "@/server/auth/sesion";
import { COOKIE_COLAPSADO } from "@/components/ui/shell-constantes";
import { ShellPanel } from "@/components/ui/shell-panel";

/** Layout del panel: exige sesión de un usuario ACTIVO (RN-AU-04, RN-AU-05) y arma el menú por rol. */
export default async function LayoutPanel({ children }: LayoutProps<"/">) {
  const sesion = await leerSesion();
  if (sesion.tipo === "sin-sesion") redirect("/login");
  if (sesion.tipo === "inactivo") redirect("/salir?motivo=inactivo");
  const { usuario } = sesion;
  const colapsado = (await cookies()).get(COOKIE_COLAPSADO)?.value === "1";

  return (
    <ShellPanel
      marca={BRAND_NAME}
      colapsadoInicial={colapsado}
      secciones={seccionesParaRol(usuario.rol)}
      usuario={{ nombre: usuario.nombre ?? usuario.email, email: usuario.email, rol: ETIQUETA_ROL[usuario.rol], avatar: usuario.avatar }}
    >
      {children}
    </ShellPanel>
  );
}
