import "server-only";
import type { DatosPaciente } from "@/domain/pacientes/esquemas";
import type { CriterioPacientes, Paciente } from "@/domain/pacientes/tipos";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import type { RepositorioPacientes } from "./servicio";

const CAMPOS = {
  id: true,
  nombre: true,
  apellido: true,
  dni: true,
  fechaNacimiento: true,
  telefono: true,
  email: true,
  obraSocial: true,
  numeroAfiliado: true,
  avatar: true,
} as const;
const TAMANO_PAGINA = 20;

function aPaciente(fila: Omit<Paciente, "fechaNacimiento"> & { fechaNacimiento: Date }): Paciente {
  // Prisma usa medianoche UTC para DATE. Mantener el día de calendario al serializar.
  return { ...fila, fechaNacimiento: fila.fechaNacimiento.toISOString().slice(0, 10) };
}

function paraPrisma(datos: DatosPaciente) {
  return { ...datos, fechaNacimiento: new Date(`${datos.fechaNacimiento}T00:00:00.000Z`) };
}

function filtroActivo(criterio: CriterioPacientes): Prisma.PacienteWhereInput {
  if (!criterio) return { activo: true };
  if ("dni" in criterio) return { activo: true, dni: criterio.dni };
  // Prisma utiliza ILIKE para contains. Los comodines del texto son literales.
  const apellido = criterio.apellido.replace(/[\\%_]/g, "\\$&");
  return { activo: true, apellido: { contains: apellido, mode: "insensitive" } };
}

export const repositorioPacientes: RepositorioPacientes = {
  async crear(datos) {
    return aPaciente(await prisma.paciente.create({ data: paraPrisma(datos), select: CAMPOS }));
  },
  async editar(id, datos) {
    try {
      const fila = await prisma.paciente.update({
        where: { id, activo: true },
        data: paraPrisma(datos),
        select: CAMPOS,
      });
      return aPaciente(fila);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return null;
      throw error;
    }
  },
  async darDeBaja(id) {
    const { count } = await prisma.paciente.updateMany({
      where: { id, activo: true },
      data: { activo: false },
    });
    return count === 1;
  },
  buscar(criterio, paginaSolicitada) {
    const where = filtroActivo(criterio);
    return prisma.$transaction(async (tx) => {
      const total = await tx.paciente.count({ where });
      const paginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA));
      const pagina = Math.min(paginaSolicitada, paginas);
      const filas = await tx.paciente.findMany({
        where,
        orderBy: [{ apellido: "asc" }, { nombre: "asc" }, { id: "asc" }],
        skip: (pagina - 1) * TAMANO_PAGINA,
        take: TAMANO_PAGINA,
        select: CAMPOS,
      });
      return { pacientes: filas.map(aPaciente), pagina, paginas };
    }, { isolationLevel: "RepeatableRead" });
  },
};
