import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ESTADOS_QUE_OCUPAN_AGENDA } from "@/domain/shared/estados";
import { prisma } from "@/server/db";
import { RestriccionDeBloqueo, type BloqueoGuardado, type FranjaGuardada, type RepositorioHorarios } from "./tipos";

type Cliente = Prisma.TransactionClient | typeof prisma;

const SELECT_FRANJA = { id: true, profesionalId: true, diaSemana: true, horaDesde: true, horaHasta: true } as const;
const SELECT_BLOQUEO = { id: true, profesionalId: true, desde: true, hasta: true, motivo: true } as const;

/** Traduce los CHECK de la tabla bloqueo (migración inicial de C-01) a un error conocido. */
function traducirRestriccion(error: unknown): never {
  const texto = error instanceof Error ? error.message : String(error);
  if (texto.includes("bloqueo_motivo_obligatorio")) throw new RestriccionDeBloqueo("motivo");
  if (texto.includes("bloqueo_hasta_posterior_a_desde")) throw new RestriccionDeBloqueo("hasta");
  throw error;
}

function crearRepositorio(db: Cliente): RepositorioHorarios {
  const repo: RepositorioHorarios = {
    async enTransaccion(trabajo) {
      if ("$transaction" in db) return db.$transaction((tx) => trabajo(crearRepositorio(tx)));
      return trabajo(repo); // Ya estamos dentro de una transacción.
    },
    buscarProfesional: (id) => db.profesional.findUnique({ where: { id }, select: { id: true, activo: true } }),
    franjasDelDia: (profesionalId, diaSemana) =>
      db.horarioAtencion.findMany({ where: { profesionalId, diaSemana }, orderBy: { horaDesde: "asc" }, select: SELECT_FRANJA }),
    buscarFranja: (id) => db.horarioAtencion.findUnique({ where: { id }, select: SELECT_FRANJA }),
    crearFranja: (datos): Promise<FranjaGuardada> =>
      db.horarioAtencion.create({
        data: { profesionalId: datos.profesionalId, diaSemana: datos.diaSemana, horaDesde: datos.horaDesde, horaHasta: datos.horaHasta },
        select: SELECT_FRANJA,
      }),
    actualizarFranja: (id, datos): Promise<FranjaGuardada> =>
      db.horarioAtencion.update({
        where: { id },
        data: { profesionalId: datos.profesionalId, diaSemana: datos.diaSemana, horaDesde: datos.horaDesde, horaHasta: datos.horaHasta },
        select: SELECT_FRANJA,
      }),
    async eliminarFranja(id) {
      await db.horarioAtencion.delete({ where: { id } });
    },
    buscarBloqueo: (id) => db.bloqueo.findUnique({ where: { id }, select: SELECT_BLOQUEO }),
    crearBloqueo: (datos): Promise<BloqueoGuardado> =>
      db.bloqueo
        .create({ data: { profesionalId: datos.profesionalId, desde: datos.desde, hasta: datos.hasta, motivo: datos.motivo }, select: SELECT_BLOQUEO })
        .catch(traducirRestriccion),
    actualizarBloqueo: (id, datos): Promise<BloqueoGuardado> =>
      db.bloqueo
        .update({
          where: { id },
          data: { profesionalId: datos.profesionalId, desde: datos.desde, hasta: datos.hasta, motivo: datos.motivo },
          select: SELECT_BLOQUEO,
        })
        .catch(traducirRestriccion),
    async eliminarBloqueo(id) {
      await db.bloqueo.delete({ where: { id } });
    },
    bloqueosEnRango: (profesionalId, inicio, fin) =>
      db.bloqueo.findMany({ where: { profesionalId, desde: { lt: fin }, hasta: { gt: inicio } }, select: { desde: true, hasta: true } }),
    turnosQueOcupanEnRango: (profesionalId, inicio, fin) =>
      db.turno.findMany({
        where: { profesionalId, estado: { in: [...ESTADOS_QUE_OCUPAN_AGENDA] }, inicio: { lt: fin }, fin: { gt: inicio } },
        select: { inicio: true, fin: true, estado: true },
      }),
  };
  return repo;
}

/** Repositorio real de C-04 sobre el único cliente Prisma del proyecto. */
export function repositorioPrisma(): RepositorioHorarios {
  return crearRepositorio(prisma);
}
