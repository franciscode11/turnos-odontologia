import { describe, expect, it } from "vitest";
import { permisosCatalogo, SECCIONES_CATALOGO } from "@/server/catalogo/permisos";

describe("permisos del catálogo (RN-CA-06)", () => {
  it("ADMIN consulta y edita las tres secciones", () => {
    for (const seccion of SECCIONES_CATALOGO) {
      expect(permisosCatalogo("ADMIN", seccion)).toEqual({ ver: true, editar: true });
    }
  });

  it("RECEPCION y PROFESIONAL solo consultan: la pantalla no ofrece acciones", () => {
    for (const rol of ["RECEPCION", "PROFESIONAL"] as const) {
      for (const seccion of SECCIONES_CATALOGO) {
        expect(permisosCatalogo(rol, seccion)).toEqual({ ver: true, editar: false });
      }
    }
  });

  it("cubre profesionales, prestaciones y sillones", () => {
    expect([...SECCIONES_CATALOGO]).toEqual(["profesionales", "prestaciones", "sillones"]);
  });
});
