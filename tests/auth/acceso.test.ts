import { describe, expect, it } from "vitest";
import { crearControlDeAcceso, ErrorDeAcceso, type UsuarioSesion } from "@/server/auth/acceso";
import { conAcceso, exito } from "@/server/resultado";

const recepcion: UsuarioSesion = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "octavio.crescini@example.com",
  nombre: "Octavio Crescini",
  rol: "RECEPCION",
  profesionalId: null,
  avatar: "avatar-03-camisa-amarilla.webp",
};

const control = (usuario: UsuarioSesion | null) => crearControlDeAcceso(async () => usuario);

describe("requireRol (RN-AU-03, RN-AU-05)", () => {
  it("RN-AU-03 feliz: un RECEPCION activo pasa en una acción de ADMIN y RECEPCION", async () => {
    await expect(control(recepcion).requireRol(["ADMIN", "RECEPCION"])).resolves.toEqual(recepcion);
  });

  it("RN-AU-03 error de negocio: un RECEPCION en una acción solo de ADMIN recibe 'Sin permisos'", async () => {
    await expect(control(recepcion).requireRol(["ADMIN"])).rejects.toThrow("Sin permisos");
  });

  it("RN-AU-04 borde: sin sesión recibe 'No autenticado' antes de evaluar el rol", async () => {
    const promesa = control(null).requireRol(["ADMIN"]);
    await expect(promesa).rejects.toBeInstanceOf(ErrorDeAcceso);
    await expect(control(null).requireRol(["ADMIN"])).rejects.toThrow("No autenticado");
  });

  it("RN-AU-05: un usuario inactivo llega como sin sesión y no opera", async () => {
    // obtenerUsuarioActual devuelve null para INVITADO/INACTIVO.
    await expect(control(null).requireSesion()).rejects.toThrow("No autenticado");
  });

  it("requirePermiso usa la matriz", async () => {
    await expect(control(recepcion).requirePermiso("turnos.crear")).resolves.toEqual(recepcion);
    await expect(control(recepcion).requirePermiso("equipo.gestionar")).rejects.toThrow("Sin permisos");
  });

  it("conAcceso convierte el error de acceso en un resultado fallido", async () => {
    const resultado = await conAcceso(async () => {
      await control(recepcion).requireRol(["ADMIN"]);
      return exito("no debería llegar");
    });
    expect(resultado).toEqual({ ok: false, error: "Sin permisos" });
  });
});
