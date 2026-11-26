import { describe, expect, it } from "vitest";
import { aInstante } from "@/domain/shared/fechas";
import {
  DIAS_MAXIMOS_RANGO,
  contieneInstante,
  etiquetaComparacion,
  etiquetaPeriodo,
  fechasDelPeriodo,
  periodoAnterior,
  periodoMes,
  periodoRango,
  periodoSemana,
  periodoSiguiente,
  rangoUtc,
  resolverPeriodo,
} from "@/domain/estadisticas/periodos";

// Fecha fija: jueves 26/11/2026 en Argentina.
const HOY = "2026-11-26";

describe("período de análisis en hora de Argentina (RN-GL-03, RN-ST-02)", () => {
  it("RN-GL-03 semana que contiene el jueves 26/11/2026: lunes 23 a domingo 29, fin exclusivo el lunes 30 00:00", () => {
    const semana = periodoSemana(HOY);
    expect(semana).toEqual({ tipo: "semana", desde: "2026-11-23", hasta: "2026-11-29" });
    const { inicio, fin } = rangoUtc(semana);
    expect(inicio.toISOString()).toBe("2026-11-23T03:00:00.000Z");
    expect(fin.toISOString()).toBe("2026-11-30T03:00:00.000Z");
    expect(fechasDelPeriodo(semana)).toHaveLength(7);
  });

  it("RN-GL-03 semana de un domingo: pertenece a la semana que empezó el lunes anterior", () => {
    expect(periodoSemana("2026-11-29")).toEqual({ tipo: "semana", desde: "2026-11-23", hasta: "2026-11-29" });
  });

  it("RN-GL-03 mes calendario de noviembre: del 1 al 30", () => {
    expect(periodoMes(HOY)).toEqual({ tipo: "mes", desde: "2026-11-01", hasta: "2026-11-30" });
    expect(periodoMes("2028-02-10").hasta).toBe("2028-02-29");
  });

  it("RN-GL-03 rango válido inclusive: 10 días", () => {
    const rango = periodoRango("2026-11-10", "2026-11-19");
    expect(rango).toEqual({ tipo: "rango", desde: "2026-11-10", hasta: "2026-11-19" });
    expect(fechasDelPeriodo(rango!)).toHaveLength(10);
  });

  it("RN-GL-03 error: rango invertido, demasiado largo o con fechas inexistentes → null", () => {
    expect(periodoRango("2026-11-20", "2026-11-10")).toBeNull();
    expect(periodoRango("2026-01-01", "2026-12-31")).toBeNull();
    expect(periodoRango("2026-02-30", "2026-03-05")).toBeNull();
    expect(periodoRango("2026-09-01", "2026-12-02")).toBeNull(); // 93 días
    expect(fechasDelPeriodo(periodoRango("2026-09-01", "2026-12-01")!)).toHaveLength(DIAS_MAXIMOS_RANGO); // 92 días es el máximo
  });

  it("RN-GL-03 error: parámetros inválidos o ausentes → mes actual", () => {
    const mesActual = { tipo: "mes", desde: "2026-11-01", hasta: "2026-11-30" };
    expect(resolverPeriodo({}, HOY)).toEqual(mesActual);
    expect(resolverPeriodo({ periodo: "anio" }, HOY)).toEqual(mesActual);
    expect(resolverPeriodo({ periodo: "semana", fecha: "2026-13-01" }, HOY)).toEqual(mesActual);
    expect(resolverPeriodo({ periodo: "rango", desde: "2026-11-20", hasta: "2026-11-10" }, HOY)).toEqual(mesActual);
    expect(resolverPeriodo({ periodo: ["mes", "semana"] }, HOY)).toEqual(mesActual);
  });

  it("RN-GL-03 parámetros válidos: semana, mes de otra fecha y rango", () => {
    expect(resolverPeriodo({ periodo: "semana", fecha: "2026-11-04" }, HOY)).toEqual({ tipo: "semana", desde: "2026-11-02", hasta: "2026-11-08" });
    expect(resolverPeriodo({ periodo: "mes", fecha: "2026-10-15" }, HOY)).toEqual({ tipo: "mes", desde: "2026-10-01", hasta: "2026-10-31" });
    expect(resolverPeriodo({ periodo: "semana" }, HOY)).toEqual(periodoSemana(HOY));
    expect(resolverPeriodo({ periodo: "rango", desde: "2026-11-10", hasta: "2026-11-19" }, HOY)).toEqual({ tipo: "rango", desde: "2026-11-10", hasta: "2026-11-19" });
  });

  it("RN-ST-02 borde de medianoche: 01/12 00:00 de Argentina cuenta en diciembre y 30/11 23:30 en noviembre", () => {
    const noviembre = periodoMes(HOY);
    const diciembre = periodoMes("2026-12-01");
    const medianoche = aInstante("2026-12-01", "00:00");
    expect(medianoche.toISOString()).toBe("2026-12-01T03:00:00.000Z");
    expect(contieneInstante(noviembre, medianoche)).toBe(false);
    expect(contieneInstante(diciembre, medianoche)).toBe(true);
    expect(contieneInstante(noviembre, aInstante("2026-11-30", "23:30"))).toBe(true);
  });
});

describe("período anterior de igual duración (RN-ST-06)", () => {
  it("RN-ST-06 semana anterior: 16 a 22 de noviembre", () => {
    expect(periodoAnterior(periodoSemana(HOY))).toEqual({ tipo: "semana", desde: "2026-11-16", hasta: "2026-11-22" });
  });

  it("RN-ST-06 rango del 10/11 al 19/11 se compara con el 31/10 al 09/11", () => {
    expect(periodoAnterior(periodoRango("2026-11-10", "2026-11-19")!)).toEqual({ tipo: "rango", desde: "2026-10-31", hasta: "2026-11-09" });
  });

  it("RN-ST-06 borde: el mes anterior a marzo es febrero completo y el de enero es diciembre del año anterior", () => {
    expect(periodoAnterior(periodoMes("2026-03-15"))).toEqual({ tipo: "mes", desde: "2026-02-01", hasta: "2026-02-28" });
    expect(periodoAnterior(periodoMes("2027-01-05"))).toEqual({ tipo: "mes", desde: "2026-12-01", hasta: "2026-12-31" });
  });

  it("RN-ST-06 período siguiente para navegar", () => {
    expect(periodoSiguiente(periodoMes(HOY))).toEqual({ tipo: "mes", desde: "2026-12-01", hasta: "2026-12-31" });
    expect(periodoSiguiente(periodoSemana(HOY))).toEqual({ tipo: "semana", desde: "2026-11-30", hasta: "2026-12-06" });
  });
});

describe("etiquetas del período", () => {
  it("RN-GL-03 textos en castellano", () => {
    expect(etiquetaPeriodo(periodoMes(HOY))).toBe("Noviembre 2026");
    expect(etiquetaPeriodo(periodoSemana(HOY))).toBe("Semana del 23/11/2026 al 29/11/2026");
    expect(etiquetaPeriodo(periodoRango("2026-11-10", "2026-11-19")!)).toBe("Del 10/11/2026 al 19/11/2026");
    expect(etiquetaComparacion(periodoMes(HOY))).toBe("octubre");
    expect(etiquetaComparacion(periodoSemana(HOY))).toBe("la semana anterior");
    expect(etiquetaComparacion(periodoRango("2026-11-10", "2026-11-19")!)).toBe("los 10 días anteriores");
  });
});
