import { describe, expect, it } from "vitest";
import { formatearHora } from "@/domain/shared/fechas";
import { PERMISOS } from "@/server/auth/matriz";
import { ROLES_CONSULTA } from "@/server/horarios/acciones";
import { accionesComo, crearRepositorioEnMemoria, PROF } from "./doble-repositorio";

const LUNES = "2026-11-30";
const memoriaCortez = () =>
  crearRepositorioEnMemoria({
    franjas: [{ id: "f1", profesionalId: PROF.cortez, diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" }],
    turnos: [
      { id: "t1", profesionalId: PROF.cortez, paciente: "Tomás Ferreyra", inicio: new Date("2026-11-30T13:00:00Z"), fin: new Date("2026-11-30T13:30:00Z"), estado: "RESERVADO" },
      { id: "t2", profesionalId: PROF.cortez, paciente: "Sofía Benítez", inicio: new Date("2026-11-30T14:00:00Z"), fin: new Date("2026-11-30T14:30:00Z"), estado: "CANCELADO" },
    ],
  });

describe("Server Action consultarDisponibilidad (RN-HO-04, RN-HO-06, RN-CA-02, RN-CA-05, RN-AU-03)", () => {
  it("RN-HO-06 PROFESIONAL consulta la agenda de un colega: recibe los inicios libres del Dr. Joaquín Cortez", async () => {
    const memoria = memoriaCortez();
    const { acciones } = accionesComo("joaquin.echenagorria@example.com", memoria);
    const r = await acciones.consultarDisponibilidad({ profesionalId: PROF.cortez, fecha: LUNES, duracion: 30 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const horas = r.data.inicios.map(formatearHora);
    // El RESERVADO de 10:00 resta (RN-TU-04); el CANCELADO de 11:00 no.
    expect(horas.filter((h) => h >= "09:35" && h <= "10:25")).toEqual([]);
    expect(horas).toContain("11:00");
    expect(r.data.grupos.map((g) => g.etiqueta)).toEqual(["09:00 - 12:00"]);
    expect(r.data.mensajeVacio).toBeNull();
  });

  it("RN-CA-02 Duración inválida: 7 minutos se rechaza en el campo duración", async () => {
    const memoria = memoriaCortez();
    const { acciones } = accionesComo("octavio.crescini@example.com", memoria);
    const r = await acciones.consultarDisponibilidad({ profesionalId: PROF.cortez, fecha: LUNES, duracion: 7 });
    expect(r).toEqual({
      ok: false,
      error: "La duración debe ser un múltiplo de 5 entre 10 y 240 minutos",
      campos: { duracion: ["La duración debe ser un múltiplo de 5 entre 10 y 240 minutos"] },
    });
  });

  it("RN-CA-05 Profesional inactivo: la acción rechaza con 'El profesional no está activo'", async () => {
    const memoria = memoriaCortez();
    const { acciones } = accionesComo("octavio.crescini@example.com", memoria);
    const r = await acciones.consultarDisponibilidad({ profesionalId: PROF.inactivo, fecha: LUNES, duracion: 30 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("El profesional no está activo");
  });

  it("RN-AU-03 Consulta sin sesión: 'No autenticado' y no lee datos", async () => {
    const memoria = memoriaCortez();
    const { acciones } = accionesComo(null, memoria);
    const r = await acciones.consultarDisponibilidad({ profesionalId: PROF.cortez, fecha: LUNES, duracion: 30 });
    expect(r).toEqual({ ok: false, error: "No autenticado" });
    expect(memoria.registro.lecturas).toBe(0);
  });

  it("RN-HO-04 Profesional que no atiende ese día: el martes 01/12/2026 vuelve vacío con su mensaje", async () => {
    const memoria = memoriaCortez();
    const { acciones } = accionesComo("ulises.lucato@example.com", memoria);
    const r = await acciones.consultarDisponibilidad({ profesionalId: PROF.cortez, fecha: "2026-12-01", duracion: 30 });
    expect(r.ok && r.data).toMatchObject({ inicios: [], mensajeVacio: "El profesional no atiende ese día" });
  });

  it("RN-HO-06: la consulta está abierta a los tres roles, igual que disponibilidad.ver en la matriz", () => {
    expect([...ROLES_CONSULTA]).toEqual([...PERMISOS["disponibilidad.ver"]]);
  });
});
