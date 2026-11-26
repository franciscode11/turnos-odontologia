import "server-only";
import { ordenarMiembros } from "@/domain/equipo/presentacion";
import { prisma } from "@/server/db";
import type { Miembro, OpcionProfesional } from "./tipos";

/** Personas del consultorio para la tabla de /equipo (solo la llama la página, que ya exige ADMIN). */
export async function listarMiembros(): Promise<Miembro[]> {
  const filas = await prisma.usuario.findMany({
    select: {
      id: true, email: true, nombre: true, rol: true, estado: true, avatar: true,
      invitadoEn: true, ultimoIngreso: true, profesionalId: true,
      profesional: { select: { nombre: true, apellido: true } },
    },
  });
  return ordenarMiembros(
    filas.map(({ profesional, ...fila }) => ({ ...fila, profesional: profesional ? `${profesional.nombre} ${profesional.apellido}` : null })),
  );
}

/** Profesionales activos para el selector de vínculo (RN-EQ-03), con su usuario si ya tienen. */
export async function profesionalesParaVincular(): Promise<OpcionProfesional[]> {
  const filas = await prisma.profesional.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, matricula: true, usuario: { select: { id: true } } },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });
  return filas.map((p) => ({ id: p.id, etiqueta: `${p.nombre} ${p.apellido}, ${p.matricula}`, usuarioId: p.usuario?.id ?? null }));
}
