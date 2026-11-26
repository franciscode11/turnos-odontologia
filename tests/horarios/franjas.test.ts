import { describe, expect, it } from "vitest";
import {
  agruparFranjasPorDia,
  franjasSeSuperponen,
  validarFranja,
  validarFranjaContraExistentes,
  type FranjaDominio,
} from "@/domain/horarios/franjas";
import { MENSAJES } from "@/domain/horarios/constantes";

// Datos ficticios: profesionales del seed con ids inventados.
const LAUTARO = "prof-lautaro-de-coninck";
const CORTEZ = "prof-joaquin-cortez";
const ECHENAGORRIA = "prof-joaquin-echenagorria";

const franja = (profesionalId: string, diaSemana: number, horaDesde: string, horaHasta: string, id?: string): FranjaDominio => ({
  id,
  profesionalId,
  diaSemana,
  horaDesde,
  horaHasta,
});

describe("validarFranja (RN-HO-01)", () => {
  it("RN-HO-01 Franja válida: lunes 09:00-12:00 se acepta y se muestra 'Lunes 09:00 - 12:00'", () => {
    const lunes = franja(LAUTARO, 1, "09:00", "12:00", "f1");
    expect(validarFranja(lunes)).toBeNull();
    const semana = agruparFranjasPorDia([lunes]);
    expect(semana[0]).toMatchObject({ diaSemana: 1, nombre: "Lunes" });
    expect(`${semana[0]?.nombre} ${semana[0]?.franjas[0]?.etiqueta}`).toBe("Lunes 09:00 - 12:00");
  });

  it("RN-HO-01 Franja invertida: martes 12:00-09:00 se rechaza en el campo hora hasta", () => {
    expect(validarFranja(franja(CORTEZ, 2, "12:00", "09:00"))).toEqual({
      horaHasta: ["La hora desde debe ser anterior a la hora hasta"],
    });
  });

  it("RN-HO-01 Franja de duración cero: martes 09:00-09:00 no cumple desde < hasta", () => {
    expect(validarFranja(franja(CORTEZ, 2, "09:00", "09:00"))).toEqual({ horaHasta: [MENSAJES.franjaInvertida] });
  });

  it("RN-HO-01 formato: horas y día de la semana fuera de rango se rechazan por campo", () => {
    expect(validarFranja(franja(CORTEZ, 8, "24:00", "9:5"))).toEqual({
      diaSemana: [MENSAJES.diaInvalido],
      horaDesde: [MENSAJES.horaInvalida],
      horaHasta: [MENSAJES.horaInvalida],
    });
  });
});

describe("superposición de franjas (RN-HO-02)", () => {
  const manana = franja(LAUTARO, 1, "09:00", "12:00", "f1");

  it("RN-HO-02 Franja superpuesta el mismo día: lunes 11:00-14:00 contra 09:00-12:00 se rechaza", () => {
    const nueva = franja(LAUTARO, 1, "11:00", "14:00");
    expect(franjasSeSuperponen(nueva, manana)).toBe(true);
    expect(validarFranjaContraExistentes(nueva, [manana])).toBe("La franja se superpone con otra del mismo día (09:00 - 12:00)");
  });

  it("RN-HO-02 Franja contigua: lunes 12:00-14:00 empieza justo cuando termina 09:00-12:00 y se acepta", () => {
    const tarde = franja(LAUTARO, 1, "12:00", "14:00", "f2");
    expect(franjasSeSuperponen(tarde, manana)).toBe(false);
    expect(validarFranjaContraExistentes(tarde, [manana])).toBeNull();
    expect(agruparFranjasPorDia([tarde, manana])[0]?.franjas.map((f) => f.etiqueta)).toEqual(["09:00 - 12:00", "12:00 - 14:00"]);
  });

  it("RN-HO-02 Mismo horario en otro día o de otro profesional: ambas se aceptan", () => {
    const martes = franja(LAUTARO, 2, "09:00", "12:00");
    const otroProfesional = franja(ECHENAGORRIA, 1, "09:00", "12:00");
    expect(validarFranjaContraExistentes(martes, [manana])).toBeNull();
    expect(validarFranjaContraExistentes(otroProfesional, [manana, martes])).toBeNull();
  });

  it("RN-HO-02 Franja contenida en otra: miércoles 09:00-10:00 dentro de 08:00-13:00 se rechaza", () => {
    const larga = franja(CORTEZ, 3, "08:00", "13:00", "f3");
    expect(validarFranjaContraExistentes(franja(CORTEZ, 3, "09:00", "10:00"), [larga])).toBe(
      "La franja se superpone con otra del mismo día (08:00 - 13:00)",
    );
  });

  it("RN-HO-02 Extender una franja: jueves 14:00-18:00 → 14:00-19:00 no choca con su versión anterior", () => {
    const actual = franja(ECHENAGORRIA, 4, "14:00", "18:00", "f4");
    const editada = franja(ECHENAGORRIA, 4, "14:00", "19:00", "f4");
    expect(validarFranjaContraExistentes(editada, [actual], "f4")).toBeNull();
  });

  it("RN-HO-02 Edición que genera superposición: jueves 09:00-12:00 → 09:00-15:00 choca con 14:00-18:00", () => {
    const mananaJueves = franja(ECHENAGORRIA, 4, "09:00", "12:00", "f5");
    const tardeJueves = franja(ECHENAGORRIA, 4, "14:00", "18:00", "f6");
    const editada = franja(ECHENAGORRIA, 4, "09:00", "15:00", "f5");
    expect(validarFranjaContraExistentes(editada, [mananaJueves, tardeJueves], "f5")).toBe(
      "La franja se superpone con otra del mismo día (14:00 - 18:00)",
    );
  });
});

describe("agruparFranjasPorDia", () => {
  it("devuelve los 7 días de lunes a domingo, con las franjas ordenadas por hora", () => {
    const semana = agruparFranjasPorDia([]);
    expect(semana.map((d) => d.nombre)).toEqual(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]);
    expect(semana.every((d) => d.franjas.length === 0)).toBe(true);
  });
});
