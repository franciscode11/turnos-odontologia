import { describe, expect, it } from "vitest";
import { formatearHora } from "@/domain/shared/fechas";
import { PERMISOS, puede } from "@/server/auth/matriz";
import { ROLES_EDICION } from "@/server/horarios/acciones";
import { RestriccionDeBloqueo } from "@/server/horarios/tipos";
import { accionesComo, crearRepositorioEnMemoria, PROF } from "./doble-repositorio";

const ADMIN = "francisco.valles@example.com";
const LUNES_9_A_12 = { id: "f1", profesionalId: PROF.lautaro, diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" };
const CONGRESO = {
  id: "b1",
  profesionalId: PROF.lautaro,
  desde: new Date("2026-11-30T13:00:00Z"),
  hasta: new Date("2026-11-30T14:00:00Z"),
  motivo: "Congreso de endodoncia",
};

describe("Server Actions de bloqueos (RN-HO-03, RN-GL-03, RN-HO-06)", () => {
  it("RN-HO-06 ADMIN carga un bloqueo: 'Capacitación' para el Dr. Joaquín Echenagorria se guarda", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.echenagorria, desde: "2026-12-02T09:00", hasta: "2026-12-02T13:00", motivo: "Capacitación" });
    expect(r.ok).toBe(true);
    expect([...memoria.bloqueos.values()]).toMatchObject([{ profesionalId: PROF.echenagorria, motivo: "Capacitación" }]);
  });

  it("RN-HO-03 Bloqueo válido de un día: 30/11/2026 10:00-11:00 queda en la lista con su motivo", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.lautaro, desde: "2026-11-30T10:00", hasta: "2026-11-30T11:00", motivo: "Congreso de endodoncia" });
    expect(r.ok && r.data.motivo).toBe("Congreso de endodoncia");
  });

  it("RN-HO-06 RN-AU-03 PROFESIONAL intenta cargar un bloqueo propio: 'Sin permisos' y no guarda", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo("joaquin.cortez@example.com", memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.cortez, desde: "2026-12-01T09:00", hasta: "2026-12-01T13:00", motivo: "Trámite" });
    expect(r).toEqual({ ok: false, error: "Sin permisos" });
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-HO-03 Bloqueo sin motivo: motivo '   ' se rechaza en el campo motivo y no guarda", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.cortez, desde: "2026-12-01T09:00", hasta: "2026-12-01T13:00", motivo: "   " });
    expect(r).toEqual({ ok: false, error: "El motivo es obligatorio", campos: { motivo: ["El motivo es obligatorio"] } });
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-HO-03 Bloqueo con hasta igual a desde: 01/12/2026 13:00-13:00 se rechaza y no guarda", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.cortez, desde: "2026-12-01T13:00", hasta: "2026-12-01T13:00", motivo: "Trámite personal" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La fecha y hora desde debe ser anterior a la fecha y hora hasta");
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-GL-03 Guardado en UTC: 30/11/2026 10:00-11:00 se guarda como 13:00Z-14:00Z", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    await acciones.crearBloqueo({ profesionalId: PROF.lautaro, desde: "2026-11-30T10:00", hasta: "2026-11-30T11:00", motivo: "Congreso de endodoncia" });
    const [guardado] = [...memoria.bloqueos.values()];
    expect(guardado?.desde.toISOString()).toBe("2026-11-30T13:00:00.000Z");
    expect(guardado?.hasta.toISOString()).toBe("2026-11-30T14:00:00.000Z");
  });

  it("RN-GL-03 RN-TU-01 Bloqueo que termina a la medianoche: hasta 2026-12-01T03:00Z y el 01/12 conserva sus inicios", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [{ id: "f2", profesionalId: PROF.lautaro, diaSemana: 2, horaDesde: "00:00", horaHasta: "02:00" }] });
    const { acciones } = accionesComo(ADMIN, memoria);
    await acciones.crearBloqueo({ profesionalId: PROF.lautaro, desde: "2026-11-30T20:00", hasta: "2026-12-01T00:00", motivo: "Guardia" });
    expect([...memoria.bloqueos.values()][0]?.hasta.toISOString()).toBe("2026-12-01T03:00:00.000Z");
    const consulta = await acciones.consultarDisponibilidad({ profesionalId: PROF.lautaro, fecha: "2026-12-01", duracion: 30 });
    expect(consulta.ok && formatearHora(consulta.data.inicios[0] as Date)).toBe("00:00");
  });

  it("RN-HO-03 RN-HO-04 Modificar el horario de un bloqueo: hasta 12:00 deja de ofrecer inicios que pisen 10:00-12:00", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [LUNES_9_A_12], bloqueos: [CONGRESO] });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.editarBloqueo({
      id: "b1",
      datos: { profesionalId: PROF.lautaro, desde: "2026-11-30T10:00", hasta: "2026-11-30T12:00", motivo: "Congreso de endodoncia" },
    });
    expect(r.ok).toBe(true);
    expect(memoria.bloqueos.get("b1")?.hasta.toISOString()).toBe("2026-11-30T15:00:00.000Z");
    const consulta = await acciones.consultarDisponibilidad({ profesionalId: PROF.lautaro, fecha: "2026-11-30", duracion: 30 });
    const horas = consulta.ok ? consulta.data.inicios.map(formatearHora) : [];
    expect(horas.filter((h) => h > "09:30")).toEqual([]);
    expect(horas.at(-1)).toBe("09:30");
  });

  it("RN-HO-03 Modificación que deja el motivo vacío: se rechaza y el bloqueo conserva su motivo", async () => {
    const memoria = crearRepositorioEnMemoria({ bloqueos: [CONGRESO] });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.editarBloqueo({ id: "b1", datos: { profesionalId: PROF.lautaro, desde: "2026-11-30T10:00", hasta: "2026-11-30T11:00", motivo: "" } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("El motivo es obligatorio");
    expect(memoria.bloqueos.get("b1")?.motivo).toBe("Congreso de endodoncia");
  });

  it("D4 Bloqueo sobre un turno ya reservado: se guarda y el turno de Marina Quiroga sigue RESERVADO", async () => {
    const turno = {
      id: "t1",
      profesionalId: PROF.cortez,
      paciente: "Marina Quiroga",
      inicio: new Date("2026-12-01T13:00:00Z"),
      fin: new Date("2026-12-01T13:30:00Z"),
      estado: "RESERVADO" as const,
    };
    const memoria = crearRepositorioEnMemoria({ turnos: [turno] });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.cortez, desde: "2026-12-01T09:00", hasta: "2026-12-01T12:00", motivo: "Feriado puente" });
    expect(r.ok).toBe(true);
    expect(memoria.turnos).toEqual([turno]);
  });

  it("RN-HO-04 Eliminar un bloqueo: deja de aparecer y esos horarios vuelven a ofrecerse", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [LUNES_9_A_12], bloqueos: [CONGRESO] });
    const { acciones } = accionesComo(ADMIN, memoria);
    expect((await acciones.eliminarBloqueo({ id: "b1" })).ok).toBe(true);
    expect(memoria.bloqueos.size).toBe(0);
    const consulta = await acciones.consultarDisponibilidad({ profesionalId: PROF.lautaro, fecha: "2026-11-30", duracion: 30 });
    expect(consulta.ok && consulta.data.inicios.length).toBe(31);
  });

  it("RN-HO-06 RECEPCION ve la lista de bloqueos sin controles de edición", () => {
    expect(puede("RECEPCION", "bloqueos.ver")).toBe(true);
    expect(puede("RECEPCION", "bloqueos.editar")).toBe(false);
    expect([...ROLES_EDICION]).toEqual([...PERMISOS["bloqueos.editar"]]);
  });

  it("RN-HO-03 borde: si la base rechaza por su CHECK, la acción devuelve el mismo mensaje del dominio", async () => {
    const memoria = crearRepositorioEnMemoria();
    memoria.repo.crearBloqueo = async () => {
      throw new RestriccionDeBloqueo("motivo");
    };
    const { acciones, revalidadas } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearBloqueo({ profesionalId: PROF.cortez, desde: "2026-12-01T09:00", hasta: "2026-12-01T13:00", motivo: "Trámite" });
    expect(r).toEqual({ ok: false, error: "El motivo es obligatorio", campos: { motivo: ["El motivo es obligatorio"] } });
    expect(revalidadas).toEqual([]);
  });
});
