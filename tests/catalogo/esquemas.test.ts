import { describe, expect, it } from "vitest";
import { esquemaPrestacion, esquemaProfesional, esquemaSillon } from "@/domain/catalogo/esquemas";
import { MENSAJE_DURACION } from "@/domain/catalogo/reglas";

function erroresDe(resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return Object.fromEntries((resultado.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));
}

describe("esquemaProfesional", () => {
  it("recorta espacios y guarda la matrícula en mayúsculas", () => {
    const r = esquemaProfesional.parse({ nombre: " Ana ", apellido: "Pérez ", matricula: " mp-1234 ", especialidad: "" });
    expect(r).toEqual({ nombre: "Ana", apellido: "Pérez", matricula: "MP-1234", especialidad: null });
  });

  it("rechaza la matrícula vacía o solo con espacios en el campo matrícula", () => {
    const r = esquemaProfesional.safeParse({ nombre: "Ana", apellido: "Pérez", matricula: "   ", especialidad: "" });
    expect(r.success).toBe(false);
    expect(erroresDe(r)).toHaveProperty("matricula");
  });

  it("la especialidad es opcional", () => {
    expect(esquemaProfesional.parse({ nombre: "Ana", apellido: "Pérez", matricula: "MP-1", especialidad: "Ortodoncia" }).especialidad).toBe("Ortodoncia");
  });
});

describe("esquemaPrestacion", () => {
  it("feliz: Limpieza de 30 minutos sin precio", () => {
    expect(esquemaPrestacion.parse({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null })).toEqual({
      nombre: "Limpieza",
      duracionMinutos: 30,
      precioReferencia: null,
    });
  });

  it("error de negocio: 7 minutos da el mensaje de RN-CA-02 en el campo duración", () => {
    const r = esquemaPrestacion.safeParse({ nombre: "Limpieza", duracionMinutos: 7, precioReferencia: null });
    expect(erroresDe(r)).toEqual({ duracionMinutos: MENSAJE_DURACION });
  });

  it("borde: 240 minutos se acepta", () => {
    expect(esquemaPrestacion.safeParse({ nombre: "Cirugía", duracionMinutos: 240, precioReferencia: null }).success).toBe(true);
  });

  it("ajuste: precio negativo se rechaza en el campo precio", () => {
    const r = esquemaPrestacion.safeParse({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: -100 });
    expect(erroresDe(r)).toEqual({ precioReferencia: "El precio de referencia no puede ser negativo" });
  });

  it("ajuste: precio con más de 2 decimales se rechaza; 0 y 15000.5 se aceptan", () => {
    expect(esquemaPrestacion.safeParse({ nombre: "X", duracionMinutos: 30, precioReferencia: 10.123 }).success).toBe(false);
    expect(esquemaPrestacion.safeParse({ nombre: "X", duracionMinutos: 30, precioReferencia: 0 }).success).toBe(true);
    expect(esquemaPrestacion.safeParse({ nombre: "X", duracionMinutos: 30, precioReferencia: 15000.5 }).success).toBe(true);
  });

  it("exige el nombre", () => {
    expect(erroresDe(esquemaPrestacion.safeParse({ nombre: " ", duracionMinutos: 30, precioReferencia: null }))).toHaveProperty("nombre");
  });
});

describe("esquemaSillon", () => {
  it("recorta espacios y exige el nombre", () => {
    expect(esquemaSillon.parse({ nombre: " Box 3 " })).toEqual({ nombre: "Box 3" });
    expect(esquemaSillon.safeParse({ nombre: "" }).success).toBe(false);
  });
});
