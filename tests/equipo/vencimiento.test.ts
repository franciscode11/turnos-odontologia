import { describe, expect, it } from "vitest";
import { estaVencida, vencimientoInvitacion } from "@/domain/equipo/reglas";

const INVITADO_EN = new Date("2026-11-20T13:00:00Z");
const HORA = 60 * 60 * 1000;

describe("vencimiento de la invitación (RN-EQ-04)", () => {
  it("RN-EQ-04 feliz: a los 6 días y 23 horas sigue pendiente", () => {
    expect(estaVencida(INVITADO_EN, new Date(INVITADO_EN.getTime() + (6 * 24 + 23) * HORA))).toBe(false);
  });

  it("RN-EQ-04 borde: exactamente 7 días después está vencida", () => {
    expect(vencimientoInvitacion(INVITADO_EN).toISOString()).toBe("2026-11-27T13:00:00.000Z");
    expect(estaVencida(INVITADO_EN, new Date("2026-11-27T13:00:00Z"))).toBe(true);
  });

  it("RN-EQ-04 error: un milisegundo antes de los 7 días todavía no venció", () => {
    expect(estaVencida(INVITADO_EN, new Date("2026-11-27T12:59:59.999Z"))).toBe(false);
  });

  it("RN-EQ-04 sin fecha de invitación (usuario del seed) no se considera vencida", () => {
    expect(estaVencida(null, new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });
});
