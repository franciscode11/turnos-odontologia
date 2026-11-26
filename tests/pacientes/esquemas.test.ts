import { describe, expect, it } from "vitest";
import { esquemaPaciente, normalizarDni } from "@/domain/pacientes/esquemas";

const ahora = () => new Date("2026-11-26T02:30:00Z");
const datos = {
  nombre: "Paciente",
  apellido: "Ejemplo",
  dni: "30.123.456",
  fechaNacimiento: "1990-03-12",
  telefono: "0000000000",
};

describe("DNI de pacientes", () => {
  it.each([
    ["30.123.456", "30123456"],
    [" 1.234.567 ", "1234567"],
    ["01234567", "01234567"],
  ])("normaliza %s a %s", (entrada, esperado) => {
    expect(normalizarDni(entrada)).toBe(esperado);
  });

  it.each(["123456", "123456789", "A30123456", "3.01.23456"])("rechaza %s", (entrada) => {
    expect(normalizarDni(entrada)).toBeNull();
  });
});

describe("datos de pacientes", () => {
  it("normaliza el DNI, conserva la fecha y deja los campos opcionales vacíos", () => {
    expect(esquemaPaciente(ahora).parse({ ...datos, nombre: " Paciente ", email: "" })).toEqual({
      ...datos,
      dni: "30123456",
      email: null,
      obraSocial: null,
      numeroAfiliado: null,
    });
  });

  it.each(["nombre", "apellido", "dni", "fechaNacimiento", "telefono"] as const)(
    "rechaza %s vacío",
    (campo) => {
      const resultado = esquemaPaciente(ahora).safeParse({ ...datos, [campo]: "" });
      expect(resultado.error?.issues.map((issue) => issue.path[0])).toContain(campo);
    },
  );

  it("acepta el día actual de Argentina, pero rechaza el día siguiente aunque ya sea ese día en UTC", () => {
    expect(esquemaPaciente(ahora).safeParse({ ...datos, fechaNacimiento: "2026-11-25" }).success).toBe(true);
    const resultado = esquemaPaciente(ahora).safeParse({ ...datos, fechaNacimiento: "2026-11-26" });
    expect(resultado.error?.issues[0]?.message).toBe("La fecha de nacimiento no puede ser futura");
  });

  it("rechaza una fecha inexistente y un email opcional mal formado", () => {
    const resultado = esquemaPaciente(ahora).safeParse({
      ...datos,
      fechaNacimiento: "2025-02-29",
      email: "invalido",
    });
    expect(resultado.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["fechaNacimiento", "email"]),
    );
  });
});
