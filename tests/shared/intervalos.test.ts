import { describe, expect, it } from "vitest";
import { seSuperponen } from "@/domain/shared/intervalos";

// Instantes en hora de Argentina (UTC-3) del 25/11/2026.
const h = (hora: string) => new Date(`2026-11-25T${hora}:00-03:00`);
const intervalo = (desde: string, hasta: string) => ({ inicio: h(desde), fin: h(hasta) });

describe("seSuperponen (RN-TU-01, intervalos [inicio, fin))", () => {
  it("RN-TU-01 feliz: 09:00-09:30 y 09:15-10:00 se superponen", () => {
    expect(seSuperponen(intervalo("09:00", "09:30"), intervalo("09:15", "10:00"))).toBe(true);
  });

  it("RN-TU-01 borde: 09:00-09:30 y 09:30-10:00 solo se tocan y no se superponen", () => {
    expect(seSuperponen(intervalo("09:00", "09:30"), intervalo("09:30", "10:00"))).toBe(false);
    expect(seSuperponen(intervalo("09:30", "10:00"), intervalo("09:00", "09:30"))).toBe(false);
  });

  it("RN-TU-01 contención: 09:00-11:00 contiene a 09:30-10:00", () => {
    expect(seSuperponen(intervalo("09:00", "11:00"), intervalo("09:30", "10:00"))).toBe(true);
    expect(seSuperponen(intervalo("09:30", "10:00"), intervalo("09:00", "11:00"))).toBe(true);
  });

  it("RN-TU-01 separados: 09:00-09:30 y 11:00-12:00 no se superponen", () => {
    expect(seSuperponen(intervalo("09:00", "09:30"), intervalo("11:00", "12:00"))).toBe(false);
  });

  it("RN-TU-01 idénticos: el mismo intervalo se superpone consigo mismo", () => {
    expect(seSuperponen(intervalo("10:00", "10:30"), intervalo("10:00", "10:30"))).toBe(true);
  });
});
