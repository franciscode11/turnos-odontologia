import { afterEach, describe, expect, it } from "vitest";
import { aFechaHoraLocal, formatearRangoBloqueo, instanteDeFechaHoraLocal, validarBloqueo } from "@/domain/horarios/bloqueos";
import { MENSAJES } from "@/domain/horarios/constantes";

const TZ_ORIGINAL = process.env.TZ;
afterEach(() => {
  process.env.TZ = TZ_ORIGINAL;
});

const ar = (fecha: string, hora: string) => instanteDeFechaHoraLocal(`${fecha}T${hora}`) as Date;

describe("validarBloqueo (RN-HO-03)", () => {
  it("RN-HO-03 Bloqueo válido de un día: 30/11/2026 10:00-11:00 'Congreso de endodoncia'", () => {
    expect(validarBloqueo({ desde: ar("2026-11-30", "10:00"), hasta: ar("2026-11-30", "11:00"), motivo: "Congreso de endodoncia" })).toBeNull();
  });

  it("RN-HO-03 Bloqueo sin motivo: un motivo con solo espacios se rechaza en el campo motivo", () => {
    expect(validarBloqueo({ desde: ar("2026-12-01", "09:00"), hasta: ar("2026-12-01", "13:00"), motivo: "   " })).toEqual({
      motivo: ["El motivo es obligatorio"],
    });
  });

  it("RN-HO-03 Bloqueo con hasta anterior o igual a desde: 01/12/2026 13:00-13:00 se rechaza", () => {
    const mismo = ar("2026-12-01", "13:00");
    expect(validarBloqueo({ desde: mismo, hasta: mismo, motivo: "Trámite personal" })).toEqual({
      hasta: ["La fecha y hora desde debe ser anterior a la fecha y hora hasta"],
    });
    expect(validarBloqueo({ desde: ar("2026-12-01", "13:00"), hasta: ar("2026-12-01", "12:00"), motivo: "Trámite personal" })).toEqual({
      hasta: [MENSAJES.bloqueoInvertido],
    });
  });

  it("RN-HO-03 Bloqueo de varios días: 21/12/2026 00:00 al 04/01/2027 00:00 es un único bloqueo válido", () => {
    const vacaciones = { desde: ar("2026-12-21", "00:00"), hasta: ar("2027-01-04", "00:00"), motivo: "Vacaciones" };
    expect(validarBloqueo(vacaciones)).toBeNull();
    expect((vacaciones.hasta.getTime() - vacaciones.desde.getTime()) / 86_400_000).toBe(14);
  });
});

describe("bloqueos en hora de Argentina (RN-GL-03)", () => {
  it("RN-GL-03 Guardado en UTC: 30/11/2026 10:00-11:00 es 13:00Z-14:00Z", () => {
    expect(ar("2026-11-30", "10:00").toISOString()).toBe("2026-11-30T13:00:00.000Z");
    expect(ar("2026-11-30", "11:00").toISOString()).toBe("2026-11-30T14:00:00.000Z");
  });

  it("RN-GL-03 Presentación en hora del consultorio: con el proceso en Madrid se ve '30/11/2026 10:00 - 30/11/2026 11:00'", () => {
    process.env.TZ = "Europe/Madrid";
    expect(formatearRangoBloqueo(new Date("2026-11-30T13:00:00Z"), new Date("2026-11-30T14:00:00Z"))).toBe(
      "30/11/2026 10:00 - 30/11/2026 11:00",
    );
  });

  it("RN-GL-03 borde: aFechaHoraLocal devuelve el valor del selector fecha-hora y un texto inválido no es instante", () => {
    expect(aFechaHoraLocal(new Date("2026-12-01T03:00:00Z"))).toBe("2026-12-01T00:00");
    expect(instanteDeFechaHoraLocal("2026-13-45T10:00")).toBeNull();
    expect(instanteDeFechaHoraLocal("2026-11-30")).toBeNull();
  });
});
