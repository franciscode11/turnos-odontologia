import type { Metadata } from "next";
import Link from "next/link";
import { BotonEnlace, CuerpoPagina, EncabezadoPagina, EstadoVacio } from "@/components/ui";
import { ocupaAgenda } from "@/domain/shared/estados";
import { esFechaValida, formatearFechaLarga, hoy, sumarDias } from "@/domain/shared/fechas";
import { puede } from "@/server/auth/matriz";
import { accesoPagina } from "@/server/auth/pagina";
import { SinPermiso } from "../_shell/sin-permiso";
import { cargarAgenda } from "./_agenda/datos";
import { GrillaDia } from "./_agenda/grilla-dia";
import { ListaDia } from "./_agenda/lista-dia";

export const metadata: Metadata = { title: "Agenda" };

/** /turnos: agenda del día en solo lectura para todos los roles (spec agenda-del-dia). */
export default async function PaginaAgenda({ searchParams }: PageProps<"/turnos">) {
  const { usuario, permitido } = await accesoPagina("turnos.ver");
  if (!permitido) return <SinPermiso />;

  const parametros = await searchParams;
  const ahora = new Date();
  const fechaPedida = typeof parametros.fecha === "string" ? parametros.fecha : "";
  const fecha = esFechaValida(fechaPedida) ? fechaPedida : hoy(ahora); // fecha inválida → hoy
  const vista = parametros.vista === "lista" ? "lista" : "dia";

  const columnas = await cargarAgenda(fecha);
  const turnos = columnas.flatMap((c) => c.turnos).sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const activos = turnos.filter((t) => ocupaAgenda(t.estado)).length;
  const enlace = (f: string, v = vista) => `/turnos?fecha=${f}${v === "lista" ? "&vista=lista" : ""}`;

  return (
    <>
      <EncabezadoPagina
        titulo="Agenda"
        descripcion={<span className="num">{formatearFechaLarga(fecha)} · {activos} {activos === 1 ? "turno" : "turnos"}</span>}
        acciones={
          <>
            <div className="row" style={{ gap: 4 }}>
              <BotonEnlace href={enlace(sumarDias(fecha, -1))} tamano="sm" icono="chevron-left" etiqueta="Día anterior" />
              <BotonEnlace href={enlace(hoy(ahora))} tamano="sm">Hoy</BotonEnlace>
              <BotonEnlace href={enlace(sumarDias(fecha, 1))} tamano="sm" icono="chevron-right" etiqueta="Día siguiente" />
            </div>
            <div className="segmented" role="group" aria-label="Vista">
              <Link href={enlace(fecha, "dia")} aria-current={vista === "dia" ? "true" : undefined}>Día</Link>
              <Link href={enlace(fecha, "lista")} aria-current={vista === "lista" ? "true" : undefined}>Lista</Link>
            </div>
            {puede(usuario.rol, "turnos.crear") ? (
              <BotonEnlace href="/turnos/nuevo" variante="primario" tamano="sm" icono="plus">Nuevo turno</BotonEnlace>
            ) : null}
          </>
        }
      />
      <CuerpoPagina>
        {columnas.length === 0 ? (
          <EstadoVacio icono="stethoscope" titulo="No hay profesionales activos" descripcion="Cargá profesionales desde Configuración para ver la agenda." />
        ) : vista === "lista" ? (
          <ListaDia turnos={turnos} />
        ) : (
          <>
            <GrillaDia columnas={columnas} fecha={fecha} ahora={ahora} />
            {turnos.length === 0 ? <p className="help" style={{ marginTop: 12 }}>No hay turnos para este día.</p> : null}
            <p className="help" style={{ marginTop: 12 }}>
              Las franjas rayadas están fuera del horario de atención. Los turnos cancelados no aparecen: liberan el horario.
            </p>
          </>
        )}
      </CuerpoPagina>
    </>
  );
}
