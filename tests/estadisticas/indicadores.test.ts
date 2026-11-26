import { describe, expect, it } from "vitest";
import { calcularIndicadores, minutosDeAtencion } from "@/domain/estadisticas/indicadores";
import { formatearPorcentaje, SIN_DATOS } from "@/domain/estadisticas/formato";
import { periodoMes, periodoRango, periodoSemana } from "@/domain/estadisticas/periodos";
import { DE_CONINCK, bloqueo, franja, turno, varios } from "./fabricas";

// Semana fija: lunes 23/11/2026 a domingo 29/11/2026. Mes: noviembre 2026.
const SEMANA = periodoSemana("2026-11-26");
const NOVIEMBRE = periodoMes("2026-11-26");
const LUNES = periodoRango("2026-11-23", "2026-11-23")!;

describe("turnos dados del período (RN-ST-02)", () => {
  it("RN-ST-02 turnos en todos los estados: 18 dados con 10 atendidos, 2 ausentes y 2 cancelados", () => {
    const turnos = [...varios(3, "RESERVADO"), ...varios(1, "CONFIRMADO"), ...varios(10, "ATENDIDO", "2026-11-24"), ...varios(2, "AUSENTE", "2026-11-25"), ...varios(2, "CANCELADO", "2026-11-26")];
    const r = calcularIndicadores(turnos, [], [], SEMANA);
    expect(r).toMatchObject({ turnosDados: 18, atendidos: 10, ausentes: 2, cancelados: 2 });
  });

  it("RN-ST-02 error: turnos antes del período o justo en el instante en que termina no cuentan", () => {
    const turnos = [turno("2026-11-22", "23:30", 30, "ATENDIDO"), turno("2026-11-30", "00:00", 30, "ATENDIDO"), turno("2026-11-23", "00:00", 30, "ATENDIDO")];
    const r = calcularIndicadores(turnos, [], [], SEMANA);
    expect(r.turnosDados).toBe(1);
  });

  it("RN-ST-02 borde: período sin turnos → 0 turnos dados", () => {
    const r = calcularIndicadores([], [], [], SEMANA);
    expect(r).toMatchObject({ turnosDados: 0, atendidos: 0, ausentes: 0, cancelados: 0 });
  });
});

describe("tasa de ausentismo (RN-ST-04, US-070)", () => {
  it("RN-ST-04 diez atendidos y dos ausentes en el mes → 16,7%", () => {
    const turnos = [...varios(10, "ATENDIDO", "2026-11-02"), ...varios(2, "AUSENTE", "2026-11-10")];
    const r = calcularIndicadores(turnos, [], [], NOVIEMBRE);
    expect(r.ausentismo).toBeCloseTo(2 / 12, 10);
    expect(formatearPorcentaje(r.ausentismo)).toBe("16,7%");
  });

  it("RN-ST-04 error: reservados, confirmados y cancelados no entran en el denominador → 50,0%", () => {
    const turnos = [...varios(1, "ATENDIDO"), ...varios(1, "AUSENTE"), ...varios(3, "RESERVADO"), ...varios(2, "CONFIRMADO"), ...varios(4, "CANCELADO")];
    const r = calcularIndicadores(turnos, [], [], SEMANA);
    expect(formatearPorcentaje(r.ausentismo)).toBe("50,0%");
  });

  it("RN-ST-04 borde: sin atendidos ni ausentes → Sin datos, no 0%", () => {
    const r = calcularIndicadores([...varios(2, "RESERVADO"), ...varios(1, "CANCELADO")], [], [], SEMANA);
    expect(r.ausentismo).toBeNull();
    expect(formatearPorcentaje(r.ausentismo)).toBe(SIN_DATOS);
    expect(SIN_DATOS).toBe("Sin datos");
  });
});

describe("tasa de cancelación (RN-ST-05)", () => {
  it("RN-ST-05 20 turnos dados con 3 cancelados → 15,0%", () => {
    const turnos = [...varios(17, "ATENDIDO"), ...varios(3, "CANCELADO", "2026-11-25")];
    const r = calcularIndicadores(turnos, [], [], SEMANA);
    expect(formatearPorcentaje(r.cancelaciones)).toBe("15,0%");
  });

  it("RN-ST-05 error: cancelados fuera del período no suman al numerador", () => {
    const turnos = [...varios(4, "ATENDIDO"), turno("2026-11-30", "09:00", 30, "CANCELADO")];
    const r = calcularIndicadores(turnos, [], [], SEMANA);
    expect(r.cancelaciones).toBe(0);
    expect(formatearPorcentaje(r.cancelaciones)).toBe("0,0%");
  });

  it("RN-ST-05 borde: sin turnos dados → Sin datos", () => {
    expect(formatearPorcentaje(calcularIndicadores([], [], [], SEMANA).cancelaciones)).toBe(SIN_DATOS);
  });
});

describe("ocupación de agenda (RN-ST-03, RN-TU-04)", () => {
  const LUNES_9_A_12 = [franja(1, "09:00", "12:00")];

  it("RN-ST-03 franja de 09:00 a 12:00 con 90 minutos de turnos atendidos, reservados y ausentes → 50,0%", () => {
    const turnos = [turno("2026-11-23", "09:00", 30, "ATENDIDO"), turno("2026-11-23", "09:30", 30, "RESERVADO"), turno("2026-11-23", "10:00", 30, "AUSENTE")];
    const r = calcularIndicadores(turnos, LUNES_9_A_12, [], LUNES);
    expect(r).toMatchObject({ minutosOcupados: 90, minutosDeAtencion: 180 });
    expect(formatearPorcentaje(r.ocupacion)).toBe("50,0%");
  });

  it("RN-ST-03 RN-TU-04 bloqueo de 10:00 a 11:00 descuenta y un cancelado no ocupa → 60 / 120 = 50,0%", () => {
    const turnos = [turno("2026-11-23", "09:00", 30, "ATENDIDO"), turno("2026-11-23", "09:30", 30, "CONFIRMADO"), turno("2026-11-23", "11:00", 30, "CANCELADO")];
    const r = calcularIndicadores(turnos, LUNES_9_A_12, [bloqueo("2026-11-23", "10:00", "11:00")], LUNES);
    expect(r).toMatchObject({ minutosOcupados: 60, minutosDeAtencion: 120 });
    expect(formatearPorcentaje(r.ocupacion)).toBe("50,0%");
  });

  it("RN-ST-03 bloqueos superpuestos o de otro profesional se descuentan una sola vez y solo del suyo", () => {
    const bloqueos = [bloqueo("2026-11-23", "08:00", "10:00"), bloqueo("2026-11-23", "09:30", "10:30"), bloqueo("2026-11-23", "09:00", "12:00", DE_CONINCK)];
    expect(minutosDeAtencion(LUNES_9_A_12, bloqueos, LUNES)).toBe(90);
  });

  it("RN-ST-03 una semana suma las franjas de cada día que corresponde a su día ISO", () => {
    const franjas = [franja(1, "09:00", "12:00"), franja(1, "14:00", "18:00"), franja(3, "09:00", "13:00"), franja(5, "10:00", "12:00", DE_CONINCK)];
    expect(minutosDeAtencion(franjas, [], SEMANA)).toBe(180 + 240 + 240 + 120);
  });

  it("RN-ST-03 borde: sin franjas en el período → Sin datos", () => {
    const r = calcularIndicadores([turno("2026-11-28", "10:00", 30, "ATENDIDO")], [franja(1, "09:00", "12:00")], [], periodoRango("2026-11-28", "2026-11-29")!);
    expect(r.minutosDeAtencion).toBe(0);
    expect(formatearPorcentaje(r.ocupacion)).toBe(SIN_DATOS);
  });

  it("RN-ST-03 borde: bloqueo que cubre toda la franja → Sin datos", () => {
    const r = calcularIndicadores([], LUNES_9_A_12, [bloqueo("2026-11-23", "08:00", "13:00")], LUNES);
    expect(r.ocupacion).toBeNull();
  });
});
