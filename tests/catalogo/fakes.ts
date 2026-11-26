import type { UsuarioSesion } from "@/server/auth/acceso";
import { crearControlDeAcceso } from "@/server/auth/acceso";
import type { Rol } from "@/generated/prisma/enums";
import type { Prestacion, Profesional, Sillon } from "@/domain/catalogo/tipos";
import type { RepositorioPrestaciones } from "@/server/catalogo/prestaciones";
import type { RepositorioProfesionales } from "@/server/catalogo/profesionales";
import type { RepositorioSillones } from "@/server/catalogo/sillones";

/** Datos ficticios: personal con emails @example.com (DD-17), sin datos reales. */
export function usuario(rol: Rol): UsuarioSesion {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: `${rol.toLowerCase()}@example.com`,
    nombre: `Usuario ${rol}`,
    rol,
    profesionalId: null,
    avatar: null,
  };
}

export function requireRolDe(u: UsuarioSesion | null) {
  return crearControlDeAcceso(async () => u).requireRol;
}

let contador = 0;
export function nuevoId(): string {
  contador += 1;
  return `00000000-0000-4000-8000-${String(contador).padStart(12, "0")}`;
}

function iguales(a: string, b: string) {
  return a.toLocaleUpperCase("es-AR") === b.toLocaleUpperCase("es-AR");
}

export class PrestacionesEnMemoria implements RepositorioPrestaciones {
  constructor(public filas: Prestacion[] = []) {}
  async crear(d: Omit<Prestacion, "id" | "activo">) {
    const fila = { id: nuevoId(), activo: true, ...d };
    this.filas.push(fila);
    return fila;
  }
  async actualizar(id: string, d: Omit<Prestacion, "id" | "activo">) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    Object.assign(fila, d);
    return fila;
  }
  async cambiarActivo(id: string, activo: boolean) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    fila.activo = activo;
    return fila;
  }
}

export class ProfesionalesEnMemoria implements RepositorioProfesionales {
  constructor(public filas: Profesional[] = []) {}
  async buscarPorMatricula(matricula: string) {
    return this.filas.filter((f) => iguales(f.matricula, matricula));
  }
  async crear(d: Omit<Profesional, "id" | "activo">) {
    const fila = { id: nuevoId(), activo: true, ...d };
    this.filas.push(fila);
    return fila;
  }
  async actualizar(id: string, d: Omit<Profesional, "id" | "activo">) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    Object.assign(fila, d);
    return fila;
  }
  async cambiarActivo(id: string, activo: boolean) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    fila.activo = activo;
    return fila;
  }
}

export class SillonesEnMemoria implements RepositorioSillones {
  constructor(public filas: Sillon[] = []) {}
  async buscarPorNombre(nombre: string) {
    return this.filas.filter((f) => iguales(f.nombre, nombre));
  }
  async crear(d: Omit<Sillon, "id" | "activo">) {
    const fila = { id: nuevoId(), activo: true, ...d };
    this.filas.push(fila);
    return fila;
  }
  async actualizar(id: string, d: Omit<Sillon, "id" | "activo">) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    Object.assign(fila, d);
    return fila;
  }
  async cambiarActivo(id: string, activo: boolean) {
    const fila = this.filas.find((f) => f.id === id);
    if (!fila) return null;
    fila.activo = activo;
    return fila;
  }
}
