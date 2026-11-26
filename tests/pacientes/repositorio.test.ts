import { beforeEach, describe, expect, it, vi } from "vitest";
import { repositorioPacientes } from "@/server/pacientes/repositorio";

const db = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  count: vi.fn(),
  findMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/server/db", () => ({ prisma: { paciente: db, $transaction: db.transaction } }));

const datos = {
  nombre: "Paciente", apellido: "Ejemplo", dni: "30123456", telefono: "0000000000",
  fechaNacimiento: "1990-03-12", email: null, obraSocial: null, numeroAfiliado: null,
};
const id = "00000000-0000-4000-8000-000000000001";
const fila = { ...datos, id, avatar: null, fechaNacimiento: new Date("1990-03-12T00:00:00Z") };

beforeEach(() => {
  vi.resetAllMocks();
  db.transaction.mockImplementation((consulta) => consulta({ paciente: db }));
});

describe("repositorio Prisma de pacientes", () => {
  it("persiste la fecha de nacimiento como fecha sin hora y la devuelve sin corrimiento", async () => {
    db.create.mockResolvedValue(fila);
    expect(await repositorioPacientes.crear(datos)).toMatchObject({ fechaNacimiento: "1990-03-12" });
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ fechaNacimiento: new Date("1990-03-12T00:00:00Z") }),
    }));
  });

  it("pagina de manera estable, limita una página fuera de rango y escapa los comodines del apellido", async () => {
    db.count.mockResolvedValue(21);
    db.findMany.mockResolvedValue([fila]);
    expect(await repositorioPacientes.buscar({ apellido: "%_Ej" }, 4)).toMatchObject({
      pagina: 2, paginas: 2, pacientes: [{ id }],
    });
    const where = { activo: true, apellido: { contains: "\\%\\_Ej", mode: "insensitive" } };
    expect(db.count).toHaveBeenCalledWith({ where });
    expect(db.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where, skip: 20, take: 20, orderBy: [{ apellido: "asc" }, { nombre: "asc" }, { id: "asc" }],
    }));
  });

  it("usa igualdad de DNI y devuelve una página vacía cuando no hay coincidencias", async () => {
    db.count.mockResolvedValue(0);
    db.findMany.mockResolvedValue([]);
    expect(await repositorioPacientes.buscar({ dni: "30123456" }, 2)).toEqual({
      pagina: 1, paginas: 1, pacientes: [],
    });
    expect(db.count).toHaveBeenCalledWith({ where: { activo: true, dni: "30123456" } });
  });

  it("da de baja únicamente un registro activo, sin tocar relaciones", async () => {
    db.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    expect(await repositorioPacientes.darDeBaja(id)).toBe(true);
    expect(await repositorioPacientes.darDeBaja(id)).toBe(false);
    expect(db.updateMany).toHaveBeenCalledWith({ where: { id, activo: true }, data: { activo: false } });
  });

  it("no edita un paciente que ya está inactivo y distingue fallos del motor", async () => {
    db.update.mockRejectedValueOnce({ code: "P2025" }).mockRejectedValueOnce({ code: "P2002" });
    expect(await repositorioPacientes.editar(id, datos)).toBeNull();
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id, activo: true } }));
    await expect(repositorioPacientes.editar(id, datos)).rejects.toEqual({ code: "P2002" });
  });
});
