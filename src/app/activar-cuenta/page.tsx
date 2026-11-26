import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Avatar, EstadoVacio, Etiqueta } from "@/components/ui";
import { ETIQUETA_ROL } from "@/server/auth/matriz";
import { MENSAJE_INVITACION_INVALIDA } from "@/server/auth/mensajes";
import { crearClienteSupabase } from "@/server/auth/supabase";
import { prisma } from "@/server/db";
import { PantallaAuth } from "../login/_auth/pantalla-auth";
import { FormularioActivacion } from "./formulario-activacion";

export const metadata: Metadata = { title: "Activá tu cuenta" };

async function invitacionActual() {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;
  return prisma.usuario.findUnique({
    where: { id },
    select: { email: true, rol: true, estado: true, invitadoPor: { select: { nombre: true, email: true, avatar: true } } },
  });
}

/** /activar-cuenta (pública): llega desde /activar-cuenta/verificar con la sesión de la invitación. */
export default async function PaginaActivarCuenta({ searchParams }: PageProps<"/activar-cuenta">) {
  const { error } = await searchParams;
  const invitacion = error ? null : await invitacionActual();
  if (invitacion?.estado === "ACTIVO") redirect("/turnos");
  const valida = invitacion?.estado === "INVITADO";

  return (
    <PantallaAuth frase="Tu lugar en el equipo ya está listo." detalle="Elegí una contraseña y entrás directo a la agenda." pie="Si el enlace venció, pedile al administrador que te reenvíe la invitación.">
      <div className="auth-form">
        <h1>Activá tu cuenta</h1>
        <p className="lead">Completá tus datos para terminar la invitación.</p>
        {valida && invitacion ? (
          <>
            <div className="invite-card">
              <Avatar avatar={invitacion.invitadoPor?.avatar} tamano="lg" />
              <div>
                <b style={{ fontWeight: 600 }}>{invitacion.invitadoPor?.nombre ?? "El administrador"}</b> te invitó como{" "}
                <Etiqueta>{ETIQUETA_ROL[invitacion.rol]}</Etiqueta>
              </div>
            </div>
            <FormularioActivacion email={invitacion.email} />
          </>
        ) : (
          <EstadoVacio icono="mail" titulo="Invitación no válida" descripcion={MENSAJE_INVITACION_INVALIDA} />
        )}
      </div>
    </PantallaAuth>
  );
}
