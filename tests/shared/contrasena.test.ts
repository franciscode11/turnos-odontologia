import { describe, expect, it } from "vitest";
import { esquemaActivacion, reglasContrasena } from "@/domain/shared/contrasena";

describe("política de contraseña al activar la cuenta (RN-EQ-04)", () => {
  it("feliz: 'consultorio2026' cumple las dos reglas", () => {
    expect(reglasContrasena("consultorio2026")).toEqual({ largo: true, numero: true });
    expect(esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "consultorio2026" }).success).toBe(true);
  });

  it("error de negocio: 'turnos' no tiene 10 caracteres ni un número", () => {
    expect(reglasContrasena("turnos")).toEqual({ largo: false, numero: false });
    const r = esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "turnos" });
    expect(r.success).toBe(false);
  });

  it("borde: exactamente 10 caracteres con un número es válida; 9 no", () => {
    expect(reglasContrasena("abcdefghi1").largo).toBe(true);
    expect(reglasContrasena("abcdefgh1").largo).toBe(false);
  });

  it("el nombre es obligatorio y se recorta", () => {
    const r = esquemaActivacion.safeParse({ nombre: "   ", contrasena: "consultorio2026" });
    expect(r.success).toBe(false);
  });
});
