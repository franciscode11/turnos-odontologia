"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Opcion } from "@/components/ui";
import { ESTADOS_QUE_OCUPAN_AGENDA } from "@/domain/shared/estados";
import { aInstante, diaSemanaIso } from "@/domain/shared/fechas";
import type { Intervalo } from "@/domain/shared/intervalos";
import {
  calcularHorariosOfrecidos,
  esquemaHorariosTurno,
  esquemaNuevoTurno,
  finDeTurno,
  intervalosDeAtencion,
  MENSAJE_PROFESIONAL_OCUPADO,
  MENSAJE_SILLON_OCUPADO,
  validarNuevoTurno,
} from "@/domain/turnos/crear-turno";
import type { Prisma } from "@/generated/prisma/client";
import { requireRol } from "@/server/auth";
import { prisma } from "@/server/db";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";

const ROLES_RESERVA = ["ADMIN", "RECEPCION"] as const;
const esquemaBusquedaPaciente = z.string().trim().max(80);
const estadosActivos = { in: [...ESTADOS_QUE_OCUPAN_AGENDA] };
const intervaloTurno = { inicio: true, fin: true, estado: true, profesionalId: true } as const;

export async function buscarPacientesParaTurno(entrada: unknown): Promise<Resultado<Opcion[]>> {
  return conAcceso(async () => {
    await requireRol(ROLES_RESERVA);
    const consulta = esquemaBusquedaPaciente.safeParse(entrada);
    if (!consulta.success) return fallo("Ingresá un nombre, apellido o DNI válido.");

    const terminos = consulta.data.split(/\s+/).filter(Boolean);
    const pacientes = await prisma.paciente.findMany({
      where: {
        activo: true,
        AND: terminos.map((termino) => {
          // Los filtros de texto de Prisma usan ILIKE. Buscar estos caracteres literalmente.
          const texto = termino.replace(/[\\%_]/g, "\\$&");
          const dni = termino.replace(/\./g, "");
          const coincidencia = { contains: texto, mode: "insensitive" } as const;
          return {
            OR: [
              { nombre: coincidencia },
              { apellido: coincidencia },
              ...(/^\d+$/.test(dni) ? [{ dni: { startsWith: dni } }] : []),
            ],
          };
        }),
      },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }, { id: "asc" }],
      select: { id: true, nombre: true, apellido: true, dni: true },
      take: 20,
    });
    return exito(pacientes.map(({ id, nombre, apellido, dni }) => ({
      valor: id,
      etiqueta: `${apellido}, ${nombre}`,
      meta: dni,
    })));
  });
}

async function cargarFranjas(cliente: Prisma.TransactionClient, profesionalId: string, fecha: string) {
  const franjas = await cliente.horarioAtencion.findMany({
    where: { profesionalId, diaSemana: diaSemanaIso(fecha) },
    orderBy: { horaDesde: "asc" },
    select: { horaDesde: true, horaHasta: true },
  });
  return intervalosDeAtencion(fecha, franjas);
}

async function cargarBloqueos(cliente: Prisma.TransactionClient, profesionalId: string, rango: Intervalo) {
  const bloqueos = await cliente.bloqueo.findMany({
    where: { profesionalId, desde: { lt: rango.fin }, hasta: { gt: rango.inicio } },
    select: { desde: true, hasta: true },
  });
  return bloqueos.map(({ desde, hasta }) => ({ inicio: desde, fin: hasta }));
}

export async function consultarHorariosTurno(entrada: unknown): Promise<Resultado<string[]>> {
  return conAcceso(async () => {
    await requireRol(ROLES_RESERVA);
    const consulta = esquemaHorariosTurno.safeParse(entrada);
    if (!consulta.success) return fallo("Revisá los datos para consultar los horarios.", z.flattenError(consulta.error).fieldErrors);

    const { profesionalId, prestacionId, fecha } = consulta.data;
    const [profesional, prestacion, franjas] = await Promise.all([
      prisma.profesional.findUnique({ where: { id: profesionalId }, select: { activo: true } }),
      prisma.prestacion.findUnique({ where: { id: prestacionId }, select: { activo: true, duracionMinutos: true } }),
      cargarFranjas(prisma, profesionalId, fecha),
    ]);
    if (!profesional?.activo) return fallo("Elegí un profesional activo.", { profesionalId: ["Elegí un profesional activo."] });
    if (!prestacion?.activo) return fallo("Elegí una prestación activa.", { prestacionId: ["Elegí una prestación activa."] });
    const primeraFranja = franjas[0];
    if (!primeraFranja) return exito([]);

    const rango = {
      inicio: primeraFranja.inicio,
      fin: new Date(Math.max(...franjas.map(({ fin }) => fin.getTime()))),
    };
    const [bloqueos, turnos] = await Promise.all([
      cargarBloqueos(prisma, profesionalId, rango),
      prisma.turno.findMany({
        where: { profesionalId, estado: estadosActivos, inicio: { lt: rango.fin }, fin: { gt: rango.inicio } },
        select: intervaloTurno,
      }),
    ]);
    return exito(calcularHorariosOfrecidos({
      ahora: new Date(), profesionalId, duracionMinutos: prestacion.duracionMinutos, franjas, bloqueos, turnos,
    }));
  });
}

function registroDeError(valor: unknown): Record<string, unknown> | undefined {
  return typeof valor === "object" && valor !== null ? valor as Record<string, unknown> : undefined;
}

/** PostgreSQL entrega SQLSTATE y restricción. Prisma puede envolverlos en el error del adaptador. */
function mensajeDeExclusion(error: unknown): string | undefined {
  const registro = registroDeError(error);
  const meta = registroDeError(registro?.meta);
  const adaptador = registroDeError(meta?.driverAdapterError ?? registro?.cause);
  const causa = registroDeError(adaptador?.cause) ?? adaptador;
  const detalles = [registro, meta, causa].flatMap((parte) =>
    [parte?.code, parte?.originalCode, parte?.constraint, parte?.message, parte?.originalMessage, parte?.database_error],
  ).filter((valor): valor is string => typeof valor === "string").join("\n");

  if (!/\b23P01\b/.test(detalles)) return;
  if (/\bturno_sin_solapamiento_profesional\b/.test(detalles)) return MENSAJE_PROFESIONAL_OCUPADO;
  if (/\bturno_sin_solapamiento_sillon\b/.test(detalles)) return MENSAJE_SILLON_OCUPADO;
}

export async function crearTurno(entrada: unknown): Promise<Resultado<{ id: string }>> {
  return conAcceso(async () => {
    const usuario = await requireRol(ROLES_RESERVA);
    const solicitud = esquemaNuevoTurno.safeParse(entrada);
    if (!solicitud.success) return fallo("Revisá los datos del turno.", z.flattenError(solicitud.error).fieldErrors);

    const { pacienteId, profesionalId, prestacionId, sillonId, fecha, hora } = solicitud.data;
    const inicio = aInstante(fecha, hora);
    let resultado: Resultado<{ id: string }>;
    try {
      resultado = await prisma.$transaction(async (tx) => {
        const [paciente, profesional, prestacion, sillon, franjas] = await Promise.all([
          tx.paciente.findUnique({ where: { id: pacienteId }, select: { activo: true } }),
          tx.profesional.findUnique({ where: { id: profesionalId }, select: { activo: true } }),
          tx.prestacion.findUnique({ where: { id: prestacionId }, select: { activo: true, duracionMinutos: true } }),
          tx.sillon.findUnique({ where: { id: sillonId }, select: { activo: true } }),
          cargarFranjas(tx, profesionalId, fecha),
        ]);
        const duracionMinutos = prestacion?.duracionMinutos ?? 0;
        const fin = finDeTurno(inicio, duracionMinutos);
        const [bloqueos, turnos] = await Promise.all([
          cargarBloqueos(tx, profesionalId, { inicio, fin }),
          tx.turno.findMany({
            where: {
              OR: [{ profesionalId }, { sillonId }],
              estado: estadosActivos,
              inicio: { lt: fin },
              fin: { gt: inicio },
            },
            select: { ...intervaloTurno, sillonId: true },
          }),
        ]);
        const validacion = validarNuevoTurno({
          inicio,
          ahora: new Date(),
          duracionMinutos,
          profesionalId,
          sillonId,
          activos: {
            pacienteId: paciente?.activo === true,
            profesionalId: profesional?.activo === true,
            prestacionId: prestacion?.activo === true,
            sillonId: sillon?.activo === true,
          },
          franjas,
          bloqueos,
          turnos,
        });
        if (!validacion.ok) return fallo(validacion.error, validacion.campos);

        const turno = await tx.turno.create({
          data: {
            pacienteId, profesionalId, prestacionId, sillonId, inicio,
            fin: validacion.fin, estado: "RESERVADO", creadoPorId: usuario.id,
          },
          select: { id: true },
        });
        await tx.historialTurno.create({
          data: { turnoId: turno.id, estadoAnterior: null, estadoNuevo: "RESERVADO", usuarioId: usuario.id },
          select: { id: true },
        });
        return exito(turno);
      });
    } catch (error) {
      const mensaje = mensajeDeExclusion(error);
      if (mensaje) return fallo(mensaje);
      throw error;
    }

    if (resultado.ok) revalidatePath("/turnos");
    return resultado;
  });
}
