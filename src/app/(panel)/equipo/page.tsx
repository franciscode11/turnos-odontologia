import type { Metadata } from "next";
import { CuerpoPagina, EncabezadoPagina } from "@/components/ui";
import { estadoVisible, formatearDiaMes, formatearUltimoIngreso } from "@/domain/equipo/presentacion";
import { accesoPagina } from "@/server/auth/pagina";
import { listarMiembros, profesionalesParaVincular } from "@/server/equipo/consultas";
import type { Miembro } from "@/server/equipo/tipos";
import { SinPermiso } from "../_shell/sin-permiso";
import { DialogoInvitar } from "./_componentes/dialogo-invitar";
import { TablaEquipo } from "./_componentes/tabla-equipo";
import type { FilaEquipo } from "./_componentes/tipos";

export const metadata: Metadata = { title: "Equipo" };

function aFila(miembro: Miembro, ahora: Date, usuarioActualId: string): FilaEquipo {
  const invitacion = miembro.estado === "INVITADO";
  const detalleInvitacion = miembro.invitadoEn ? `Invitado el ${formatearDiaMes(miembro.invitadoEn)}` : "Invitación pendiente";
  return {
    id: miembro.id,
    email: miembro.email,
    titulo: invitacion ? miembro.email : (miembro.nombre ?? miembro.email),
    detalle: invitacion ? detalleInvitacion : miembro.profesional ? `${miembro.email} · ${miembro.profesional}` : miembro.email,
    rol: miembro.rol,
    estado: miembro.estado,
    estadoVisible: estadoVisible(miembro, ahora),
    avatar: miembro.avatar,
    ultimoIngreso: formatearUltimoIngreso(miembro.ultimoIngreso, ahora),
    profesionalId: miembro.profesionalId,
    esUsuarioActual: miembro.id === usuarioActualId,
  };
}

/** /equipo (C-07): personas, roles e invitaciones. Solo ADMIN (RN-EQ-01); cada acción lo verifica igual. */
export default async function PaginaEquipo() {
  const { usuario, permitido } = await accesoPagina("equipo.gestionar");
  if (!permitido) return <SinPermiso />;

  const [miembros, profesionales] = await Promise.all([listarMiembros(), profesionalesParaVincular()]);
  const ahora = new Date();
  const filas = miembros.map((m) => aFila(m, ahora, usuario.id));

  return (
    <>
      <EncabezadoPagina titulo="Equipo" descripcion="Quién puede entrar al sistema y con qué rol." acciones={<DialogoInvitar profesionales={profesionales} />} />
      <CuerpoPagina>
        <TablaEquipo filas={filas} profesionales={profesionales} />
        <p className="help" style={{ marginTop: 10 }}>
          No hay registro público. Solo el Administrador invita personas; cada invitación vence en 7 días.
        </p>
      </CuerpoPagina>
    </>
  );
}
