import { describe, expect, it } from "vitest";
import { crearAccionesSillones } from "@/server/catalogo/sillones";
import { SillonesEnMemoria, requireRolDe, usuario } from "./fakes";

const ID_BOX_1 = "00000000-0000-4000-8000-0000000000c1";
const ID_BOX_2 = "00000000-0000-4000-8000-0000000000c2";

function armar(rol: "ADMIN" | "RECEPCION" | "PROFESIONAL") {
  const repo = new SillonesEnMemoria([
    { id: ID_BOX_1, nombre: "Box 1", activo: true },
    { id: ID_BOX_2, nombre: "Box 2", activo: false },
  ]);
  const acciones = crearAccionesSillones({ requireRol: requireRolDe(usuario(rol)), repositorio: repo, alCambiar: () => undefined });
  return { acciones, repo };
}

describe("acciones de sillones (RN-CA-03, RN-CA-04)", () => {
  it("error de negocio: 'Box 1' repetido se rechaza", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect(await acciones.crear({ nombre: "Box 1" })).toMatchObject({ ok: false, error: "Ya existe un sillón con el nombre Box 1" });
    expect(repo.filas).toHaveLength(2);
  });

  it("ajuste: 'box 1' también repite 'Box 1'", async () => {
    const { acciones } = armar("ADMIN");
    expect(await acciones.crear({ nombre: "box 1" })).toMatchObject({ ok: false, error: "Ya existe un sillón con el nombre Box 1" });
  });

  it("feliz: 'Box 3' se crea activo", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect((await acciones.crear({ nombre: "Box 3" })).ok).toBe(true);
    expect(repo.filas[2]).toMatchObject({ nombre: "Box 3", activo: true });
  });

  it("reactivar: 'Box 2' desactivado vuelve a quedar activo", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect((await acciones.cambiarActivo(ID_BOX_2, true)).ok).toBe(true);
    expect(repo.filas[1]?.activo).toBe(true);
  });

  it("permisos: PROFESIONAL no puede desactivar 'Box 1' y sigue activo", async () => {
    const { acciones, repo } = armar("PROFESIONAL");
    expect(await acciones.cambiarActivo(ID_BOX_1, false)).toEqual({ ok: false, error: "Sin permisos" });
    expect(repo.filas[0]?.activo).toBe(true);
  });

  it("renombrar con el propio nombre se acepta", async () => {
    const { acciones } = armar("ADMIN");
    expect((await acciones.editar(ID_BOX_1, { nombre: "Box 1" })).ok).toBe(true);
  });

  it("un id inválido se rechaza sin tocar la base", async () => {
    const { acciones } = armar("ADMIN");
    expect(await acciones.cambiarActivo("no-es-un-id", false)).toMatchObject({ ok: false });
  });
});
