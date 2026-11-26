import { describe, expect, it } from "vitest";
import { PERMISOS, puede, seccionesParaRol } from "@/server/auth/matriz";

describe("matriz de permisos (RN-AU-02, RN-AU-03, knowledge-base/03)", () => {
  it("RN-AU-03 feliz: ADMIN gestiona el equipo y ve estadísticas", () => {
    expect(puede("ADMIN", "equipo.gestionar")).toBe(true);
    expect(puede("ADMIN", "estadisticas.ver")).toBe(true);
  });

  it("RN-AU-03 error de negocio: RECEPCION y PROFESIONAL no gestionan el equipo ni ven estadísticas", () => {
    for (const rol of ["RECEPCION", "PROFESIONAL"] as const) {
      expect(puede(rol, "equipo.gestionar")).toBe(false);
      expect(puede(rol, "estadisticas.ver")).toBe(false);
    }
  });

  it("RN-AU-03: crear, confirmar y cancelar turnos es de ADMIN y RECEPCION; el PROFESIONAL solo marca asistencia", () => {
    expect(puede("RECEPCION", "turnos.crear")).toBe(true);
    expect(puede("PROFESIONAL", "turnos.crear")).toBe(false);
    expect(puede("PROFESIONAL", "turnos.cancelar")).toBe(false);
    expect(puede("PROFESIONAL", "turnos.marcarAsistencia")).toBe(true);
    expect(puede("RECEPCION", "turnos.marcarAsistencia")).toBe(false);
  });

  it("borde: el catálogo y la configuración se consultan con cualquier rol pero solo ADMIN los edita", () => {
    expect(puede("PROFESIONAL", "profesionales.ver")).toBe(true);
    expect(puede("RECEPCION", "profesionales.editar")).toBe(false);
    expect(puede("RECEPCION", "pacientes.editar")).toBe(true);
    expect(puede("PROFESIONAL", "pacientes.editar")).toBe(false);
  });

  it("todo permiso tiene al menos un rol", () => {
    for (const roles of Object.values(PERMISOS)) expect(roles.length).toBeGreaterThan(0);
  });

  it("menú: ADMIN ve las 9 secciones; RECEPCION y PROFESIONAL no ven Equipo ni Estadísticas", () => {
    expect(seccionesParaRol("ADMIN").map((s) => s.etiqueta)).toEqual([
      "Agenda", "Pacientes", "Estadísticas", "Profesionales", "Prestaciones", "Sillones", "Horarios", "Equipo", "Componentes",
    ]);
    for (const rol of ["RECEPCION", "PROFESIONAL"] as const) {
      const etiquetas = seccionesParaRol(rol).map((s) => s.etiqueta);
      expect(etiquetas).not.toContain("Equipo");
      expect(etiquetas).not.toContain("Estadísticas");
      expect(etiquetas).toContain("Agenda");
      expect(etiquetas).toContain("Componentes");
    }
  });
});
