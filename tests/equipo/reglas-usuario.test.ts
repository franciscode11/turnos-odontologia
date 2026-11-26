import { describe, expect, it } from "vitest";
import { esquemaCambioRol } from "@/domain/equipo/esquemas";
import { MENSAJES_EQUIPO as M } from "@/domain/equipo/mensajes";
import {
  validarCambioRol,
  validarDesactivacion,
  validarInvitacionPendiente,
  validarReactivacion,
} from "@/domain/equipo/reglas";
import type { UsuarioEquipo } from "@/domain/equipo/tipos";

// Datos ficticios (DD-17).
const FRANCISCO: UsuarioEquipo = { id: "00000000-0000-4000-8000-0000000000a1", email: "francisco.valles@example.com", rol: "ADMIN", estado: "ACTIVO", profesionalId: null };
const OCTAVIO: UsuarioEquipo = { id: "00000000-0000-4000-8000-0000000000a3", email: "octavio.crescini@example.com", rol: "RECEPCION", estado: "ACTIVO", profesionalId: null };
const LAUTARO: UsuarioEquipo = { id: "00000000-0000-4000-8000-0000000000a4", email: "lautaro.deconinck@example.com", rol: "PROFESIONAL", estado: "ACTIVO", profesionalId: "00000000-0000-4000-8000-0000000000e2" };
const ULISES: UsuarioEquipo = { id: "00000000-0000-4000-8000-0000000000a5", email: "ulises.lucato@example.com", rol: "RECEPCION", estado: "INVITADO", profesionalId: null };
const PROF_LIBRE = "00000000-0000-4000-8000-0000000000e1";

describe("cambio de rol (RN-EQ-06, RN-EQ-03, RN-AU-02)", () => {
  it("RN-AU-02 feliz: Recepción pasa a Administrador", () => {
    expect(validarCambioRol({ objetivo: OCTAVIO, rol: "ADMIN", profesionalId: null, adminsActivos: 1, profesional: null })).toBeNull();
  });

  it("RN-EQ-06 error: al último ADMIN activo no se le cambia el rol", () => {
    expect(validarCambioRol({ objetivo: FRANCISCO, rol: "RECEPCION", profesionalId: null, adminsActivos: 1, profesional: null })).toEqual({
      mensaje: M.ultimoAdmin,
    });
  });

  it("RN-EQ-06 con otro ADMIN activo sí se puede", () => {
    expect(validarCambioRol({ objetivo: FRANCISCO, rol: "RECEPCION", profesionalId: null, adminsActivos: 2, profesional: null })).toBeNull();
  });

  it("RN-EQ-03 borde: pasar a Profesional sin vínculo se rechaza (esquema)", () => {
    const r = esquemaCambioRol.safeParse({ usuarioId: OCTAVIO.id, rol: "PROFESIONAL", profesionalId: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]).toMatchObject({ path: ["profesionalId"], message: M.profesionalObligatorio });
  });

  it("RN-EQ-03 pasar a Profesional con un profesional ocupado por otro se rechaza", () => {
    expect(
      validarCambioRol({ objetivo: OCTAVIO, rol: "PROFESIONAL", profesionalId: PROF_LIBRE, adminsActivos: 1, profesional: { id: PROF_LIBRE, usuarioId: LAUTARO.id } }),
    ).toEqual({ mensaje: M.profesionalOcupado, campo: "profesionalId" });
  });

  it("RN-EQ-03 pasar a Profesional con un profesional libre se acepta", () => {
    expect(
      validarCambioRol({ objetivo: OCTAVIO, rol: "PROFESIONAL", profesionalId: PROF_LIBRE, adminsActivos: 1, profesional: { id: PROF_LIBRE, usuarioId: null } }),
    ).toBeNull();
  });

  it("RN-EQ-03 dejar de ser Profesional libera el vínculo (el esquema lo vacía)", () => {
    const r = esquemaCambioRol.safeParse({ usuarioId: LAUTARO.id, rol: "RECEPCION", profesionalId: LAUTARO.profesionalId });
    expect(r.success && r.data.profesionalId).toBeNull();
    expect(validarCambioRol({ objetivo: LAUTARO, rol: "RECEPCION", profesionalId: null, adminsActivos: 1, profesional: null })).toBeNull();
  });

  it("RN-AU-02 borde: el mismo rol y vínculo no es un cambio", () => {
    expect(validarCambioRol({ objetivo: OCTAVIO, rol: "RECEPCION", profesionalId: null, adminsActivos: 1, profesional: null })).toEqual({ mensaje: M.mismoRol });
  });
});

describe("desactivar y reactivar (RN-EQ-06, RN-EQ-07, RN-AU-05)", () => {
  it("RN-EQ-07 feliz: desactivar a Recepción activo se acepta", () => {
    expect(validarDesactivacion({ objetivo: OCTAVIO, actorId: FRANCISCO.id, adminsActivos: 1 })).toBeNull();
  });

  it("RN-EQ-06 error: nadie se desactiva a sí mismo", () => {
    expect(validarDesactivacion({ objetivo: FRANCISCO, actorId: FRANCISCO.id, adminsActivos: 2 })).toEqual({ mensaje: M.desactivarseASiMismo });
  });

  it("RN-EQ-06 borde: el último ADMIN activo no se desactiva", () => {
    expect(validarDesactivacion({ objetivo: FRANCISCO, actorId: "00000000-0000-4000-8000-0000000000ff", adminsActivos: 1 })).toEqual({ mensaje: M.ultimoAdmin });
  });

  it("RN-AU-05 una invitación pendiente no se desactiva (se revoca)", () => {
    expect(validarDesactivacion({ objetivo: ULISES, actorId: FRANCISCO.id, adminsActivos: 1 })).toEqual({ mensaje: M.soloActivos });
  });

  it("RN-EQ-07 feliz: reactivar a un usuario INACTIVO se acepta", () => {
    expect(validarReactivacion({ ...OCTAVIO, estado: "INACTIVO" })).toBeNull();
  });

  it("RN-AU-05 error: reactivar a un usuario ACTIVO o INVITADO se rechaza", () => {
    expect(validarReactivacion(OCTAVIO)).toEqual({ mensaje: M.soloInactivos });
    expect(validarReactivacion(ULISES)).toEqual({ mensaje: M.soloInactivos });
  });
});

describe("invitación pendiente para reenviar o revocar (RN-EQ-04, RN-EQ-07)", () => {
  it("RN-EQ-04 feliz: un INVITADO tiene invitación pendiente", () => {
    expect(validarInvitacionPendiente(ULISES)).toBeNull();
  });

  it("RN-EQ-07 error: un ACTIVO no tiene invitación que revocar", () => {
    expect(validarInvitacionPendiente(OCTAVIO)).toEqual({ mensaje: M.sinInvitacionPendiente });
  });

  it("RN-EQ-07 borde: un INACTIVO tampoco", () => {
    expect(validarInvitacionPendiente({ ...OCTAVIO, estado: "INACTIVO" })).toEqual({ mensaje: M.sinInvitacionPendiente });
  });
});
