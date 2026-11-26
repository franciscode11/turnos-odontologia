import { describe, expect, it } from "vitest";
import { esquemaInvitacion } from "@/domain/equipo/esquemas";
import { MENSAJES_EQUIPO as M } from "@/domain/equipo/mensajes";
import { validarInvitacion } from "@/domain/equipo/reglas";

// Datos ficticios: personal con emails @example.com (DD-17).
const PROF_ECHENAGORRIA = "00000000-0000-4000-8000-0000000000e1";
const USUARIO_CORTEZ = "00000000-0000-4000-8000-0000000000a2";

function parsear(entrada: unknown) {
  const r = esquemaInvitacion.safeParse(entrada);
  if (!r.success) throw new Error(JSON.stringify(r.error.issues));
  return r.data;
}

describe("invitación: esquema (RN-EQ-02, RN-EQ-03)", () => {
  it("RN-EQ-02 feliz: email nuevo como Recepción se normaliza y no lleva profesional", () => {
    expect(parsear({ email: "  Esteban.Lucero@Example.com ", rol: "RECEPCION", profesionalId: "" })).toEqual({
      email: "esteban.lucero@example.com",
      rol: "RECEPCION",
      profesionalId: null,
    });
  });

  it("RN-EQ-02 error: email sin dominio se rechaza en el campo email", () => {
    const r = esquemaInvitacion.safeParse({ email: "esteban.lucero", rol: "RECEPCION" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]).toMatchObject({ path: ["email"], message: M.emailInvalido });
  });

  it("RN-EQ-03 error: Profesional sin profesional vinculado se rechaza en ese campo", () => {
    const r = esquemaInvitacion.safeParse({ email: "esteban.lucero@example.com", rol: "PROFESIONAL", profesionalId: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues).toEqual([expect.objectContaining({ path: ["profesionalId"], message: M.profesionalObligatorio })]);
  });

  it("RN-EQ-03 borde: Recepción con profesional elegido se guarda sin vínculo", () => {
    expect(parsear({ email: "esteban.lucero@example.com", rol: "RECEPCION", profesionalId: PROF_ECHENAGORRIA }).profesionalId).toBeNull();
  });

  it("RN-AU-02 error: un rol que no existe se rechaza", () => {
    expect(esquemaInvitacion.safeParse({ email: "esteban.lucero@example.com", rol: "DUENO" }).success).toBe(false);
  });
});

describe("invitación: reglas (RN-EQ-02, RN-EQ-03)", () => {
  const recepcion = { email: "esteban.lucero@example.com", rol: "RECEPCION" as const, profesionalId: null };

  it("RN-EQ-02 feliz: email libre se acepta", () => {
    expect(validarInvitacion(recepcion, { existente: null, profesional: null })).toBeNull();
  });

  it("RN-EQ-02 error: email de un usuario ACTIVO se rechaza", () => {
    const datos = { ...recepcion, email: "octavio.crescini@example.com" };
    expect(validarInvitacion(datos, { existente: { estado: "ACTIVO" }, profesional: null })).toEqual({
      mensaje: "Ya hay una persona con el email octavio.crescini@example.com en el equipo",
      campo: "email",
    });
  });

  it("RN-EQ-02 borde: email con invitación pendiente (INVITADO) se rechaza igual", () => {
    const datos = parsear({ email: "  Ulises.Lucato@Example.com ", rol: "RECEPCION" });
    expect(validarInvitacion(datos, { existente: { estado: "INVITADO" }, profesional: null })?.mensaje).toBe(
      M.emailEnUso("ulises.lucato@example.com"),
    );
  });

  it("RN-EQ-02 email de un usuario INACTIVO: se pide reactivarlo", () => {
    const datos = { ...recepcion, email: "ana.paz@example.com" };
    expect(validarInvitacion(datos, { existente: { estado: "INACTIVO" }, profesional: null })).toEqual({
      mensaje: M.emailInactivo("ana.paz@example.com"),
      campo: "email",
    });
  });

  it("RN-EQ-03 feliz: Profesional con profesional libre se acepta", () => {
    const datos = { email: "joaquin.e@example.com", rol: "PROFESIONAL" as const, profesionalId: PROF_ECHENAGORRIA };
    expect(validarInvitacion(datos, { existente: null, profesional: { id: PROF_ECHENAGORRIA, usuarioId: null } })).toBeNull();
  });

  it("RN-EQ-03 borde: profesional que ya tiene usuario se rechaza", () => {
    const datos = { email: "otro@example.com", rol: "PROFESIONAL" as const, profesionalId: PROF_ECHENAGORRIA };
    expect(validarInvitacion(datos, { existente: null, profesional: { id: PROF_ECHENAGORRIA, usuarioId: USUARIO_CORTEZ } })).toEqual({
      mensaje: M.profesionalOcupado,
      campo: "profesionalId",
    });
  });

  it("RN-EQ-03 error: profesional inexistente se rechaza", () => {
    const datos = { email: "otro@example.com", rol: "PROFESIONAL" as const, profesionalId: PROF_ECHENAGORRIA };
    expect(validarInvitacion(datos, { existente: null, profesional: null })).toEqual({ mensaje: M.profesionalNoExiste, campo: "profesionalId" });
  });

  it("RN-EQ-03 error: Profesional sin vínculo también lo rechaza la regla", () => {
    const datos = { email: "otro@example.com", rol: "PROFESIONAL" as const, profesionalId: null };
    expect(validarInvitacion(datos, { existente: null, profesional: null })).toEqual({ mensaje: M.profesionalObligatorio, campo: "profesionalId" });
  });
});
