import { describe, expect, it, vi } from "vitest";
import type { DatosPaciente } from "@/domain/pacientes/esquemas";
import type { Paciente } from "@/domain/pacientes/tipos";
import { crearControlDeAcceso } from "@/server/auth/acceso";
import type { Rol } from "@/generated/prisma/enums";
import { crearAccionesPacientes, type RepositorioPacientes } from "@/server/pacientes/servicio";

const id1 = "00000000-0000-4000-8000-000000000001";
const id2 = "00000000-0000-4000-8000-000000000002";
const nuevoId = "00000000-0000-4000-8000-000000000003";
const base: DatosPaciente = {
  nombre: "Paciente",
  apellido: "Ejemplo",
  dni: "30123456",
  fechaNacimiento: "1990-03-12",
  telefono: "0000000000",
  email: null,
  obraSocial: null,
  numeroAfiliado: null,
};

type Fila = Paciente & { activo: boolean; turnos: string[] };

function fila(id: string, datos: Partial<DatosPaciente> = {}, activo = true): Fila {
  return { ...base, ...datos, id, avatar: null, activo, turnos: ["turno-ficticio"] };
}

function armar(rol: Rol | null = "RECEPCION", filas: Fila[] = []) {
  const repositorio = {
    crear: vi.fn<RepositorioPacientes["crear"]>(async (datos) => {
      if (filas.some((f) => f.activo && f.dni === datos.dni)) throw { code: "P2002" };
      const paciente = fila(nuevoId, datos);
      filas.push(paciente);
      return paciente;
    }),
    editar: vi.fn<RepositorioPacientes["editar"]>(async (id, datos) => {
      const paciente = filas.find((f) => f.id === id && f.activo);
      if (!paciente) return null;
      if (filas.some((f) => f.activo && f.id !== id && f.dni === datos.dni)) throw { code: "P2002" };
      Object.assign(paciente, datos);
      return paciente;
    }),
    darDeBaja: vi.fn<RepositorioPacientes["darDeBaja"]>(async (id) => {
      const paciente = filas.find((f) => f.id === id && f.activo);
      if (!paciente) return false;
      paciente.activo = false;
      return true;
    }),
    buscar: vi.fn<RepositorioPacientes["buscar"]>(async (criterio, pagina) => {
      const pacientes = filas.filter((f) => f.activo && (
        !criterio || ("dni" in criterio ? f.dni === criterio.dni : f.apellido.toLowerCase().includes(criterio.apellido.toLowerCase()))
      ));
      return { pacientes, pagina, paginas: 2 };
    }),
  } satisfies RepositorioPacientes;

  const { requireRol } = crearControlDeAcceso(async () => rol ? {
    id: id1, email: "prueba@example.com", nombre: null, profesionalId: null, avatar: null, rol,
  } : null);
  const alCambiar = vi.fn();
  const acciones = crearAccionesPacientes({ requireRol, repositorio, alCambiar });
  return { acciones, repositorio, filas, alCambiar };
}

describe("alta de pacientes", () => {
  it("crea un paciente activo y permite buscarlo por apellido", async () => {
    const { acciones, alCambiar } = armar();
    expect(await acciones.crear(base)).toMatchObject({ ok: true, data: { id: nuevoId } });
    expect(await acciones.buscar({ consulta: "jemp", pagina: 1 })).toMatchObject({
      ok: true, data: { pacientes: [{ id: nuevoId, apellido: "Ejemplo" }] },
    });
    expect(alCambiar).toHaveBeenCalledOnce();
  });

  it.each(["30123456", "30.123.456"])("rechaza el DNI activo %s", async (dni) => {
    const { acciones, filas, alCambiar } = armar("RECEPCION", [fila(id1)]);
    expect(await acciones.crear({ ...base, dni })).toMatchObject({ ok: false, error: "Ya existe un paciente con ese DNI" });
    expect(filas).toHaveLength(1);
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it("admite el DNI de un registro dado de baja sin alterar su historial", async () => {
    const anterior = fila(id1, {}, false);
    const { acciones, filas } = armar("RECEPCION", [anterior]);
    expect(await acciones.crear(base)).toMatchObject({ ok: true, data: { id: nuevoId } });
    expect(filas.filter((f) => f.activo)).toHaveLength(1);
    expect(anterior).toMatchObject({ id: id1, activo: false, turnos: ["turno-ficticio"] });
  });

  it("traduce el conflicto de unicidad cuando llegan dos altas concurrentes", async () => {
    const { acciones, filas } = armar();
    const resultados = await Promise.all([acciones.crear(base), acciones.crear(base)]);
    expect(resultados.filter((r) => r.ok)).toHaveLength(1);
    expect(resultados).toContainEqual(expect.objectContaining({ error: "Ya existe un paciente con ese DNI" }));
    expect(filas).toHaveLength(1);
  });

  it("rechaza datos faltantes y una fecha futura antes de escribir", async () => {
    const { acciones, repositorio } = armar();
    expect(await acciones.crear({ ...base, telefono: "", fechaNacimiento: "2099-01-01" })).toMatchObject({
      ok: false,
      campos: { telefono: ["Ingresá el teléfono"], fechaNacimiento: ["La fecha de nacimiento no puede ser futura"] },
    });
    expect(repositorio.crear).not.toHaveBeenCalled();
  });
});

describe("edición, búsqueda y baja", () => {
  it("permite editar el teléfono conservando el DNI propio", async () => {
    const { acciones, filas } = armar("RECEPCION", [fila(id1)]);
    expect(await acciones.editar(id1, { ...base, telefono: "0000000001" })).toMatchObject({ ok: true });
    expect(filas[0]).toMatchObject({ telefono: "0000000001", dni: base.dni });
  });

  it("no modifica el registro cuando su DNI nuevo pertenece a otro paciente activo", async () => {
    const { acciones, filas } = armar("RECEPCION", [fila(id1), fila(id2, { dni: "11111111" })]);
    expect(await acciones.editar(id1, { ...base, dni: "11111111" })).toMatchObject({ ok: false, error: "Ya existe un paciente con ese DNI" });
    expect(filas[0]?.dni).toBe(base.dni);
    expect(filas[1]?.dni).toBe("11111111");
  });

  it("busca el DNI con puntos y transmite la página solicitada", async () => {
    const { acciones, repositorio } = armar("PROFESIONAL", [fila(id1)]);
    expect(await acciones.buscar({ consulta: "30.123.456", pagina: 2 })).toMatchObject({
      ok: true, data: { pagina: 2, pacientes: [{ id: id1 }] },
    });
    expect(repositorio.buscar).toHaveBeenCalledWith({ dni: "30123456" }, 2);
  });

  it("da de baja sin borrar, y retira al paciente de la búsqueda activa", async () => {
    const paciente = fila(id1);
    const { acciones } = armar("RECEPCION", [paciente]);
    expect(await acciones.darDeBaja(id1)).toMatchObject({ ok: true });
    expect(paciente).toMatchObject({ activo: false, turnos: ["turno-ficticio"] });
    expect(await acciones.buscar({ consulta: "Ejemplo", pagina: 1 })).toMatchObject({ ok: true, data: { pacientes: [] } });
    expect(await acciones.editar(id1, base)).toMatchObject({ ok: false });
  });
});

describe("permisos", () => {
  it("rechaza las tres escrituras directas de PROFESIONAL antes de acceder al repositorio", async () => {
    const { acciones, repositorio } = armar("PROFESIONAL");
    expect(await acciones.crear(base)).toEqual({ ok: false, error: "Sin permisos" });
    expect(await acciones.editar(id1, base)).toEqual({ ok: false, error: "Sin permisos" });
    expect(await acciones.darDeBaja(id1)).toEqual({ ok: false, error: "Sin permisos" });
    expect(repositorio.crear).not.toHaveBeenCalled();
    expect(repositorio.editar).not.toHaveBeenCalled();
    expect(repositorio.darDeBaja).not.toHaveBeenCalled();
  });

  it("rechaza consultas y escrituras sin sesión antes incluso de validar su entrada", async () => {
    const { acciones, repositorio } = armar(null);
    expect(await acciones.buscar(null)).toEqual({ ok: false, error: "No autenticado" });
    expect(await acciones.crear(null)).toEqual({ ok: false, error: "No autenticado" });
    expect(repositorio.buscar).not.toHaveBeenCalled();
    expect(repositorio.crear).not.toHaveBeenCalled();
  });
});
