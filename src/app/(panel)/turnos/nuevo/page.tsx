import type { Metadata } from "next";
import { BotonEnlace, CuerpoPagina, EncabezadoPagina, EstadoVacio, Tarjeta } from "@/components/ui";
import { hoy } from "@/domain/shared/fechas";
import { accesoPagina } from "@/server/auth/pagina";
import { prisma } from "@/server/db";
import { SinPermiso } from "../../_shell/sin-permiso";
import { FormularioNuevoTurno } from "./formulario-nuevo-turno";

export const metadata: Metadata = { title: "Nuevo turno" };

export default async function PaginaTurnosNuevo() {
  const { permitido } = await accesoPagina("turnos.crear");
  if (!permitido) return <SinPermiso />;

  const [profesionales, prestaciones, sillones] = await Promise.all([
    prisma.profesional.findMany({
      where: { activo: true },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.prestacion.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, duracionMinutos: true },
    }),
    prisma.sillon.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <>
      <EncabezadoPagina
        titulo="Nuevo turno"
        acciones={<BotonEnlace href="/turnos" tamano="sm">Volver a la agenda</BotonEnlace>}
      />
      <CuerpoPagina>
        <Tarjeta className="max-w-3xl">
          {profesionales.length && prestaciones.length && sillones.length ? (
            <FormularioNuevoTurno
              fechaInicial={hoy()}
              profesionales={profesionales.map(({ id, apellido, nombre }) => ({ valor: id, etiqueta: `${apellido}, ${nombre}` }))}
              prestaciones={prestaciones.map(({ id, nombre, duracionMinutos }) => ({
                valor: id, etiqueta: nombre, meta: `${duracionMinutos} min`, duracionMinutos,
              }))}
              sillones={sillones.map(({ id, nombre }) => ({ valor: id, etiqueta: nombre }))}
            />
          ) : (
            <EstadoVacio
              icono="calendar-event"
              titulo="Faltan datos para reservar"
              descripcion="Debe haber al menos un profesional, una prestación y un sillón activos."
            />
          )}
        </Tarjeta>
      </CuerpoPagina>
    </>
  );
}
