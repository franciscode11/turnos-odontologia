import { describe, expect, it, vi } from "vitest";
import { crearAccionesPrestaciones } from "@/server/catalogo/prestaciones";
import { MENSAJE_DURACION } from "@/domain/catalogo/reglas";
import { PrestacionesEnMemoria, requireRolDe, usuario } from "./fakes";

function armar(rol: "ADMIN" | "RECEPCION" | "PROFESIONAL" | null, repo = new PrestacionesEnMemoria()) {
  const alCambiar = vi.fn();
  const acciones = crearAccionesPrestaciones({ requireRol: requireRolDe(rol ? usuario(rol) : null), repositorio: repo, alCambiar });
  return { acciones, repo, alCambiar };
}

describe("acciones de prestaciones (US-020)", () => {
  it("feliz: un ADMIN crea 'Limpieza' de 30 minutos y queda activa", async () => {
    const { acciones, repo, alCambiar } = armar("ADMIN");
    const r = await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null });
    expect(r.ok).toBe(true);
    expect(repo.filas).toEqual([expect.objectContaining({ nombre: "Limpieza", duracionMinutos: 30, activo: true })]);
    expect(alCambiar).toHaveBeenCalledOnce();
  });

  it("error de negocio: 7 minutos se rechaza con el mensaje de RN-CA-02 y no se guarda nada", async () => {
    const { acciones, repo } = armar("ADMIN");
    const r = await acciones.crear({ nombre: "Limpieza", duracionMinutos: 7, precioReferencia: null });
    expect(r).toEqual({ ok: false, error: "Revisá los datos del formulario", campos: { duracionMinutos: [MENSAJE_DURACION] } });
    expect(repo.filas).toHaveLength(0);
  });

  it("borde: exactamente 240 minutos se acepta", async () => {
    const { acciones, repo } = armar("ADMIN");
    const r = await acciones.crear({ nombre: "Cirugía compleja", duracionMinutos: 240, precioReferencia: 85000 });
    expect(r.ok).toBe(true);
    expect(repo.filas[0]).toMatchObject({ duracionMinutos: 240, activo: true });
  });

  it("ajuste: precio negativo se rechaza en el campo precio", async () => {
    const { acciones, repo } = armar("ADMIN");
    const r = await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: -100 });
    expect(r).toMatchObject({ ok: false, campos: { precioReferencia: ["El precio de referencia no puede ser negativo"] } });
    expect(repo.filas).toHaveLength(0);
  });

  it("permisos: RECEPCION recibe 'Sin permisos' y no se guarda nada", async () => {
    const { acciones, repo } = armar("RECEPCION");
    expect(await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null })).toEqual({ ok: false, error: "Sin permisos" });
    expect(repo.filas).toHaveLength(0);
  });

  it("permisos: sin sesión recibe 'No autenticado'", async () => {
    const { acciones } = armar(null);
    expect(await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null })).toEqual({ ok: false, error: "No autenticado" });
  });

  it("editar la duración cambia solo la prestación (los turnos guardan su propia hora de fin, SU-04)", async () => {
    const { acciones, repo } = armar("ADMIN");
    const creada = await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null });
    if (!creada.ok) throw new Error("no se creó");
    const r = await acciones.editar(creada.data.id, { nombre: "Limpieza", duracionMinutos: 45, precioReferencia: null });
    expect(r.ok).toBe(true);
    expect(repo.filas[0]?.duracionMinutos).toBe(45);
  });

  it("baja lógica: desactivar deja la prestación en la base con activo = false", async () => {
    const { acciones, repo } = armar("ADMIN");
    const creada = await acciones.crear({ nombre: "Limpieza", duracionMinutos: 30, precioReferencia: null });
    if (!creada.ok) throw new Error("no se creó");
    expect((await acciones.cambiarActivo(creada.data.id, false)).ok).toBe(true);
    expect(repo.filas).toEqual([expect.objectContaining({ nombre: "Limpieza", activo: false })]);
  });

  it("editar una prestación inexistente devuelve un error", async () => {
    const { acciones } = armar("ADMIN");
    const r = await acciones.editar("00000000-0000-4000-8000-999999999999", { nombre: "X", duracionMinutos: 30, precioReferencia: null });
    expect(r).toEqual({ ok: false, error: "La prestación no existe" });
  });
});
