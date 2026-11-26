import { describe, expect, it } from "vitest";
import { esquemaActivacion } from "@/domain/shared/contrasena";

// La activación es de C-01 (src/server/auth/activacion.ts); acá se fija la política de RN-EQ-05.
describe("activación de la cuenta invitada (RN-EQ-05)", () => {
  it("RN-EQ-05 feliz: nombre y contraseña de 10+ caracteres con un número se aceptan", () => {
    expect(esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "sonrisa2026" }).success).toBe(true);
  });

  it("RN-EQ-05 error: contraseña débil sin número se rechaza", () => {
    const r = esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "sonrisasonrisa" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["contrasena"]);
  });

  it("RN-EQ-05 borde: 9 caracteres con número se rechaza y 10 se acepta", () => {
    expect(esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "sonrisa26" }).success).toBe(false);
    expect(esquemaActivacion.safeParse({ nombre: "Ulises Lucato", contrasena: "sonrisa261" }).success).toBe(true);
  });
});
