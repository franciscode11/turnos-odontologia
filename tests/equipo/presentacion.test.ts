import { describe, expect, it } from "vitest";
import { estadoVisible, formatearDiaMes, formatearUltimoIngreso, ordenarMiembros } from "@/domain/equipo/presentacion";

// "Ahora" fijo: miércoles 26/11/2026 14:00 en Argentina (17:00 UTC).
const AHORA = new Date("2026-11-26T17:00:00Z");

describe("estado visible de un miembro (RN-EQ-04, RN-AU-05)", () => {
  it("RN-EQ-04 feliz: INVITADO de hace 2 días figura como pendiente", () => {
    expect(estadoVisible({ estado: "INVITADO", invitadoEn: new Date("2026-11-24T12:00:00Z") }, AHORA)).toBe("PENDIENTE");
  });

  it("RN-EQ-04 borde: INVITADO de hace 7 días figura como vencida", () => {
    expect(estadoVisible({ estado: "INVITADO", invitadoEn: new Date("2026-11-19T17:00:00Z") }, AHORA)).toBe("VENCIDA");
  });

  it("RN-AU-05 ACTIVO e INACTIVO se muestran tal cual", () => {
    expect(estadoVisible({ estado: "ACTIVO", invitadoEn: null }, AHORA)).toBe("ACTIVO");
    expect(estadoVisible({ estado: "INACTIVO", invitadoEn: null }, AHORA)).toBe("INACTIVO");
  });
});

describe("último ingreso en hora de Argentina (RN-GL-03)", () => {
  it("RN-GL-03 feliz: hoy a las 11:02 UTC se muestra 'Hoy, 08:02'", () => {
    expect(formatearUltimoIngreso(new Date("2026-11-26T11:02:00Z"), AHORA)).toBe("Hoy, 08:02");
  });

  it("RN-GL-03 borde: hoy a las 02:30 UTC todavía es ayer en Argentina", () => {
    expect(formatearUltimoIngreso(new Date("2026-11-26T02:30:00Z"), AHORA)).toBe("Ayer, 23:30");
  });

  it("RN-GL-03 sin ingresos se muestra 'Nunca'", () => {
    expect(formatearUltimoIngreso(null, AHORA)).toBe("Nunca");
  });

  it("RN-GL-03 antes de ayer se muestra la fecha", () => {
    expect(formatearUltimoIngreso(new Date("2026-11-20T15:00:00Z"), AHORA)).toBe("20/11/2026");
  });

  it("día y mes de la invitación en hora de Argentina", () => {
    expect(formatearDiaMes(new Date("2026-11-25T01:00:00Z"))).toBe("24/11");
  });
});

describe("orden de la tabla", () => {
  it("activos primero, después invitaciones e inactivos, y por nombre o email", () => {
    const filas = [
      { estado: "INACTIVO" as const, nombre: "Ana Paz", email: "ana.paz@example.com" },
      { estado: "INVITADO" as const, nombre: null, email: "ulises.lucato@example.com" },
      { estado: "ACTIVO" as const, nombre: "Octavio Crescini", email: "octavio.crescini@example.com" },
      { estado: "ACTIVO" as const, nombre: "Francisco Valles", email: "francisco.valles@example.com" },
    ];
    expect(ordenarMiembros(filas).map((f) => f.email)).toEqual([
      "francisco.valles@example.com",
      "octavio.crescini@example.com",
      "ulises.lucato@example.com",
      "ana.paz@example.com",
    ]);
  });
});
