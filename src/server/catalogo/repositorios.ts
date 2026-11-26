import "server-only";
import { prisma } from "@/server/db";
import type { DatosPrestacion } from "@/domain/catalogo/esquemas";
import type { Prestacion, Profesional, Sillon } from "@/domain/catalogo/tipos";
import type { RepositorioPrestaciones } from "./prestaciones";
import type { RepositorioProfesionales } from "./profesionales";
import type { RepositorioSillones } from "./sillones";

/** Implementaciones con Prisma de los repositorios del catálogo. */

const camposProfesional = { id: true, nombre: true, apellido: true, matricula: true, especialidad: true, avatar: true, activo: true } as const;
const camposSillon = { id: true, nombre: true, activo: true } as const;
const camposPrestacion = { id: true, nombre: true, duracionMinutos: true, precioReferencia: true, activo: true } as const;

type FilaPrestacion = {
  id: string;
  nombre: string;
  duracionMinutos: number;
  precioReferencia: { toNumber(): number } | null;
  activo: boolean;
};

function aPrestacion(fila: FilaPrestacion): Prestacion {
  return { ...fila, precioReferencia: fila.precioReferencia ? fila.precioReferencia.toNumber() : null };
}

/** El precio se guarda como texto decimal para no perder precisión en Decimal(12,2). */
function datosPrestacionParaPrisma(datos: DatosPrestacion) {
  return {
    nombre: datos.nombre,
    duracionMinutos: datos.duracionMinutos,
    precioReferencia: datos.precioReferencia === null ? null : datos.precioReferencia.toFixed(2),
  };
}

/** Prisma lanza P2025 cuando el registro a actualizar no existe. */
async function oNull<T>(promesa: Promise<T>): Promise<T | null> {
  try {
    return await promesa;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return null;
    throw error;
  }
}

export const repositorioPrestaciones: RepositorioPrestaciones = {
  async crear(datos) {
    return aPrestacion(await prisma.prestacion.create({ data: datosPrestacionParaPrisma(datos), select: camposPrestacion }));
  },
  async actualizar(id, datos) {
    const fila = await oNull(prisma.prestacion.update({ where: { id }, data: datosPrestacionParaPrisma(datos), select: camposPrestacion }));
    return fila ? aPrestacion(fila) : null;
  },
  async cambiarActivo(id, activo) {
    const fila = await oNull(prisma.prestacion.update({ where: { id }, data: { activo }, select: camposPrestacion }));
    return fila ? aPrestacion(fila) : null;
  },
};

export const repositorioProfesionales: RepositorioProfesionales = {
  buscarPorMatricula(matricula) {
    return prisma.profesional.findMany({
      where: { matricula: { equals: matricula, mode: "insensitive" } },
      select: { id: true, matricula: true },
    });
  },
  crear(datos) {
    return prisma.profesional.create({ data: datos, select: camposProfesional });
  },
  actualizar(id, datos) {
    return oNull(prisma.profesional.update({ where: { id }, data: datos, select: camposProfesional }));
  },
  cambiarActivo(id, activo) {
    return oNull(prisma.profesional.update({ where: { id }, data: { activo }, select: camposProfesional }));
  },
};

export const repositorioSillones: RepositorioSillones = {
  buscarPorNombre(nombre) {
    return prisma.sillon.findMany({
      where: { nombre: { equals: nombre, mode: "insensitive" } },
      select: { id: true, nombre: true },
    });
  },
  crear(datos) {
    return prisma.sillon.create({ data: datos, select: camposSillon });
  },
  actualizar(id, datos) {
    return oNull(prisma.sillon.update({ where: { id }, data: datos, select: camposSillon }));
  },
  cambiarActivo(id, activo) {
    return oNull(prisma.sillon.update({ where: { id }, data: { activo }, select: camposSillon }));
  },
};

/** Listados para las pantallas (todos los roles consultan, RN-CA-06). */
export async function listarProfesionales(): Promise<Profesional[]> {
  return prisma.profesional.findMany({ select: camposProfesional, orderBy: [{ apellido: "asc" }, { nombre: "asc" }] });
}

export async function listarPrestaciones(): Promise<Prestacion[]> {
  const filas = await prisma.prestacion.findMany({ select: camposPrestacion, orderBy: { nombre: "asc" } });
  return filas.map(aPrestacion);
}

export async function listarSillones(): Promise<Sillon[]> {
  return prisma.sillon.findMany({ select: camposSillon, orderBy: { nombre: "asc" } });
}
