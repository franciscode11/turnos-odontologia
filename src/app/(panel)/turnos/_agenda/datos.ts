import "server-only";
import type { EstadoTurno } from "@/domain/shared/estados";
import { diaSemanaIso, rangoDelDia } from "@/domain/shared/fechas";
import { prisma } from "@/server/db";

export type TurnoAgenda = {
  id: string;
  inicio: Date;
  fin: Date;
  estado: EstadoTurno;
  paciente: { nombre: string; apellido: string; avatar: string | null };
  prestacion: string;
  sillon: string;
  profesional: string;
};

export type ColumnaAgenda = {
  id: string;
  nombre: string;
  especialidad: string | null;
  avatar: string | null;
  franjas: { horaDesde: string; horaHasta: string }[];
  bloqueos: { desde: Date; hasta: Date; motivo: string }[];
  turnos: TurnoAgenda[];
};

/** Turnos del día por profesional activo (solo lectura, spec agenda-del-dia). */
export async function cargarAgenda(fecha: string): Promise<ColumnaAgenda[]> {
  const { inicio, fin } = rangoDelDia(fecha);
  const profesionales = await prisma.profesional.findMany({
    where: { activo: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      apellido: true,
      especialidad: true,
      avatar: true,
      usuario: { select: { avatar: true } },
      horarios: { where: { diaSemana: diaSemanaIso(fecha) }, orderBy: { horaDesde: "asc" }, select: { horaDesde: true, horaHasta: true } },
      bloqueos: { where: { desde: { lt: fin }, hasta: { gt: inicio } }, select: { desde: true, hasta: true, motivo: true } },
      turnos: {
        where: { inicio: { gte: inicio, lt: fin } },
        orderBy: { inicio: "asc" },
        select: {
          id: true,
          inicio: true,
          fin: true,
          estado: true,
          paciente: { select: { nombre: true, apellido: true, avatar: true } },
          prestacion: { select: { nombre: true } },
          sillon: { select: { nombre: true } },
        },
      },
    },
  });

  return profesionales.map((p) => {
    const nombre = `${p.nombre} ${p.apellido}`;
    return {
      id: p.id,
      nombre,
      especialidad: p.especialidad,
      avatar: p.avatar ?? p.usuario?.avatar ?? null,
      franjas: p.horarios,
      bloqueos: p.bloqueos,
      turnos: p.turnos.map((t) => ({
        id: t.id,
        inicio: t.inicio,
        fin: t.fin,
        estado: t.estado,
        paciente: t.paciente,
        prestacion: t.prestacion.nombre,
        sillon: t.sillon.nombre,
        profesional: nombre,
      })),
    };
  });
}
