import { describe, expect, it } from "vitest";
import { MENSAJE_DURACION, validarDuracion } from "@/domain/catalogo/reglas";

describe("validarDuracion (RN-CA-02)", () => {
  it("feliz: 30 minutos es una duración válida", () => {
    expect(validarDuracion(30)).toBeNull();
  });

  it("error de negocio: 7 minutos se rechaza con el mensaje de la regla", () => {
    expect(validarDuracion(7)).toBe(MENSAJE_DURACION);
    expect(MENSAJE_DURACION).toBe("La duración debe ser múltiplo de 5 entre 10 y 240 minutos");
  });

  it("borde: exactamente 240 minutos se acepta (límite superior incluido)", () => {
    expect(validarDuracion(240)).toBeNull();
  });

  it("borde: 10 se acepta y 5 y 245 se rechazan", () => {
    expect(validarDuracion(10)).toBeNull();
    expect(validarDuracion(5)).toBe(MENSAJE_DURACION);
    expect(validarDuracion(245)).toBe(MENSAJE_DURACION);
  });

  it("rechaza valores no enteros", () => {
    expect(validarDuracion(30.5)).toBe(MENSAJE_DURACION);
    expect(validarDuracion(Number.NaN)).toBe(MENSAJE_DURACION);
  });
});
