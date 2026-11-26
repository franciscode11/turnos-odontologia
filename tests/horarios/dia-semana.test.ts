import { afterEach, describe, expect, it } from "vitest";
import { diaSemanaIso } from "@/domain/shared/fechas";
import { atiendeEseDia } from "@/domain/horarios/disponibilidad";

// C-01 ya expone diaSemanaIso en src/domain/shared/fechas.ts: C-04 lo reutiliza (no crea dia-semana.ts).
const TZ_ORIGINAL = process.env.TZ;
afterEach(() => {
  process.env.TZ = TZ_ORIGINAL;
});

describe.each(["UTC", "Europe/Madrid", "America/Argentina/Buenos_Aires"])("día de la semana con el proceso en %s (RN-GL-03)", (zona) => {
  it("RN-GL-03: 30/11/2026 es lunes (1) y 01/12/2026 es martes (2)", () => {
    process.env.TZ = zona;
    expect(diaSemanaIso("2026-11-30")).toBe(1);
    expect(diaSemanaIso("2026-12-01")).toBe(2);
    expect(diaSemanaIso("2026-12-06")).toBe(7);
  });

  it("RN-HO-04 Profesional que no atiende ese día: con franjas solo los lunes, el martes 01/12/2026 no atiende", () => {
    process.env.TZ = zona;
    const franjas = [{ diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" }];
    expect(atiendeEseDia(franjas, "2026-11-30")).toBe(true);
    expect(atiendeEseDia(franjas, "2026-12-01")).toBe(false);
  });
});
