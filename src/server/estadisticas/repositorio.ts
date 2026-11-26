import "server-only";
import type { DatosEstadisticas } from "@/domain/estadisticas/reporte";
import { prisma } from "@/server/db";
import type { RepositorioEstadisticas } from "./consulta";

/**
 * Lecturas Prisma de C-08: solo `findMany` con `select` mínimo, sin escrituras (RN-ST-07).
 * Las franjas son las vigentes de los profesionales activos (design D3): un inactivo no ofrece
 * agenda (RN-CA-05), pero sus turnos del período sí cuentan.
 */
async function leerDatos({ inicio, fin }: { inicio: Date; fin: Date }): Promise<DatosEstadisticas> {
  const [turnos, franjas, bloqueos, profesionales, prestaciones] = await Promise.all([
    prisma.turno.findMany({
      where: { inicio: { gte: inicio, lt: fin } },
      select: { id: true, inicio: true, fin: true, estado: true, profesionalId: true, prestacionId: true, motivoCancelacion: true },
    }),
    prisma.horarioAtencion.findMany({
      where: { profesional: { activo: true } },
      select: { profesionalId: true, diaSemana: true, horaDesde: true, horaHasta: true },
    }),
    prisma.bloqueo.findMany({
      where: { desde: { lt: fin }, hasta: { gt: inicio }, profesional: { activo: true } },
      select: { profesionalId: true, desde: true, hasta: true },
    }),
    prisma.profesional.findMany({
      where: { OR: [{ activo: true }, { turnos: { some: { inicio: { gte: inicio, lt: fin } } } }] },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, apellido: true, especialidad: true, avatar: true, activo: true, usuario: { select: { avatar: true } } },
    }),
    prisma.prestacion.findMany({ select: { id: true, nombre: true } }),
  ]);

  return {
    turnos,
    franjas,
    bloqueos,
    profesionales: profesionales.map((p) => ({
      id: p.id,
      nombre: `${p.nombre} ${p.apellido}`,
      especialidad: p.especialidad,
      avatar: p.avatar ?? p.usuario?.avatar ?? null,
      activo: p.activo,
    })),
    prestaciones,
  };
}

export function repositorioPrisma(): RepositorioEstadisticas {
  return { leerDatos };
}
