import { describe, expect, it } from "vitest";
import { formatearMinutos, parsearHora } from "@/domain/horarios/horas";
import { DURACION_MAXIMA, DURACION_MINIMA, PASO_MINUTOS } from "@/domain/horarios/constantes";

describe("horas de franja HH:mm (RN-HO-01)", () => {
  it("RN-HO-01 feliz: '09:30' son 570 minutos desde la medianoche", () => {
    expect(parsearHora("09:30")).toBe(570);
    expect(parsearHora("00:00")).toBe(0);
    expect(parsearHora("23:59")).toBe(1439);
  });

  it("RN-HO-01 error: '24:00', '9:5' y textos vacíos no son horas válidas", () => {
    expect(parsearHora("24:00")).toBeNull();
    expect(parsearHora("9:5")).toBeNull();
    expect(parsearHora("")).toBeNull();
    expect(parsearHora("12:60")).toBeNull();
  });

  it("RN-HO-01 borde: formatearMinutos es la inversa de parsearHora", () => {
    expect(formatearMinutos(570)).toBe("09:30");
    expect(formatearMinutos(0)).toBe("00:00");
    expect(formatearMinutos(1439)).toBe("23:59");
  });

  it("SU-03 / RN-CA-02: constantes del módulo", () => {
    expect(PASO_MINUTOS).toBe(5);
    expect(DURACION_MINIMA).toBe(10);
    expect(DURACION_MAXIMA).toBe(240);
  });
});
