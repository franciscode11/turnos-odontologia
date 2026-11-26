import { describe, expect, it } from "vitest";
import { calcularVariacion, compararIndicadores, formatearVariacion } from "@/domain/estadisticas/comparacion";
import { calcularIndicadores } from "@/domain/estadisticas/indicadores";
import { periodoAnterior, periodoSemana } from "@/domain/estadisticas/periodos";
import { SIN_DATOS } from "@/domain/estadisticas/formato";
import type { Indicadores } from "@/domain/estadisticas/tipos";
import { franja, varios } from "./fabricas";

function indicadores(parcial: Partial<Indicadores>): Indicadores {
  return {
    turnosDados: 0,
    atendidos: 0,
    ausentes: 0,
    cancelados: 0,
    minutosOcupados: 0,
    minutosDeAtencion: 0,
    ocupacion: null,
    ausentismo: null,
    cancelaciones: null,
    ...parcial,
  };
}

describe("comparación con el período anterior (RN-ST-06)", () => {
  it("RN-ST-06 312 turnos vs. 288 → +8,3%; ausentismo 7,4% vs. 8,6% → -1,2 pts favorable", () => {
    const actual = indicadores({ turnosDados: 312, ausentismo: 0.074, ocupacion: 0.716, cancelaciones: 0.112 });
    const anterior = indicadores({ turnosDados: 288, ausentismo: 0.086, ocupacion: 0.685, cancelaciones: 0.103 });
    const v = compararIndicadores(actual, anterior);
    expect(formatearVariacion(v.turnosDados)).toBe("+8,3%");
    expect(v.turnosDados?.favorable).toBe(true);
    expect(formatearVariacion(v.ausentismo)).toBe("-1,2 pts");
    expect(v.ausentismo?.favorable).toBe(true);
    expect(formatearVariacion(v.ocupacion)).toBe("+3,1 pts");
    expect(v.ocupacion?.favorable).toBe(true);
    expect(formatearVariacion(v.cancelaciones)).toBe("+0,9 pts");
    expect(v.cancelaciones?.favorable).toBe(false);
  });

  it("RN-ST-06 error: menos turnos que el período anterior es desfavorable", () => {
    const v = calcularVariacion("turnosDados", indicadores({ turnosDados: 90 }), indicadores({ turnosDados: 100 }));
    expect(formatearVariacion(v)).toBe("-10,0%");
    expect(v?.favorable).toBe(false);
  });

  it("RN-ST-06 borde: período anterior sin turnos → Sin datos en turnos dados y en cada tasa", () => {
    const actual = indicadores({ turnosDados: 5, ausentismo: 0.2, cancelaciones: 0.2, ocupacion: 0.3 });
    const v = compararIndicadores(actual, indicadores({}));
    expect(v.turnosDados).toBeNull();
    expect(v.ausentismo).toBeNull();
    expect(v.cancelaciones).toBeNull();
    expect(v.ocupacion).toBeNull();
    expect(formatearVariacion(v.turnosDados)).toBe(SIN_DATOS);
  });

  it("RN-ST-06 borde: sin cambios → 0,0 pts, neutro", () => {
    const v = calcularVariacion("ausentismo", indicadores({ ausentismo: 0.1 }), indicadores({ ausentismo: 0.1 }));
    expect(formatearVariacion(v)).toBe("0,0 pts");
    expect(v?.favorable).toBeNull();
  });

  it("RN-ST-06 con datos reales de dos semanas consecutivas de igual duración", () => {
    const semana = periodoSemana("2026-11-26");
    const anterior = periodoAnterior(semana);
    const turnos = [...varios(4, "ATENDIDO", "2026-11-23"), ...varios(2, "ATENDIDO", "2026-11-16"), ...varios(2, "AUSENTE", "2026-11-17")];
    const franjas = [franja(1, "08:00", "12:00")];
    const v = compararIndicadores(calcularIndicadores(turnos, franjas, [], semana), calcularIndicadores(turnos, franjas, [], anterior));
    expect(formatearVariacion(v.turnosDados)).toBe("0,0%");
    expect(formatearVariacion(v.ausentismo)).toBe("-50,0 pts");
    // Los ausentes también ocupan agenda (RN-TU-04): 120 / 240 minutos en ambas semanas.
    expect(formatearVariacion(v.ocupacion)).toBe("0,0 pts");
  });
});
