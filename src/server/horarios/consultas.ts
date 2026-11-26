import "server-only";
import { prisma } from "@/server/db";

// Lecturas para la pantalla /configuracion/horarios. La página ya verificó el acceso con accesoPagina.

export type ProfesionalOpcion = { id: string; nombre: string; especialidad: string | null };

/** Profesionales activos (RN-CA-05: un inactivo no se ofrece en el selector). */
export async function profesionalesActivos(): Promise<ProfesionalOpcion[]> {
  const filas = await prisma.profesional.findMany({
    where: { activo: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, apellido: true, especialidad: true },
  });
  return filas.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}`, especialidad: p.especialidad }));
}

/** Franjas semanales de un profesional. */
export function franjasDelProfesional(profesionalId: string) {
  return prisma.horarioAtencion.findMany({
    where: { profesionalId },
    orderBy: [{ diaSemana: "asc" }, { horaDesde: "asc" }],
    select: { id: true, profesionalId: true, diaSemana: true, horaDesde: true, horaHasta: true },
  });
}

/** Bloqueos vigentes o futuros de un profesional (los que terminan después de `desde`). */
export function bloqueosDelProfesional(profesionalId: string, desde: Date) {
  return prisma.bloqueo.findMany({
    where: { profesionalId, hasta: { gt: desde } },
    orderBy: { desde: "asc" },
    select: { id: true, profesionalId: true, desde: true, hasta: true, motivo: true },
  });
}

/** Prestaciones activas, para precargar la duración de la consulta de disponibilidad. */
export function prestacionesActivas() {
  return prisma.prestacion.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, duracionMinutos: true },
  });
}
