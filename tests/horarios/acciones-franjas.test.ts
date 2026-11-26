import { describe, expect, it } from "vitest";
import { PERMISOS, puede } from "@/server/auth/matriz";
import { ROLES_EDICION, RUTA_HORARIOS } from "@/server/horarios/acciones";
import { accionesComo, crearRepositorioEnMemoria, PROF } from "./doble-repositorio";

const ADMIN = "francisco.valles@example.com";

describe("Server Actions de franjas (RN-HO-01, RN-HO-02, RN-HO-06, RN-AU-03)", () => {
  it("RN-HO-06 ADMIN carga una franja: lunes 15:00-19:00 para el Dr. Joaquín Cortez se guarda y revalida la pantalla", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones, revalidadas } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.cortez, diaSemana: 1, horaDesde: "15:00", horaHasta: "19:00" });
    expect(r.ok).toBe(true);
    expect([...memoria.franjas.values()]).toMatchObject([{ profesionalId: PROF.cortez, diaSemana: 1, horaDesde: "15:00", horaHasta: "19:00" }]);
    expect(revalidadas).toEqual([RUTA_HORARIOS]);
    expect(memoria.registro.transacciones).toBe(1);
  });

  it("RN-HO-06 RN-AU-03 RECEPCION intenta cargar una franja: 'Sin permisos' y no guarda nada", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo("octavio.crescini@example.com", memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.cortez, diaSemana: 1, horaDesde: "15:00", horaHasta: "19:00" });
    expect(r).toEqual({ ok: false, error: "Sin permisos" });
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-AU-03 Acción sin sesión: 'No autenticado' antes de verificar el rol, sin leer ni escribir", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(null, memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.cortez, diaSemana: 1, horaDesde: "15:00", horaHasta: "19:00" });
    expect(r).toEqual({ ok: false, error: "No autenticado" });
    expect(memoria.registro).toEqual({ lecturas: 0, escrituras: 0, transacciones: 0 });
  });

  it("RN-HO-01 Franja invertida: martes 12:00-09:00 vuelve con el error en hora hasta y no guarda", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.cortez, diaSemana: 2, horaDesde: "12:00", horaHasta: "09:00" });
    expect(r).toEqual({
      ok: false,
      error: "La hora desde debe ser anterior a la hora hasta",
      campos: { horaHasta: ["La hora desde debe ser anterior a la hora hasta"] },
    });
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-HO-02 Franja superpuesta el mismo día: lunes 11:00-14:00 contra 09:00-12:00 se rechaza sin escribir", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [{ id: "f1", profesionalId: PROF.lautaro, diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" }] });
    const { acciones, revalidadas } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.lautaro, diaSemana: 1, horaDesde: "11:00", horaHasta: "14:00" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La franja se superpone con otra del mismo día (09:00 - 12:00)");
    expect(memoria.registro.escrituras).toBe(0);
    expect(memoria.franjas.size).toBe(1);
    expect(revalidadas).toEqual([]);
  });

  it("RN-HO-02 Franja contigua: lunes 12:00-14:00 junto a 09:00-12:00 se guarda y el lunes tiene las dos", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [{ id: "f1", profesionalId: PROF.lautaro, diaSemana: 1, horaDesde: "09:00", horaHasta: "12:00" }] });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.crearFranja({ profesionalId: PROF.lautaro, diaSemana: 1, horaDesde: "12:00", horaHasta: "14:00" });
    expect(r.ok).toBe(true);
    expect(memoria.franjas.size).toBe(2);
  });

  it("RN-HO-02 Extender una franja: jueves 14:00-18:00 → 14:00-19:00 se guarda sin chocar consigo misma", async () => {
    const memoria = crearRepositorioEnMemoria({ franjas: [{ id: "f4", profesionalId: PROF.echenagorria, diaSemana: 4, horaDesde: "14:00", horaHasta: "18:00" }] });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.editarFranja({ id: "f4", datos: { profesionalId: PROF.echenagorria, diaSemana: 4, horaDesde: "14:00", horaHasta: "19:00" } });
    expect(r.ok).toBe(true);
    expect(memoria.franjas.get("f4")?.horaHasta).toBe("19:00");
  });

  it("RN-HO-02 Edición que genera superposición: la franja de la mañana conserva 09:00-12:00", async () => {
    const memoria = crearRepositorioEnMemoria({
      franjas: [
        { id: "f5", profesionalId: PROF.echenagorria, diaSemana: 4, horaDesde: "09:00", horaHasta: "12:00" },
        { id: "f6", profesionalId: PROF.echenagorria, diaSemana: 4, horaDesde: "14:00", horaHasta: "18:00" },
      ],
    });
    const { acciones } = accionesComo(ADMIN, memoria);
    const r = await acciones.editarFranja({ id: "f5", datos: { profesionalId: PROF.echenagorria, diaSemana: 4, horaDesde: "09:00", horaHasta: "15:00" } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La franja se superpone con otra del mismo día (14:00 - 18:00)");
    expect(memoria.franjas.get("f5")?.horaHasta).toBe("12:00");
  });

  it("RN-HO-04 Eliminar una franja: el viernes deja de tener disponibilidad y los turnos no cambian", async () => {
    const memoria = crearRepositorioEnMemoria({
      franjas: [{ id: "f7", profesionalId: PROF.echenagorria, diaSemana: 5, horaDesde: "09:00", horaHasta: "12:00" }],
      turnos: [
        { id: "t1", profesionalId: PROF.echenagorria, paciente: "Paciente Ficticio", inicio: new Date("2026-12-04T13:00:00Z"), fin: new Date("2026-12-04T13:30:00Z"), estado: "RESERVADO" },
      ],
    });
    const { acciones, revalidadas } = accionesComo(ADMIN, memoria);
    expect((await acciones.eliminarFranja({ id: "f7" })).ok).toBe(true);
    expect(memoria.franjas.size).toBe(0);
    expect(revalidadas).toEqual([RUTA_HORARIOS]);
    const consulta = await acciones.consultarDisponibilidad({ profesionalId: PROF.echenagorria, fecha: "2026-12-04", duracion: 30 });
    expect(consulta.ok && consulta.data.mensajeVacio).toBe("El profesional no atiende ese día");
    expect(memoria.turnos[0]?.estado).toBe("RESERVADO");
  });

  it("RN-HO-06 borde: eliminar una franja que ya no existe avisa sin escribir", async () => {
    const memoria = crearRepositorioEnMemoria();
    const { acciones } = accionesComo(ADMIN, memoria);
    expect(await acciones.eliminarFranja({ id: "no-existe" })).toEqual({ ok: false, error: "La franja ya no existe" });
    expect(memoria.registro.escrituras).toBe(0);
  });

  it("RN-HO-06 PROFESIONAL consulta el horario semanal: ve las franjas pero la pantalla oculta crear, editar y eliminar", () => {
    expect(puede("PROFESIONAL", "horarios.ver")).toBe(true);
    expect(puede("PROFESIONAL", "horarios.editar")).toBe(false);
    // Los roles de las acciones coinciden con la matriz de C-01 (única fuente de permisos).
    expect([...ROLES_EDICION]).toEqual([...PERMISOS["horarios.editar"]]);
  });
});
