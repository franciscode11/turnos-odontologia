import { describe, expect, it } from "vitest";
import { crearAccionesProfesionales } from "@/server/catalogo/profesionales";
import { ProfesionalesEnMemoria, requireRolDe, usuario } from "./fakes";

const ID_EXISTENTE = "00000000-0000-4000-8000-0000000000a1";

function armar(rol: "ADMIN" | "RECEPCION" | "PROFESIONAL", activo = true) {
  const repo = new ProfesionalesEnMemoria([
    { id: ID_EXISTENTE, nombre: "Lucía", apellido: "Fernández", matricula: "MP-1234", especialidad: null, activo },
  ]);
  const acciones = crearAccionesProfesionales({ requireRol: requireRolDe(usuario(rol)), repositorio: repo, alCambiar: () => undefined });
  return { acciones, repo };
}

const nuevo = (matricula: string) => ({ nombre: "Martín", apellido: "Gómez", matricula, especialidad: "Ortodoncia" });

describe("acciones de profesionales (RN-CA-01)", () => {
  it("error de negocio: una matrícula repetida en el alta se rechaza y no se crea", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect(await acciones.crear(nuevo("MP-1234"))).toEqual({
      ok: false,
      error: "Ya existe un profesional con la matrícula MP-1234",
      campos: { matricula: ["Ya existe un profesional con la matrícula MP-1234"] },
    });
    expect(repo.filas).toHaveLength(1);
  });

  it("ajuste: ' mp-1234 ' también se rechaza", async () => {
    const { acciones } = armar("ADMIN");
    expect(await acciones.crear(nuevo(" mp-1234 "))).toMatchObject({ ok: false, error: "Ya existe un profesional con la matrícula MP-1234" });
  });

  it("la matrícula de un profesional inactivo también se rechaza", async () => {
    const { acciones } = armar("ADMIN", false);
    expect((await acciones.crear(nuevo("MP-1234"))).ok).toBe(false);
  });

  it("feliz: una matrícula nueva se crea activa y normalizada", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect((await acciones.crear(nuevo("mp-5678"))).ok).toBe(true);
    expect(repo.filas[1]).toMatchObject({ matricula: "MP-5678", activo: true });
  });

  it("editar poniendo la matrícula de otro se rechaza y conserva la original", async () => {
    const { acciones, repo } = armar("ADMIN");
    const otro = await acciones.crear(nuevo("MP-5678"));
    if (!otro.ok) throw new Error("no se creó");
    const r = await acciones.editar(otro.data.id, nuevo("MP-1234"));
    expect(r).toMatchObject({ ok: false, error: "Ya existe un profesional con la matrícula MP-1234" });
    expect(repo.filas[1]?.matricula).toBe("MP-5678");
  });

  it("editar sin cambiar la propia matrícula se acepta", async () => {
    const { acciones, repo } = armar("ADMIN");
    const r = await acciones.editar(ID_EXISTENTE, { nombre: "Lucía", apellido: "Fernández", matricula: "MP-1234", especialidad: "Endodoncia" });
    expect(r.ok).toBe(true);
    expect(repo.filas[0]?.especialidad).toBe("Endodoncia");
  });

  it("si la base rechaza por unicidad (P2002) se devuelve el mismo mensaje", async () => {
    const { acciones, repo } = armar("ADMIN");
    repo.crear = async () => {
      throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    };
    expect(await acciones.crear(nuevo("MP-7777"))).toMatchObject({ ok: false, error: "Ya existe un profesional con la matrícula MP-7777" });
  });

  it("baja lógica: desactivar no borra al profesional", async () => {
    const { acciones, repo } = armar("ADMIN");
    expect((await acciones.cambiarActivo(ID_EXISTENTE, false)).ok).toBe(true);
    expect(repo.filas).toEqual([expect.objectContaining({ id: ID_EXISTENTE, activo: false })]);
  });

  it("permisos: PROFESIONAL no puede crear", async () => {
    const { acciones, repo } = armar("PROFESIONAL");
    expect(await acciones.crear(nuevo("MP-5678"))).toEqual({ ok: false, error: "Sin permisos" });
    expect(repo.filas).toHaveLength(1);
  });

  it("datos obligatorios: matrícula vacía se rechaza en el campo matrícula", async () => {
    const { acciones } = armar("ADMIN");
    expect(await acciones.crear({ nombre: "Ana", apellido: "Pérez", matricula: "  ", especialidad: "" })).toMatchObject({
      ok: false,
      campos: { matricula: ["Ingresá la matrícula"] },
    });
  });
});
