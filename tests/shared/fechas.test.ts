import { describe, expect, it } from "vitest";
import {
  aInstante,
  esFechaValida,
  fechaLocal,
  formatearFecha,
  formatearHora,
  rangoDelDia,
  sumarDias,
} from "@/domain/shared/fechas";

describe("fechas en hora de Argentina (RN-GL-03)", () => {
  it("RN-GL-03 feliz: las 09:00 del 25/11/2026 en Argentina se guardan como 12:00 UTC", () => {
    expect(aInstante("2026-11-25", "09:00").toISOString()).toBe("2026-11-25T12:00:00.000Z");
  });

  it("RN-GL-03 borde: las 22:30 del 25/11/2026 en Argentina son el 26/11 a la 01:30 UTC", () => {
    expect(aInstante("2026-11-25", "22:30").toISOString()).toBe("2026-11-26T01:30:00.000Z");
  });

  it("RN-GL-03: la conversión no depende de la zona del proceso (los tests corren con TZ=UTC y TZ=Europe/Madrid en CI)", () => {
    expect(aInstante("2026-07-01", "09:00").toISOString()).toBe("2026-07-01T12:00:00.000Z");
  });

  it("RN-GL-03 feliz: muestra 2026-11-25T12:00Z como 25/11/2026 09:00", () => {
    const instante = new Date("2026-11-25T12:00:00Z");
    expect(formatearFecha(instante)).toBe("25/11/2026");
    expect(formatearHora(instante)).toBe("09:00");
  });

  it("RN-GL-03 borde: 2026-11-26T01:30Z se muestra como 25/11/2026 22:30", () => {
    const instante = new Date("2026-11-26T01:30:00Z");
    expect(formatearFecha(instante)).toBe("25/11/2026");
    expect(formatearHora(instante)).toBe("22:30");
    expect(fechaLocal(instante)).toBe("2026-11-25");
  });

  it("rango del día 25/11/2026 = [03:00Z del 25, 03:00Z del 26)", () => {
    const { inicio, fin } = rangoDelDia("2026-11-25");
    expect(inicio.toISOString()).toBe("2026-11-25T03:00:00.000Z");
    expect(fin.toISOString()).toBe("2026-11-26T03:00:00.000Z");
  });

  it("un turno a las 23:30 pertenece al día y uno a las 00:00 del siguiente no", () => {
    const { inicio, fin } = rangoDelDia("2026-11-25");
    const t2330 = aInstante("2026-11-25", "23:30");
    const t0000 = aInstante("2026-11-26", "00:00");
    expect(t2330 >= inicio && t2330 < fin).toBe(true);
    expect(t0000 >= inicio && t0000 < fin).toBe(false);
  });

  it("valida fechas AAAA-MM-DD y rechaza las imposibles", () => {
    expect(esFechaValida("2026-11-25")).toBe(true);
    expect(esFechaValida("2026-13-45")).toBe(false);
    expect(esFechaValida("2026-02-30")).toBe(false);
    expect(esFechaValida("25/11/2026")).toBe(false);
  });

  it("suma días a una fecha local, cruzando meses", () => {
    expect(sumarDias("2026-11-30", 1)).toBe("2026-12-01");
    expect(sumarDias("2026-11-25", -1)).toBe("2026-11-24");
  });

  it("aInstante rechaza fechas u horas inválidas", () => {
    expect(() => aInstante("2026-13-45", "09:00")).toThrow();
    expect(() => aInstante("2026-11-25", "25:00")).toThrow();
  });
});

describe("fecha larga y día de la semana (agenda)", () => {
  it("el 25/11/2026 es miércoles (ISO 3) y se muestra 'Miércoles 25 de noviembre'", async () => {
    const { diaSemanaIso, formatearFechaLarga } = await import("@/domain/shared/fechas");
    expect(diaSemanaIso("2026-11-25")).toBe(3);
    expect(formatearFechaLarga("2026-11-25")).toBe("Miércoles 25 de noviembre");
  });

  it("borde: el domingo es 7 y el lunes es 1", async () => {
    const { diaSemanaIso } = await import("@/domain/shared/fechas");
    expect(diaSemanaIso("2026-11-29")).toBe(7);
    expect(diaSemanaIso("2026-11-30")).toBe(1);
  });
});
