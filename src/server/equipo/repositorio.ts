import "server-only";
import { prisma } from "@/server/db";
import type { RepositorioEquipo } from "./tipos";

/** Implementación con Prisma del repositorio de equipo. */

const camposUsuario = { id: true, email: true, rol: true, estado: true, profesionalId: true } as const;

export const repositorioEquipo: RepositorioEquipo = {
  buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email }, select: camposUsuario });
  },
  buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id }, select: camposUsuario });
  },
  contarAdminsActivos() {
    return prisma.usuario.count({ where: { rol: "ADMIN", estado: "ACTIVO" } });
  },
  async buscarProfesional(id) {
    const fila = await prisma.profesional.findUnique({ where: { id }, select: { id: true, usuario: { select: { id: true } } } });
    return fila ? { id: fila.id, usuarioId: fila.usuario?.id ?? null } : null;
  },
  crearInvitado(datos) {
    return prisma.usuario.create({ data: { ...datos, estado: "INVITADO" }, select: camposUsuario });
  },
  async renovarInvitacion(id, invitadoPorId, invitadoEn) {
    await prisma.usuario.update({ where: { id }, data: { invitadoPorId, invitadoEn } });
  },
  cambiarRol(id, rol, profesionalId) {
    return prisma.usuario.update({ where: { id }, data: { rol, profesionalId }, select: camposUsuario });
  },
  cambiarEstado(id, estado) {
    return prisma.usuario.update({ where: { id }, data: { estado }, select: camposUsuario });
  },
  async eliminar(id) {
    await prisma.usuario.delete({ where: { id } });
  },
};
