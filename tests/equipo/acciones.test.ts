import { describe, expect, it } from "vitest";
import { MENSAJES_EQUIPO as M } from "@/domain/equipo/mensajes";
import { AHORA, ID, armar, equipoInicial, sesion } from "./dobles";

const REDIRECT = "https://consultorio.example.com/activar-cuenta/verificar";

describe("permisos de las acciones de equipo (RN-EQ-01, RN-AU-03)", () => {
  it("RN-EQ-01 feliz: el ADMIN invita", async () => {
    const { acciones } = armar();
    expect((await acciones.invitar({ email: "esteban.lucero@example.com", rol: "RECEPCION" })).ok).toBe(true);
  });

  it("RN-EQ-01 error: RECEPCION no puede invitar y no se envía nada", async () => {
    const { acciones, auth, repo } = armar({ usuario: sesion("RECEPCION", ID.octavio) });
    expect(await acciones.invitar({ email: "esteban.lucero@example.com", rol: "RECEPCION" })).toEqual({ ok: false, error: "Sin permisos" });
    expect(auth.enviados).toHaveLength(0);
    expect(repo.filas).toHaveLength(5);
  });

  it("RN-EQ-01 borde: PROFESIONAL no puede desactivar ni cambiar roles", async () => {
    const { acciones, repo } = armar({ usuario: sesion("PROFESIONAL", ID.lautaro) });
    expect(await acciones.desactivar({ usuarioId: ID.octavio })).toEqual({ ok: false, error: "Sin permisos" });
    expect(await acciones.cambiarRol({ usuarioId: ID.octavio, rol: "ADMIN" })).toEqual({ ok: false, error: "Sin permisos" });
    expect(repo.fila(ID.octavio)).toMatchObject({ estado: "ACTIVO", rol: "RECEPCION" });
  });

  it("RN-AU-04 sin sesión: 'No autenticado' en cualquier acción", async () => {
    const { acciones } = armar({ usuario: null });
    expect(await acciones.revocar({ usuarioId: ID.ulises })).toEqual({ ok: false, error: "No autenticado" });
  });
});

describe("invitar (RN-EQ-02, RN-EQ-03, RN-AU-01)", () => {
  it("RN-EQ-02 feliz: email nuevo como Recepción queda INVITADO y se envía el email", async () => {
    const { acciones, auth, repo, registro } = armar();
    const r = await acciones.invitar({ email: " Esteban.Lucero@Example.com ", rol: "RECEPCION", profesionalId: "" });
    expect(r).toEqual({ ok: true, data: { id: ID.nuevo, email: "esteban.lucero@example.com" } });
    expect(auth.enviados).toEqual([{ email: "esteban.lucero@example.com", redirectTo: REDIRECT }]);
    expect(repo.fila(ID.nuevo)).toMatchObject({
      estado: "INVITADO", rol: "RECEPCION", profesionalId: null, invitadoPorId: ID.francisco, invitadoEn: AHORA,
    });
    expect(registro.revalidaciones).toBe(1);
  });

  it("RN-EQ-02 error: email de un usuario ACTIVO se rechaza sin enviar", async () => {
    const { acciones, auth } = armar();
    expect(await acciones.invitar({ email: "octavio.crescini@example.com", rol: "RECEPCION" })).toEqual({
      ok: false,
      error: "Ya hay una persona con el email octavio.crescini@example.com en el equipo",
      campos: { email: ["Ya hay una persona con el email octavio.crescini@example.com en el equipo"] },
    });
    expect(auth.enviados).toHaveLength(0);
  });

  it("RN-EQ-02 borde: email de una invitación pendiente con mayúsculas se rechaza", async () => {
    const { acciones } = armar();
    expect(await acciones.invitar({ email: "ULISES.LUCATO@example.com", rol: "RECEPCION" })).toMatchObject({ ok: false, error: M.emailEnUso("ulises.lucato@example.com") });
  });

  it("RN-EQ-02 email inválido: error en el campo email", async () => {
    const { acciones } = armar();
    expect(await acciones.invitar({ email: "esteban.lucero", rol: "RECEPCION" })).toMatchObject({ ok: false, campos: { email: [M.emailInvalido] } });
  });

  it("RN-EQ-03 error: Profesional sin profesional vinculado se rechaza sin enviar", async () => {
    const { acciones, auth } = armar();
    expect(await acciones.invitar({ email: "esteban.lucero@example.com", rol: "PROFESIONAL" })).toMatchObject({
      ok: false,
      campos: { profesionalId: [M.profesionalObligatorio] },
    });
    expect(auth.enviados).toHaveLength(0);
  });

  it("RN-EQ-03 feliz: Profesional con profesional libre queda vinculado", async () => {
    const { acciones, repo } = armar();
    expect((await acciones.invitar({ email: "joaquin.e@example.com", rol: "PROFESIONAL", profesionalId: ID.profEchenagorria })).ok).toBe(true);
    expect(repo.fila(ID.nuevo)).toMatchObject({ rol: "PROFESIONAL", profesionalId: ID.profEchenagorria });
  });

  it("RN-EQ-03 borde: profesional que ya tiene usuario se rechaza", async () => {
    const { acciones, auth } = armar();
    expect(await acciones.invitar({ email: "otro@example.com", rol: "PROFESIONAL", profesionalId: ID.profLautaro })).toMatchObject({
      ok: false,
      error: M.profesionalOcupado,
    });
    expect(auth.enviados).toHaveLength(0);
  });
});

describe("invitación sin estados a medias (compensación)", () => {
  it("feliz: usuario de Auth y fila quedan con el mismo id", async () => {
    const { acciones, auth, repo } = armar();
    await acciones.invitar({ email: "esteban.lucero@example.com", rol: "ADMIN" });
    expect(auth.usuarios.has(ID.nuevo)).toBe(true);
    expect(repo.fila(ID.nuevo)?.rol).toBe("ADMIN");
  });

  it("error: si falla el envío (P-06) no se crea ninguna fila", async () => {
    const { acciones, auth, repo, registro } = armar();
    auth.fallarEnvio = true;
    expect(await acciones.invitar({ email: "esteban.lucero@example.com", rol: "RECEPCION" })).toEqual({ ok: false, error: M.envioFallido });
    expect(repo.filas).toHaveLength(5);
    expect(registro.revalidaciones).toBe(0);
  });

  it("borde: si falla el guardado, se borra el usuario de Auth recién creado", async () => {
    const { acciones, auth, repo } = armar();
    repo.fallarCreacion = true;
    expect(await acciones.invitar({ email: "esteban.lucero@example.com", rol: "RECEPCION" })).toEqual({ ok: false, error: M.guardadoFallido });
    expect(auth.eliminados).toEqual([ID.nuevo]);
    expect(auth.usuarios.has(ID.nuevo)).toBe(false);
  });

  it("email con cuenta de Auth huérfana (confirmada, sin fila): se informa sin crear nada", async () => {
    const { acciones, auth, repo } = armar();
    auth.usuarios.set(ID.nuevo, { email: "huerfano@example.com", confirmado: true });
    expect(await acciones.invitar({ email: "huerfano@example.com", rol: "RECEPCION" })).toEqual({ ok: false, error: M.emailRegistradoEnAuth });
    expect(repo.filas).toHaveLength(5);
  });
});

describe("reenviar y revocar (RN-EQ-04, RN-EQ-07)", () => {
  it("RN-EQ-04 feliz: reenviar una invitación vencida renueva invitadoEn", async () => {
    const filas = equipoInicial();
    filas[3]!.invitadoEn = new Date("2026-11-10T12:00:00Z");
    const { acciones, auth, repo } = armar({ filas });
    expect(await acciones.reenviar({ usuarioId: ID.ulises })).toEqual({ ok: true, data: { id: ID.ulises, email: "ulises.lucato@example.com" } });
    expect(auth.enviados).toEqual([{ email: "ulises.lucato@example.com", redirectTo: REDIRECT }]);
    expect(repo.fila(ID.ulises)?.invitadoEn).toEqual(AHORA);
  });

  it("RN-EQ-07 error: reenviar a un usuario ACTIVO se rechaza", async () => {
    const { acciones, auth } = armar();
    expect(await acciones.reenviar({ usuarioId: ID.octavio })).toEqual({ ok: false, error: M.sinInvitacionPendiente });
    expect(auth.enviados).toHaveLength(0);
  });

  it("RN-EQ-04 borde: reenviar a quien ya abrió el enlace informa y no cambia nada", async () => {
    const { acciones, auth, repo } = armar();
    auth.usuarios.set(ID.ulises, { email: "ulises.lucato@example.com", confirmado: true });
    const antes = repo.fila(ID.ulises)?.invitadoEn;
    expect(await acciones.reenviar({ usuarioId: ID.ulises })).toEqual({ ok: false, error: M.yaAbrioEnlace });
    expect(repo.fila(ID.ulises)?.invitadoEn).toEqual(antes);
  });

  it("RN-EQ-07 feliz: revocar una invitación pendiente borra Auth y la fila", async () => {
    const { acciones, auth, repo } = armar();
    expect((await acciones.revocar({ usuarioId: ID.ulises })).ok).toBe(true);
    expect(auth.eliminados).toEqual([ID.ulises]);
    expect(repo.fila(ID.ulises)).toBeUndefined();
  });

  it("RN-EQ-07 error: revocar a un usuario ACTIVO se rechaza y no borra nada", async () => {
    const { acciones, auth, repo } = armar();
    expect(await acciones.revocar({ usuarioId: ID.octavio })).toEqual({ ok: false, error: M.sinInvitacionPendiente });
    expect(auth.eliminados).toHaveLength(0);
    expect(repo.fila(ID.octavio)?.estado).toBe("ACTIVO");
  });

  it("RN-EQ-07 borde: id inexistente o inválido se rechaza", async () => {
    const { acciones } = armar();
    expect(await acciones.revocar({ usuarioId: ID.nuevo })).toEqual({ ok: false, error: M.usuarioNoExiste });
    expect(await acciones.revocar({ usuarioId: "no-es-un-id" })).toMatchObject({ ok: false, error: M.usuarioNoExiste });
  });
});

describe("cambiar rol (RN-EQ-06, RN-EQ-03, RN-AU-02)", () => {
  it("RN-AU-02 feliz: Recepción pasa a Administrador", async () => {
    const { acciones, repo } = armar();
    expect((await acciones.cambiarRol({ usuarioId: ID.octavio, rol: "ADMIN" })).ok).toBe(true);
    expect(repo.fila(ID.octavio)).toMatchObject({ rol: "ADMIN", profesionalId: null });
  });

  it("RN-EQ-06 error: al último ADMIN activo no se le cambia el rol", async () => {
    const { acciones, repo } = armar();
    expect(await acciones.cambiarRol({ usuarioId: ID.francisco, rol: "RECEPCION" })).toEqual({ ok: false, error: M.ultimoAdmin });
    expect(repo.fila(ID.francisco)?.rol).toBe("ADMIN");
  });

  it("RN-EQ-03 borde: pasar a Profesional sin vínculo se rechaza", async () => {
    const { acciones } = armar();
    expect(await acciones.cambiarRol({ usuarioId: ID.octavio, rol: "PROFESIONAL" })).toMatchObject({ ok: false, campos: { profesionalId: [M.profesionalObligatorio] } });
  });

  it("RN-EQ-03 dejar de ser Profesional libera el vínculo", async () => {
    const { acciones, repo } = armar();
    expect((await acciones.cambiarRol({ usuarioId: ID.lautaro, rol: "RECEPCION", profesionalId: ID.profLautaro })).ok).toBe(true);
    expect(repo.fila(ID.lautaro)).toMatchObject({ rol: "RECEPCION", profesionalId: null });
    expect((await acciones.invitar({ email: "nuevo.prof@example.com", rol: "PROFESIONAL", profesionalId: ID.profLautaro })).ok).toBe(true);
  });
});

describe("desactivar y reactivar (RN-EQ-06, RN-EQ-07, RN-AU-05)", () => {
  it("RN-EQ-07 feliz: desactivar a Recepción lo deja INACTIVO sin borrarlo", async () => {
    const { acciones, repo } = armar();
    expect((await acciones.desactivar({ usuarioId: ID.octavio })).ok).toBe(true);
    expect(repo.fila(ID.octavio)?.estado).toBe("INACTIVO");
    expect(repo.filas).toHaveLength(5);
  });

  it("RN-EQ-06 error: el ADMIN no se desactiva a sí mismo", async () => {
    const { acciones, repo } = armar();
    expect(await acciones.desactivar({ usuarioId: ID.francisco })).toEqual({ ok: false, error: M.desactivarseASiMismo });
    expect(repo.fila(ID.francisco)?.estado).toBe("ACTIVO");
  });

  it("RN-EQ-06 borde: con dos ADMIN, desactivar al otro se acepta y deja uno activo", async () => {
    const filas = equipoInicial();
    filas[1]!.rol = "ADMIN";
    const { acciones, repo } = armar({ filas });
    expect((await acciones.desactivar({ usuarioId: ID.octavio })).ok).toBe(true);
    expect(await repo.contarAdminsActivos()).toBe(1);
    // Octavio ya no está activo: el que queda no puede desactivarse a sí mismo.
    expect(await acciones.desactivar({ usuarioId: ID.francisco })).toEqual({ ok: false, error: M.desactivarseASiMismo });
  });

  it("RN-AU-05 desactivar una invitación pendiente se rechaza", async () => {
    const { acciones } = armar();
    expect(await acciones.desactivar({ usuarioId: ID.ulises })).toEqual({ ok: false, error: M.soloActivos });
  });

  it("RN-EQ-07 feliz: reactivar a un INACTIVO lo deja ACTIVO con su rol", async () => {
    const { acciones, repo } = armar();
    expect((await acciones.reactivar({ usuarioId: ID.ana })).ok).toBe(true);
    expect(repo.fila(ID.ana)).toMatchObject({ estado: "ACTIVO", rol: "RECEPCION" });
  });

  it("RN-AU-05 error: reactivar a un ACTIVO se rechaza", async () => {
    const { acciones } = armar();
    expect(await acciones.reactivar({ usuarioId: ID.octavio })).toEqual({ ok: false, error: M.soloInactivos });
  });
});
