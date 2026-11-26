"use server";

import { revalidatePath } from "next/cache";
import { requireRol } from "@/server/auth";
import { repositorioPacientes } from "./repositorio";
import { crearAccionesPacientes } from "./servicio";

const acciones = crearAccionesPacientes({
  requireRol,
  repositorio: repositorioPacientes,
  alCambiar: () => revalidatePath("/pacientes"),
});

export async function buscarPacientes(entrada: unknown) {
  return acciones.buscar(entrada);
}

export async function crearPaciente(entrada: unknown) {
  return acciones.crear(entrada);
}

export async function editarPaciente(id: unknown, entrada: unknown) {
  return acciones.editar(id, entrada);
}

export async function darDeBajaPaciente(id: unknown) {
  return acciones.darDeBaja(id);
}
