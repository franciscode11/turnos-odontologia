import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calcularHorariosOfrecidos,
  esquemaNuevoTurno,
  validarNuevoTurno,
  type DatosValidacionTurno,
} from "@/domain/turnos/crear-turno";
import { aInstante } from "@/domain/shared/fechas";
import { ESTADOS_QUE_OCUPAN_AGENDA } from "@/domain/shared/estados";
import type { UsuarioSesion } from "@/server/auth/acceso";
import { buscarPacientesParaTurno, consultarHorariosTurno, crearTurno } from "@/server/turnos/crear-turno";

const fecha = "2027-03-01";
const instante = (hora: string) => aInstante(fecha, hora);
const intervalo = (desde: string, hasta: string) => ({ inicio: instante(desde), fin: instante(hasta) });

const pacienteId = "00000000-0000-4000-8000-000000000001";
const profesionalId = "00000000-0000-4000-8000-000000000002";
const prestacionId = "00000000-0000-4000-8000-000000000003";
const sillonId = "00000000-0000-4000-8000-000000000004";
const otroProfesional = "00000000-0000-4000-8000-000000000005";
const otroSillon = "00000000-0000-4000-8000-000000000006";

const solicitud = { pacienteId, profesionalId, prestacionId, sillonId, fecha, hora: "10:00" };
const datos: DatosValidacionTurno = {
  inicio: instante("10:00"),
  ahora: instante("08:00"),
  duracionMinutos: 30,
  profesionalId,
  sillonId,
  activos: { pacienteId: true, profesionalId: true, prestacionId: true, sillonId: true },
  franjas: [intervalo("09:00", "12:00")],
  bloqueos: [],
  turnos: [],
};

describe("Dominio de creación de turnos", () => {
  it("RN-GL-03 rechaza una fecha de calendario inexistente", () => {
    const resultado = esquemaNuevoTurno.safeParse({ ...solicitud, fecha: "2027-02-30" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(resultado.error.issues[0]?.path).toEqual(["fecha"]);
  });

  it.each(["pacienteId", "profesionalId", "prestacionId", "sillonId"] as const)(
    "RN-TU-10 identifica el campo %s cuando la entidad está inactiva o no existe",
    (campo) => {
      const resultado = validarNuevoTurno({ ...datos, activos: { ...datos.activos, [campo]: false } });
      expect(resultado).toMatchObject({ ok: false, campos: { [campo]: [expect.any(String)] } });
    },
  );

  it("RN-TU-07 y RN-GL-03 calculan el fin como instante UTC", () => {
    expect(validarNuevoTurno(datos)).toEqual({ ok: true, fin: new Date("2027-03-01T13:30:00.000Z") });
  });

  it("RN-TU-07 y RN-TU-08 rechazan un turno que termina después de cerrar la franja", () => {
    expect(validarNuevoTurno({ ...datos, inicio: instante("11:45") })).toMatchObject({
      ok: false,
      error: expect.stringContaining("franja"),
    });
  });

  it("RN-TU-07 y RN-TU-08 permiten un turno que termina al cerrar la franja", () => {
    expect(validarNuevoTurno({ ...datos, inicio: instante("11:30") })).toEqual({
      ok: true,
      fin: instante("12:00"),
    });
  });

  it("RN-TU-08 rechaza un turno que se cruza con un bloqueo", () => {
    expect(validarNuevoTurno({
      ...datos,
      inicio: instante("10:15"),
      bloqueos: [intervalo("10:30", "11:00")],
    })).toMatchObject({ ok: false, error: expect.stringContaining("bloqueo") });
  });

  it("RN-TU-09 rechaza un inicio anterior al instante actual", () => {
    expect(validarNuevoTurno({ ...datos, ahora: instante("10:01") })).toMatchObject({
      ok: false,
      error: expect.stringContaining("pasado"),
    });
  });

  it("RN-TU-09 permite un inicio exactamente en el instante actual", () => {
    expect(validarNuevoTurno({ ...datos, ahora: datos.inicio })).toMatchObject({ ok: true });
  });

  it.each(ESTADOS_QUE_OCUPAN_AGENDA)("RN-TU-02, RN-TU-04 y RN-TU-05 rechazan al profesional ocupado (%s)", (estado) => {
    const turno = { ...intervalo("10:00", "10:30"), profesionalId, sillonId: otroSillon, estado };
    expect(validarNuevoTurno({ ...datos, inicio: instante("10:15"), turnos: [turno] })).toMatchObject({
      ok: false,
      error: "El profesional ya tiene un turno en ese horario",
    });
  });

  it("RN-TU-03 y RN-TU-04 rechazan al sillón ocupado por otro profesional", () => {
    const turno = { ...intervalo("10:00", "10:30"), profesionalId: otroProfesional, sillonId, estado: "RESERVADO" } as const;
    expect(validarNuevoTurno({ ...datos, turnos: [turno] })).toMatchObject({
      ok: false,
      error: "El sillón ya está ocupado en ese horario",
    });
  });

  it("RN-TU-01 permite que otro turno empiece exactamente al terminar el anterior", () => {
    const turno = { ...intervalo("10:00", "10:30"), profesionalId, sillonId, estado: "RESERVADO" } as const;
    expect(validarNuevoTurno({ ...datos, inicio: instante("10:30"), turnos: [turno] })).toEqual({
      ok: true,
      fin: instante("11:00"),
    });
  });

  it("RN-TU-04 permite usar el mismo intervalo, profesional y sillón de un turno cancelado", () => {
    const turno = { ...intervalo("10:00", "10:30"), profesionalId, sillonId, estado: "CANCELADO" } as const;
    expect(validarNuevoTurno({ ...datos, turnos: [turno] })).toMatchObject({ ok: true });
  });

  it("RN-HO-04, RN-HO-05 y RN-TU-04 ofrecen horarios de cinco en cinco según duración, bloqueos y agenda", () => {
    const turnos = [
      { ...intervalo("09:00", "09:30"), profesionalId, estado: "CANCELADO" },
      { ...intervalo("11:00", "11:30"), profesionalId, estado: "CONFIRMADO" },
    ] as const;
    expect(calcularHorariosOfrecidos({
      ...datos,
      bloqueos: [intervalo("10:00", "10:30")],
      turnos,
    })).toEqual(["09:00", "09:05", "09:10", "09:15", "09:20", "09:25", "09:30", "10:30", "11:30"]);
  });

  it("RN-HO-04 e IN-05 ofrecen el inicio si solo está ocupado el sillón", () => {
    const turno = { ...intervalo("10:00", "10:30"), profesionalId: otroProfesional, sillonId, estado: "RESERVADO" } as const;
    expect(calcularHorariosOfrecidos({ ...datos, turnos: [turno] })).toContain("10:00");
  });
});

const dobles = vi.hoisted(() => {
  const lecturas = {
    paciente: { findMany: vi.fn(), findUnique: vi.fn() },
    profesional: { findUnique: vi.fn() },
    prestacion: { findUnique: vi.fn() },
    sillon: { findUnique: vi.fn() },
    horarioAtencion: { findMany: vi.fn() },
    bloqueo: { findMany: vi.fn() },
    turno: { findMany: vi.fn() },
  };
  const turno = vi.fn();
  const historial = vi.fn();
  return {
    lecturas,
    turno,
    historial,
    transaccion: vi.fn(),
    obtenerUsuario: vi.fn<() => Promise<UsuarioSesion | null>>(),
    revalidar: vi.fn(),
  };
});

vi.mock("@/server/auth", async () => {
  const { crearControlDeAcceso } = await import("@/server/auth/acceso");
  return crearControlDeAcceso(dobles.obtenerUsuario);
});
vi.mock("@/server/db", () => ({ prisma: { ...dobles.lecturas, $transaction: dobles.transaccion } }));
vi.mock("next/cache", () => ({ revalidatePath: dobles.revalidar }));

const usuario: UsuarioSesion = {
  id: "00000000-0000-4000-8000-000000000007",
  email: "recepcion@example.com",
  nombre: "Recepción de prueba",
  rol: "RECEPCION",
  profesionalId: null,
  avatar: null,
};
const turnoId = "00000000-0000-4000-8000-000000000008";
const paciente = { id: pacienteId, nombre: "Paciente", apellido: "Ficticio", dni: "30999001" };
const horas = { profesionalId, prestacionId, fecha };

describe("Acciones de reserva", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(instante("08:00"));
    dobles.obtenerUsuario.mockResolvedValue(usuario);
    dobles.lecturas.paciente.findMany.mockResolvedValue([paciente]);
    dobles.lecturas.paciente.findUnique.mockResolvedValue({ activo: true });
    dobles.lecturas.profesional.findUnique.mockResolvedValue({ activo: true });
    dobles.lecturas.prestacion.findUnique.mockResolvedValue({ activo: true, duracionMinutos: 30 });
    dobles.lecturas.sillon.findUnique.mockResolvedValue({ activo: true });
    dobles.lecturas.horarioAtencion.findMany.mockResolvedValue([{ horaDesde: "09:00", horaHasta: "12:00" }]);
    dobles.lecturas.bloqueo.findMany.mockResolvedValue([]);
    dobles.lecturas.turno.findMany.mockResolvedValue([]);
    dobles.turno.mockResolvedValue({ id: turnoId });
    const tx = {
      ...dobles.lecturas,
      turno: { ...dobles.lecturas.turno, create: dobles.turno },
      historialTurno: { create: dobles.historial },
    };
    dobles.transaccion.mockImplementation((operacion: (transaccion: typeof tx) => Promise<unknown>) => operacion(tx));
  });

  afterEach(() => vi.useRealTimers());

  it.each(["ADMIN", "RECEPCION"] as const)("RN-TU-12 permite a %s buscar pacientes activos y reservar", async (rol) => {
    dobles.obtenerUsuario.mockResolvedValue({ ...usuario, rol });
    await expect(buscarPacientesParaTurno("Ficticio")).resolves.toMatchObject({
      ok: true,
      data: [{ valor: pacienteId, etiqueta: "Ficticio, Paciente" }],
    });
    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: true, data: { id: turnoId } });
    expect(dobles.lecturas.paciente.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ activo: true }),
    }));
  });

  it.each([
    [{ ...usuario, rol: "PROFESIONAL" as const }, "Sin permisos"],
    [null, "No autenticado"],
  ])("RN-AU-03 y RN-TU-12 deniegan las acciones de reserva: %s", async (sesion, error) => {
    dobles.obtenerUsuario.mockResolvedValue(sesion);
    await expect(buscarPacientesParaTurno("Ficticio")).resolves.toEqual({ ok: false, error });
    await expect(consultarHorariosTurno(horas)).resolves.toEqual({ ok: false, error });
    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: false, error });
    expect(dobles.lecturas.paciente.findMany).not.toHaveBeenCalled();
    expect(dobles.lecturas.profesional.findUnique).not.toHaveBeenCalled();
    expect(dobles.transaccion).not.toHaveBeenCalled();
  });

  it("RN-GL-03 y RN-TU-10 validan la entrada en el servidor antes de consultar", async () => {
    await expect(crearTurno({ ...solicitud, fecha: "2027-02-30" })).resolves.toMatchObject({
      ok: false,
      campos: { fecha: [expect.any(String)] },
    });
    await expect(consultarHorariosTurno({ ...horas, profesionalId: "no-es-un-uuid" })).resolves.toMatchObject({
      ok: false,
    });
    expect(dobles.transaccion).not.toHaveBeenCalled();
    expect(dobles.lecturas.profesional.findUnique).not.toHaveBeenCalled();
  });

  it("RN-TU-10 rechaza una entidad que dejó de estar activa antes de guardar", async () => {
    dobles.lecturas.sillon.findUnique.mockResolvedValue(null);
    await expect(crearTurno(solicitud)).resolves.toMatchObject({
      ok: false,
      campos: { sillonId: [expect.any(String)] },
    });
    expect(dobles.turno).not.toHaveBeenCalled();
  });

  it("RN-HO-04 e IN-05 consultan la agenda del profesional para ofrecer horarios", async () => {
    await expect(consultarHorariosTurno(horas)).resolves.toMatchObject({
      ok: true,
      data: expect.arrayContaining(["10:00", "11:30"]),
    });
    expect(dobles.lecturas.turno.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ profesionalId, estado: { in: [...ESTADOS_QUE_OCUPAN_AGENDA] } }),
    }));
    expect(dobles.lecturas.horarioAtencion.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { profesionalId, diaSemana: 1 },
    }));
    expect(dobles.lecturas.sillon.findUnique).not.toHaveBeenCalled();
  });

  it("RN-TU-07, RN-TU-11 y RN-GL-03 registran en una transacción el turno y su historial en UTC", async () => {
    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: true, data: { id: turnoId } });
    expect(dobles.transaccion).toHaveBeenCalledOnce();
    expect(dobles.turno).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        pacienteId, profesionalId, prestacionId, sillonId,
        inicio: new Date("2027-03-01T13:00:00.000Z"),
        fin: new Date("2027-03-01T13:30:00.000Z"),
        estado: "RESERVADO",
        creadoPorId: usuario.id,
      },
    }));
    expect(dobles.historial).toHaveBeenCalledWith(expect.objectContaining({
      data: { turnoId, estadoAnterior: null, estadoNuevo: "RESERVADO", usuarioId: usuario.id },
    }));
    expect(dobles.revalidar).toHaveBeenCalledWith("/turnos");
  });

  it("RN-TU-11 deja que la transacción revierta el turno si falla el historial", async () => {
    const fallo = new Error("Fallo de historial ficticio");
    const persistidos: string[] = [];
    dobles.historial.mockRejectedValue(fallo);
    dobles.transaccion.mockImplementationOnce(async (operacion) => {
      const pendientes: string[] = [];
      await operacion({
        ...dobles.lecturas,
        turno: { ...dobles.lecturas.turno, create: async () => {
          pendientes.push(turnoId);
          return { id: turnoId };
        } },
        historialTurno: { create: dobles.historial },
      });
      persistidos.push(...pendientes);
    });

    await expect(crearTurno(solicitud)).rejects.toThrow(fallo);
    expect(dobles.historial).toHaveBeenCalledOnce();
    expect(persistidos).toEqual([]);
    expect(dobles.revalidar).not.toHaveBeenCalled();
  });

  it("RN-TU-03 e IN-05 rechazan el sillón ocupado y permiten reintentar en otro a la misma hora", async () => {
    dobles.lecturas.turno.findMany.mockResolvedValueOnce([{
      ...intervalo("10:00", "10:30"), profesionalId: otroProfesional, sillonId, estado: "CONFIRMADO",
    }]);

    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: false, error: "El sillón ya está ocupado en ese horario" });
    expect(dobles.turno).not.toHaveBeenCalled();
    expect(dobles.historial).not.toHaveBeenCalled();

    await expect(crearTurno({ ...solicitud, sillonId: otroSillon })).resolves.toEqual({ ok: true, data: { id: turnoId } });
    expect(dobles.turno).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ sillonId: otroSillon, inicio: instante("10:00") }),
    }));
  });

  it.each([
    ["profesional", "El profesional ya tiene un turno en ese horario"],
    ["sillon", "El sillón ya está ocupado en ese horario"],
  ])("RN-TU-06 traduce 23P01 de %s detectado al escribir", async (recurso, mensaje) => {
    const constraint = `turno_sin_solapamiento_${recurso}`;
    const originalMessage = `conflicting key value violates exclusion constraint "${constraint}"`;
    dobles.turno.mockRejectedValueOnce(Object.assign(new Error(originalMessage), {
      code: "P2039",
      meta: { driverAdapterError: { cause: { kind: "postgres", code: "23P01", originalCode: "23P01", originalMessage } } },
    }));
    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: false, error: mensaje });
    expect(dobles.historial).not.toHaveBeenCalled();
    expect(dobles.revalidar).not.toHaveBeenCalled();
  });

  it("RN-TU-06 traduce también un error PostgreSQL directo con nombre de restricción", async () => {
    dobles.turno.mockRejectedValueOnce(Object.assign(new Error("conflicto"), {
      code: "23P01", constraint: "turno_sin_solapamiento_sillon",
    }));
    await expect(crearTurno(solicitud)).resolves.toEqual({ ok: false, error: "El sillón ya está ocupado en ese horario" });
  });

  it("RN-TU-06 preserva los errores de base ajenos a la exclusión de agenda", async () => {
    const fallo = Object.assign(new Error("Fallo de base ficticio"), { code: "P2004" });
    dobles.turno.mockRejectedValueOnce(fallo);
    await expect(crearTurno(solicitud)).rejects.toThrow(fallo);
  });
});
