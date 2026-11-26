import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  BadgeEstado,
  BotonEnlace,
  CuerpoPagina,
  EncabezadoPagina,
  Tabla,
  TablaCelda,
  TablaCeldaEncabezado,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TablaVacia,
  Tarjeta,
} from "@/components/ui";
import { fechaLocal, formatearFecha, formatearHora } from "@/domain/shared/fechas";
import { accionesDisponibles } from "@/domain/turnos/estados";
import { accesoPagina } from "@/server/auth/pagina";
import { prisma } from "@/server/db";
import { SinPermiso } from "../../_shell/sin-permiso";
import { AccionesDelTurno } from "./acciones-del-turno";

export const metadata: Metadata = { title: "Detalle del turno" };

const identificadorTurno = z.uuid();

export default async function PaginaTurnosDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { permitido, usuario } = await accesoPagina("turnos.ver");
  if (!permitido) return <SinPermiso />;

  const { id } = await params;
  if (!identificadorTurno.safeParse(id).success) notFound();

  const turno = await prisma.turno.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
      inicio: true,
      fin: true,
      profesionalId: true,
      motivoCancelacion: true,
      paciente: { select: { nombre: true, apellido: true } },
      profesional: { select: { nombre: true, apellido: true } },
      prestacion: { select: { nombre: true } },
      sillon: { select: { nombre: true } },
      historial: {
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        select: {
          id: true,
          fecha: true,
          estadoAnterior: true,
          estadoNuevo: true,
          motivo: true,
          usuario: { select: { nombre: true, email: true } },
        },
      },
    },
  });
  if (!turno) notFound();

  const { estado, inicio, fin, paciente, profesional, prestacion, sillon, historial } = turno;
  const acciones = accionesDisponibles(turno, usuario.rol, usuario.profesionalId === turno.profesionalId, new Date());
  const datos = [
    { etiqueta: "Paciente", valor: `${paciente.nombre} ${paciente.apellido}` },
    { etiqueta: "Profesional", valor: `${profesional.nombre} ${profesional.apellido}` },
    { etiqueta: "Prestación", valor: prestacion.nombre },
    { etiqueta: "Sillón", valor: sillon.nombre },
    { etiqueta: "Fecha y hora", valor: `${formatearFecha(inicio)} · ${formatearHora(inicio)}–${formatearHora(fin)}` },
  ];
  if (turno.motivoCancelacion) datos.push({ etiqueta: "Motivo de cancelación", valor: turno.motivoCancelacion });

  return (
    <>
      <EncabezadoPagina
        titulo="Detalle del turno"
        acciones={<BotonEnlace href={`/turnos?fecha=${fechaLocal(inicio)}`}>Volver a la agenda</BotonEnlace>}
      />
      <CuerpoPagina>
        <Tarjeta titulo="Datos del turno" acciones={<BadgeEstado estado={estado} />}>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datos.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="min-w-0">
                <dt className="muted">{etiqueta}</dt>
                <dd className="break-words">{valor}</dd>
              </div>
            ))}
          </dl>
          {acciones.length > 0 ? <AccionesDelTurno id={turno.id} acciones={acciones} /> : null}
        </Tarjeta>

        <Tarjeta titulo="Historial de estados" className="mt-6">
          <Tabla titulo="Cambios de estado del turno">
            <TablaEncabezado>
              <TablaFila>
                <TablaCeldaEncabezado>Fecha y hora</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Estado anterior</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Estado nuevo</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Usuario</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Motivo</TablaCeldaEncabezado>
              </TablaFila>
            </TablaEncabezado>
            <TablaCuerpo>
              {historial.length === 0 ? <TablaVacia columnas={5} titulo="Sin cambios registrados" /> : null}
              {historial.map((registro) => (
                <TablaFila key={registro.id}>
                  <TablaCelda>
                    <time dateTime={registro.fecha.toISOString()}>
                      {formatearFecha(registro.fecha)} · {formatearHora(registro.fecha)}
                    </time>
                  </TablaCelda>
                  <TablaCelda>{registro.estadoAnterior ? <BadgeEstado estado={registro.estadoAnterior} /> : "—"}</TablaCelda>
                  <TablaCelda><BadgeEstado estado={registro.estadoNuevo} /></TablaCelda>
                  <TablaCelda>{registro.usuario.nombre ?? registro.usuario.email}</TablaCelda>
                  <TablaCelda className="break-words whitespace-normal">{registro.motivo ?? "—"}</TablaCelda>
                </TablaFila>
              ))}
            </TablaCuerpo>
          </Tabla>
        </Tarjeta>
      </CuerpoPagina>
    </>
  );
}
