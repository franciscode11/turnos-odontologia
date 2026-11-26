import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PaginaTurnosDetalle from "@/app/(panel)/turnos/[id]/page";
import { ocupaAgenda } from "@/domain/shared/estados";
import { accionesDisponibles, transicionValida, validarTransicion } from "@/domain/turnos/estados";
import { cancelarTurno, confirmarTurno, marcarAtendido, marcarAusente } from "@/server/turnos/estados-turno";

const db = vi.hoisted(() => ({
  turno: { findUnique: vi.fn(), updateMany: vi.fn() },
  historialTurno: { create: vi.fn() },
  transaccion: vi.fn(),
  usuario: vi.fn(),
  accesoPagina: vi.fn(),
  revalidar: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: { $transaction: db.transaccion, turno: db.turno },
}));
vi.mock("@/server/auth", async () => {
  const { crearControlDeAcceso } = await import("@/server/auth/acceso");
  return crearControlDeAcceso(db.usuario);
});
vi.mock("@/server/auth/pagina", () => ({ accesoPagina: db.accesoPagina }));
vi.mock("next/cache", () => ({ revalidatePath: db.revalidar }));

const inicio = new Date("2026-11-25T13:00:00.000Z");
const antes = new Date(inicio.getTime() - 1);
const reservado = { estado: "RESERVADO", inicio } as const;
const confirmado = { estado: "CONFIRMADO", inicio } as const;

describe("C-06: estados del turno", () => {
  it("RN-ES-01: permite la confirmación desde reservado", () => {
    expect(transicionValida("RESERVADO", "CONFIRMADO")).toBe(true);
  });

  it("RN-ES-01/02: rechaza confirmar dos veces y cambiar estados finales", () => {
    expect(transicionValida("CONFIRMADO", "CONFIRMADO")).toBe(false);
    expect(transicionValida("RESERVADO", "RESERVADO")).toBe(false);
    for (const estado of ["CANCELADO", "ATENDIDO", "AUSENTE"] as const) {
      expect(transicionValida(estado, "CONFIRMADO")).toBe(false);
      expect(validarTransicion({ estado, inicio }, "CANCELADO", "ADMIN", false, inicio, "Motivo válido"))
        .toBe("El turno está en un estado final.");
    }
  });

  it("RN-ES-03/04: acepta cancelar antes del inicio y libera el horario", () => {
    expect(validarTransicion(reservado, "CANCELADO", "RECEPCION", false, antes, "Paciente avisó")).toBeNull();
    expect(ocupaAgenda(reservado.estado)).toBe(true);
    expect(ocupaAgenda("CANCELADO")).toBe(false);
  });

  it.each([undefined, "", " \t "])("RN-ES-03: rechaza el motivo %j", (motivo) => {
    expect(validarTransicion(confirmado, "CANCELADO", "ADMIN", false, inicio, motivo))
      .toBe("Ingresá el motivo de la cancelación.");
  });

  it.each(["ATENDIDO", "AUSENTE"] as const)("RN-ES-05: %s se permite desde el instante de inicio", (destino) => {
    expect(validarTransicion(reservado, destino, "PROFESIONAL", true, antes))
      .toBe("El turno todavía no empezó.");
    expect(validarTransicion(reservado, destino, "PROFESIONAL", true, inicio)).toBeNull();
    expect(validarTransicion(confirmado, destino, "ADMIN", false, inicio)).toBeNull();
  });

  it("RN-ES-07: un profesional ajeno y recepción no registran asistencia", () => {
    expect(validarTransicion(confirmado, "ATENDIDO", "PROFESIONAL", false, inicio)).toBe("Sin permisos");
    expect(validarTransicion(confirmado, "AUSENTE", "RECEPCION", true, inicio)).toBe("Sin permisos");
    expect(validarTransicion(reservado, "CONFIRMADO", "PROFESIONAL", true, inicio)).toBe("Sin permisos");
  });

  it("US-050: lista solo las acciones válidas para el rol, el estado y el horario", () => {
    expect(accionesDisponibles(reservado, "RECEPCION", false, inicio)).toEqual(["CONFIRMADO", "CANCELADO"]);
    expect(accionesDisponibles(confirmado, "ADMIN", false, antes)).toEqual(["CANCELADO"]);
    expect(accionesDisponibles(confirmado, "PROFESIONAL", true, inicio)).toEqual(["ATENDIDO", "AUSENTE"]);
    expect(accionesDisponibles(confirmado, "PROFESIONAL", false, inicio)).toEqual([]);
    expect(accionesDisponibles({ estado: "CANCELADO", inicio }, "ADMIN", true, inicio)).toEqual([]);
  });
});

describe("C-06: detalle del turno", () => {
  const id = "4396cc1d-20bc-4c73-ab1b-385ee23fc591";
  const turno = {
    id, estado: "RESERVADO", inicio,
    fin: new Date("2026-11-25T13:30:00.000Z"),
    profesionalId: "profesional-ficticio",
    motivoCancelacion: null,
    paciente: { nombre: "Paciente", apellido: "De Prueba" },
    profesional: { nombre: "Profesional", apellido: "De Prueba" },
    prestacion: { nombre: "Control" },
    sillon: { nombre: "Consultorio 1" },
    historial: [{
      id: "registro-ficticio", estadoAnterior: null, estadoNuevo: "RESERVADO", motivo: null,
      fecha: inicio, usuario: { nombre: "Recepción de prueba", email: "recepcion@example.com" },
    }],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    db.accesoPagina.mockResolvedValue({ permitido: true, usuario: { rol: "RECEPCION", profesionalId: null } });
    db.turno.findUnique.mockResolvedValue(turno);
  });

  it("US-050: muestra el turno, su historial, las acciones de recepción y la hora argentina", async () => {
    const pagina = await PaginaTurnosDetalle({ params: Promise.resolve({ id }) });
    const html = renderToStaticMarkup(pagina);
    expect(html).toContain("Paciente De Prueba");
    expect(html).toContain("10:00");
    expect(html).toContain("Recepción de prueba");
    expect(html).toContain("Confirmar turno");
    expect(html).toContain("Cancelar turno");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain("Marcar atendido");
  });

  it("US-050: conserva el motivo del turno cancelado y oculta todas las acciones", async () => {
    db.turno.findUnique.mockResolvedValue({
      ...turno, estado: "CANCELADO", motivoCancelacion: "Reagenda fuera del sistema",
    });
    const html = renderToStaticMarkup(await PaginaTurnosDetalle({ params: Promise.resolve({ id }) }));
    expect(html).toContain("Cancelado");
    expect(html).toContain("Reagenda fuera del sistema");
    expect(html).not.toContain('aria-label="Acciones del turno"');
  });

  it("US-050: el profesional propio ve asistencia y el ajeno no recibe acciones", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: inicio });
    try {
      db.accesoPagina
        .mockResolvedValueOnce({ permitido: true, usuario: { rol: "PROFESIONAL", profesionalId: turno.profesionalId } })
        .mockResolvedValueOnce({ permitido: true, usuario: { rol: "PROFESIONAL", profesionalId: "otro-profesional" } });
      const props = { params: Promise.resolve({ id }) };
      const propio = renderToStaticMarkup(await PaginaTurnosDetalle(props));
      const ajeno = renderToStaticMarkup(await PaginaTurnosDetalle(props));
      expect(propio).toContain("Marcar atendido");
      expect(propio).toContain("Marcar ausente");
      expect(propio).not.toContain("Cancelar turno");
      expect(ajeno).not.toContain('aria-label="Acciones del turno"');
    } finally {
      vi.useRealTimers();
    }
  });

  it("RN-AU-04: comprueba el acceso antes de consultar los datos del turno", async () => {
    db.accesoPagina.mockResolvedValue({ permitido: false });
    const html = renderToStaticMarkup(await PaginaTurnosDetalle({ params: Promise.resolve({ id }) }));
    expect(html).toContain("No tenés permisos");
    expect(db.turno.findUnique).not.toHaveBeenCalled();
  });

  it("responde 404 para un identificador inválido o un turno inexistente", async () => {
    await expect(PaginaTurnosDetalle({ params: Promise.resolve({ id: "inválido" }) })).rejects.toThrow(/404/);
    expect(db.turno.findUnique).not.toHaveBeenCalled();
    db.turno.findUnique.mockResolvedValue(null);
    await expect(PaginaTurnosDetalle({ params: Promise.resolve({ id }) })).rejects.toThrow(/404/);
  });
});

describe("C-06: acciones de servidor", () => {
  const id = "4396cc1d-20bc-4c73-ab1b-385ee23fc591";
  const profesionalId = "41b196fc-bafe-4ebb-a7e0-5fc4a879a28e";
  const recepcion = { id: "usuario-ficticio", rol: "RECEPCION", profesionalId: null };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ["Date"], now: inicio });
    db.usuario.mockResolvedValue(recepcion);
    db.turno.findUnique.mockResolvedValue({ ...reservado, profesionalId });
    db.turno.updateMany.mockResolvedValue({ count: 1 });
    db.transaccion.mockImplementation(async (operar) => operar({
      turno: db.turno,
      historialTurno: db.historialTurno,
    }));
  });
  afterEach(() => vi.useRealTimers());

  it("RN-ES-06: confirma y registra los estados y el autor dentro de la transacción", async () => {
    expect(await confirmarTurno(id)).toMatchObject({ ok: true });
    expect(db.transaccion).toHaveBeenCalledOnce();
    expect(db.turno.updateMany).toHaveBeenCalledWith({
      where: { id, estado: "RESERVADO", profesionalId, inicio },
      data: { estado: "CONFIRMADO" },
    });
    expect(db.historialTurno.create).toHaveBeenCalledWith({
      data: {
        turnoId: id, estadoAnterior: "RESERVADO", estadoNuevo: "CONFIRMADO",
        usuarioId: recepcion.id, motivo: null, fecha: inicio,
      },
    });
    expect(db.revalidar).toHaveBeenCalledWith(`/turnos/${id}`);
    expect(db.revalidar).toHaveBeenCalledWith("/turnos");
  });

  it("RN-ES-03/06: cancela con el motivo normalizado y agrega el historial", async () => {
    db.turno.findUnique.mockResolvedValue({ ...confirmado, profesionalId });
    expect(await cancelarTurno(id, "  Paciente avisó  ")).toMatchObject({ ok: true });
    expect(db.turno.updateMany).toHaveBeenCalledWith({
      where: { id, estado: "CONFIRMADO", profesionalId, inicio },
      data: { estado: "CANCELADO", motivoCancelacion: "Paciente avisó" },
    });
    expect(db.historialTurno.create).toHaveBeenCalledWith({
      data: {
        turnoId: id, estadoAnterior: "CONFIRMADO", estadoNuevo: "CANCELADO",
        usuarioId: recepcion.id, motivo: "Paciente avisó", fecha: inicio,
      },
    });
  });

  it("RN-ES-03: devuelve el error de campo sin acceder a la base si falta motivo", async () => {
    expect(await cancelarTurno(id, " ")).toMatchObject({
      ok: false, campos: { motivo: ["Ingresá el motivo de la cancelación."] },
    });
    expect(db.transaccion).not.toHaveBeenCalled();
  });

  it.each([["ATENDIDO", marcarAtendido], ["AUSENTE", marcarAusente]] as const)(
    "RN-ES-05/07: el profesional puede marcar %s en su turno desde el inicio",
    async (estado, accion) => {
      db.usuario.mockResolvedValue({ ...recepcion, rol: "PROFESIONAL", profesionalId });
      vi.setSystemTime(antes);
      expect(await accion(id)).toEqual({ ok: false, error: "El turno todavía no empezó." });
      expect(db.turno.updateMany).not.toHaveBeenCalled();
      vi.setSystemTime(inicio);
      expect(await accion(id)).toMatchObject({ ok: true });
      expect(db.historialTurno.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ estadoNuevo: estado, fecha: inicio }),
      });
    },
  );

  it("RN-AU-04/05 y RN-ES-07: rechaza solicitudes directas sin sesión, con rol incorrecto o UUID inválido", async () => {
    db.usuario.mockResolvedValueOnce(null);
    expect(await confirmarTurno(id)).toEqual({ ok: false, error: "No autenticado" });
    expect(await marcarAusente(id)).toEqual({ ok: false, error: "Sin permisos" });
    expect(await confirmarTurno("no-es-uuid")).toEqual({ ok: false, error: "El identificador del turno no es válido." });
    expect(db.transaccion).not.toHaveBeenCalled();
  });

  it("RN-ES-07: el profesional ajeno no cambia el estado del turno", async () => {
    db.usuario.mockResolvedValue({ ...recepcion, rol: "PROFESIONAL", profesionalId: "profesional-ajeno" });
    expect(await marcarAtendido(id)).toEqual({ ok: false, error: "Sin permisos" });
    expect(db.turno.updateMany).not.toHaveBeenCalled();
    expect(db.historialTurno.create).not.toHaveBeenCalled();
  });

  it("RN-ES-02: cancelar un turno final no crea una entrada", async () => {
    db.turno.findUnique.mockResolvedValue({ estado: "ATENDIDO", inicio, profesionalId });
    expect(await cancelarTurno(id, "Motivo")).toEqual({ ok: false, error: "El turno está en un estado final." });
    expect(db.turno.updateMany).not.toHaveBeenCalled();
    expect(db.historialTurno.create).not.toHaveBeenCalled();
  });

  it("RN-ES-06: una escritura simultánea que ganó la carrera no se pisa", async () => {
    db.turno.updateMany.mockResolvedValue({ count: 0 });
    expect(await confirmarTurno(id)).toMatchObject({ ok: false, error: expect.stringContaining("El turno cambió") });
    expect(db.historialTurno.create).not.toHaveBeenCalled();
    expect(db.revalidar).not.toHaveBeenCalled();
  });

  it("RN-ES-06: el fallo del historial aborta la transacción y no revalida", async () => {
    db.historialTurno.create.mockRejectedValue(new Error("falló el historial"));
    await expect(confirmarTurno(id)).rejects.toThrow("falló el historial");
    expect(db.transaccion).toHaveBeenCalledOnce();
    expect(db.turno.updateMany).toHaveBeenCalledOnce();
    expect(db.revalidar).not.toHaveBeenCalled();
  });
});
