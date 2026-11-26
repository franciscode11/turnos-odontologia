"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  MOTIVO_CANCELACION_REQUERIDO,
  validarTransicion,
  type DestinoTurno,
} from "@/domain/turnos/estados";
import { requireRol } from "@/server/auth";
import { PERMISOS, type Permiso } from "@/server/auth/matriz";
import { prisma } from "@/server/db";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";

const idTurno = z.uuid();
const motivoCancelacion = z.string({ error: MOTIVO_CANCELACION_REQUERIDO })
  .trim()
  .min(1, MOTIVO_CANCELACION_REQUERIDO);

const permisos = {
  CONFIRMADO: "turnos.confirmar",
  CANCELADO: "turnos.cancelar",
  ATENDIDO: "turnos.marcarAsistencia",
  AUSENTE: "turnos.marcarAsistencia",
} as const satisfies Record<DestinoTurno, Permiso>;

async function cambiarEstado(id: string, destino: DestinoTurno, motivo?: string): Promise<Resultado> {
  return conAcceso(async () => {
    const usuario = await requireRol(PERMISOS[permisos[destino]]);
    const identificador = idTurno.safeParse(id);
    if (!identificador.success) return fallo("El identificador del turno no es válido.");

    let motivoValidado: string | null = null;
    if (destino === "CANCELADO") {
      const validacion = motivoCancelacion.safeParse(motivo);
      if (!validacion.success) {
        return fallo(MOTIVO_CANCELACION_REQUERIDO, { motivo: [MOTIVO_CANCELACION_REQUERIDO] });
      }
      motivoValidado = validacion.data;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({
        where: { id: identificador.data },
        select: { estado: true, inicio: true, profesionalId: true },
      });
      if (!turno) return fallo("No encontramos el turno.");

      const fecha = new Date();
      const esPropio = usuario.profesionalId === turno.profesionalId;
      const error = validarTransicion(turno, destino, usuario.rol, esPropio, fecha, motivoValidado ?? undefined);
      if (error) return fallo(error);

      const actualizacion = await tx.turno.updateMany({
        where: { id: identificador.data, estado: turno.estado, profesionalId: turno.profesionalId, inicio: turno.inicio },
        data: destino === "CANCELADO" ? { estado: destino, motivoCancelacion: motivoValidado } : { estado: destino },
      });
      if (actualizacion.count !== 1) return fallo("El turno cambió. Volvé a abrir el detalle antes de continuar.");

      await tx.historialTurno.create({
        data: {
          turnoId: identificador.data,
          estadoAnterior: turno.estado,
          estadoNuevo: destino,
          motivo: motivoValidado,
          usuarioId: usuario.id,
          fecha,
        },
      });
      return exito(undefined);
    });

    if (resultado.ok) {
      revalidatePath(`/turnos/${identificador.data}`);
      revalidatePath("/turnos");
    }
    return resultado;
  });
}

export async function confirmarTurno(id: string): Promise<Resultado> {
  return cambiarEstado(id, "CONFIRMADO");
}

export async function cancelarTurno(id: string, motivo: string): Promise<Resultado> {
  return cambiarEstado(id, "CANCELADO", motivo);
}

export async function marcarAtendido(id: string): Promise<Resultado> {
  return cambiarEstado(id, "ATENDIDO");
}

export async function marcarAusente(id: string): Promise<Resultado> {
  return cambiarEstado(id, "AUSENTE");
}
