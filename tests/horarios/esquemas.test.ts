import { describe, expect, it } from "vitest";
import { esquemaBloqueo, esquemaConsultaDisponibilidad, esquemaFranja, erroresDeCampo } from "@/domain/horarios/esquemas";

const PROF = "prof-joaquin-cortez";

describe("esquema de consulta de disponibilidad (RN-CA-02, RN-GL-03)", () => {
  it("RN-CA-02 feliz: 30 minutos para el 30/11/2026 es una consulta válida", () => {
    expect(esquemaConsultaDisponibilidad.safeParse({ profesionalId: PROF, fecha: "2026-11-30", duracion: 30 }).success).toBe(true);
  });

  it("RN-CA-02 Duración inválida: 7 minutos se rechaza en el campo duración", () => {
    const r = esquemaConsultaDisponibilidad.safeParse({ profesionalId: PROF, fecha: "2026-11-30", duracion: 7 });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresDeCampo(r.error).duracion).toEqual(["La duración debe ser un múltiplo de 5 entre 10 y 240 minutos"]);
  });

  it("RN-CA-02 borde: 10 y 240 se aceptan; 5, 245 y 32 se rechazan", () => {
    for (const duracion of [10, 240]) expect(esquemaConsultaDisponibilidad.safeParse({ profesionalId: PROF, fecha: "2026-11-30", duracion }).success).toBe(true);
    for (const duracion of [5, 245, 32]) expect(esquemaConsultaDisponibilidad.safeParse({ profesionalId: PROF, fecha: "2026-11-30", duracion }).success).toBe(false);
  });

  it("RN-GL-03 error: la fecha 2026-13-45 se rechaza en el campo fecha", () => {
    const r = esquemaConsultaDisponibilidad.safeParse({ profesionalId: PROF, fecha: "2026-13-45", duracion: 30 });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresDeCampo(r.error).fecha).toEqual(["Ingresá una fecha válida"]);
  });
});

describe("esquema de bloqueo (RN-HO-03)", () => {
  it("RN-HO-03 error: un motivo vacío se rechaza con 'El motivo es obligatorio'", () => {
    const r = esquemaBloqueo.safeParse({ profesionalId: PROF, desde: "2026-12-01T09:00", hasta: "2026-12-01T13:00", motivo: "   " });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresDeCampo(r.error).motivo).toEqual(["El motivo es obligatorio"]);
  });

  it("RN-HO-03 feliz: recorta el motivo y acepta un bloqueo válido", () => {
    const r = esquemaBloqueo.safeParse({ profesionalId: PROF, desde: "2026-11-30T10:00", hasta: "2026-11-30T11:00", motivo: "  Congreso de endodoncia " });
    expect(r.success && r.data.motivo).toBe("Congreso de endodoncia");
  });

  it("RN-HO-03 borde: desde igual a hasta se rechaza en el campo hasta", () => {
    const r = esquemaBloqueo.safeParse({ profesionalId: PROF, desde: "2026-12-01T13:00", hasta: "2026-12-01T13:00", motivo: "Trámite personal" });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresDeCampo(r.error).hasta).toEqual(["La fecha y hora desde debe ser anterior a la fecha y hora hasta"]);
  });
});

describe("esquema de franja (RN-HO-01)", () => {
  it("RN-HO-01 feliz: lunes 09:00-12:00 es válida", () => {
    expect(esquemaFranja.safeParse({ profesionalId: PROF, diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" }).success).toBe(true);
  });

  it("RN-HO-01 error: una franja invertida marca el campo hora hasta", () => {
    const r = esquemaFranja.safeParse({ profesionalId: PROF, diaSemana: 2, horaDesde: "12:00", horaHasta: "09:00" });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresDeCampo(r.error).horaHasta).toEqual(["La hora desde debe ser anterior a la hora hasta"]);
  });

  it("RN-HO-01 borde: el día 0 y la hora '24:00' se rechazan", () => {
    const r = esquemaFranja.safeParse({ profesionalId: PROF, diaSemana: 0, horaDesde: "09:00", horaHasta: "24:00" });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(erroresDeCampo(r.error)).sort()).toEqual(["diaSemana", "horaHasta"]);
  });
});
