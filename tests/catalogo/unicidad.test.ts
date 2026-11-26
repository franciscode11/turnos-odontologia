import { describe, expect, it } from "vitest";
import { validarMatriculaUnica, validarNombreSillonUnico } from "@/domain/catalogo/reglas";

const ID_A = "00000000-0000-4000-8000-0000000000a1";
const ID_B = "00000000-0000-4000-8000-0000000000b2";

describe("validarMatriculaUnica (RN-CA-01)", () => {
  const existentes = [{ id: ID_A, matricula: "MP-1234" }];

  it("error de negocio: una matrícula repetida en el alta se rechaza", () => {
    expect(validarMatriculaUnica("MP-1234", existentes)).toBe("Ya existe un profesional con la matrícula MP-1234");
  });

  it("acepta una matrícula nueva", () => {
    expect(validarMatriculaUnica("MP-9999", existentes)).toBeNull();
  });

  it("rechaza en la edición si otro profesional ya la tiene", () => {
    expect(validarMatriculaUnica("MP-1234", existentes, ID_B)).toBe("Ya existe un profesional con la matrícula MP-1234");
  });

  it("acepta en la edición si la matrícula repetida es la propia", () => {
    expect(validarMatriculaUnica("MP-1234", existentes, ID_A)).toBeNull();
  });

  it("la matrícula de un profesional inactivo también cuenta", () => {
    const inactivo = { id: ID_A, matricula: "MP-1234", activo: false };
    expect(validarMatriculaUnica("MP-1234", [inactivo])).not.toBeNull();
  });

  it("ajuste: compara sin distinguir mayúsculas ni espacios", () => {
    expect(validarMatriculaUnica(" mp-1234 ", existentes)).toBe("Ya existe un profesional con la matrícula MP-1234");
  });
});

describe("validarNombreSillonUnico (RN-CA-03)", () => {
  const existentes = [{ id: ID_A, nombre: "Box 1" }];

  it("error de negocio: un nombre repetido se rechaza", () => {
    expect(validarNombreSillonUnico("Box 1", existentes)).toBe("Ya existe un sillón con el nombre Box 1");
  });

  it("feliz: un nombre nuevo se acepta", () => {
    expect(validarNombreSillonUnico("Box 3", existentes)).toBeNull();
  });

  it("ajuste: 'box 1' repite 'Box 1'", () => {
    expect(validarNombreSillonUnico("box 1", existentes)).toBe("Ya existe un sillón con el nombre Box 1");
  });

  it("acepta en la edición si el nombre es el propio", () => {
    expect(validarNombreSillonUnico("Box 1", existentes, ID_A)).toBeNull();
  });
});
