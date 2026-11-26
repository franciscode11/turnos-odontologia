"use server";

import { revalidatePath } from "next/cache";
import { requireRol } from "@/server/auth";
import type { Prestacion, Profesional, Sillon } from "@/domain/catalogo/tipos";
import type { Resultado } from "@/server/resultado";
import { crearAccionesPrestaciones } from "./prestaciones";
import { crearAccionesProfesionales } from "./profesionales";
import { crearAccionesSillones } from "./sillones";
import { repositorioPrestaciones, repositorioProfesionales, repositorioSillones } from "./repositorios";

/** Server Actions del catálogo: instancian las fábricas con la sesión real y Prisma. */

const prestaciones = crearAccionesPrestaciones({
  requireRol,
  repositorio: repositorioPrestaciones,
  alCambiar: () => revalidatePath("/configuracion/prestaciones"),
});

const profesionales = crearAccionesProfesionales({
  requireRol,
  repositorio: repositorioProfesionales,
  alCambiar: () => revalidatePath("/configuracion/profesionales"),
});

const sillones = crearAccionesSillones({
  requireRol,
  repositorio: repositorioSillones,
  alCambiar: () => revalidatePath("/configuracion/sillones"),
});

export async function crearPrestacion(entrada: unknown): Promise<Resultado<Prestacion>> {
  return prestaciones.crear(entrada);
}
export async function editarPrestacion(id: unknown, entrada: unknown): Promise<Resultado<Prestacion>> {
  return prestaciones.editar(id, entrada);
}
export async function cambiarActivoPrestacion(id: unknown, activo: unknown): Promise<Resultado<Prestacion>> {
  return prestaciones.cambiarActivo(id, activo);
}

export async function crearProfesional(entrada: unknown): Promise<Resultado<Profesional>> {
  return profesionales.crear(entrada);
}
export async function editarProfesional(id: unknown, entrada: unknown): Promise<Resultado<Profesional>> {
  return profesionales.editar(id, entrada);
}
export async function cambiarActivoProfesional(id: unknown, activo: unknown): Promise<Resultado<Profesional>> {
  return profesionales.cambiarActivo(id, activo);
}

export async function crearSillon(entrada: unknown): Promise<Resultado<Sillon>> {
  return sillones.crear(entrada);
}
export async function editarSillon(id: unknown, entrada: unknown): Promise<Resultado<Sillon>> {
  return sillones.editar(id, entrada);
}
export async function cambiarActivoSillon(id: unknown, activo: unknown): Promise<Resultado<Sillon>> {
  return sillones.cambiarActivo(id, activo);
}
