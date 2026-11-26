import { z } from "zod";
import { esquemaPaciente, normalizarDni, type DatosPaciente } from "@/domain/pacientes/esquemas";
import type { CriterioPacientes, Paciente, PaginaPacientes } from "@/domain/pacientes/tipos";
import type { crearControlDeAcceso } from "@/server/auth/acceso";
import { PERMISOS } from "@/server/auth/matriz";
import { conAcceso, exito, fallo, type Resultado } from "@/server/resultado";

export type RepositorioPacientes = {
  crear(datos: DatosPaciente): Promise<Paciente>;
  editar(id: string, datos: DatosPaciente): Promise<Paciente | null>;
  darDeBaja(id: string): Promise<boolean>;
  buscar(criterio: CriterioPacientes, pagina: number): Promise<PaginaPacientes>;
};

type Dependencias = {
  requireRol: ReturnType<typeof crearControlDeAcceso>["requireRol"];
  repositorio: RepositorioPacientes;
  alCambiar: () => void;
};

const esquemaId = z.uuid("Identificador inválido");
const esquemaBusqueda = z.object({
  consulta: z.string().trim(),
  pagina: z.int().positive(),
});
const validarPaciente = esquemaPaciente();
const NO_ENCONTRADO = "No se encontró el paciente activo";
const DNI_DUPLICADO = "Ya existe un paciente con ese DNI";

function falloFormulario(error: z.ZodError) {
  const campos: Record<string, string[]> = {};
  for (const [campo, mensajes] of Object.entries(z.flattenError(error).fieldErrors)) {
    if (Array.isArray(mensajes) && mensajes.length) campos[campo] = mensajes;
  }
  return fallo("Revisá los datos del formulario", campos);
}

export function crearAccionesPacientes({ requireRol, repositorio, alCambiar }: Dependencias) {
  async function guardar(escritura: () => Promise<Paciente | null>): Promise<Resultado<Paciente>> {
    let paciente: Paciente | null;
    try {
      paciente = await escritura();
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return fallo(DNI_DUPLICADO, { dni: [DNI_DUPLICADO] });
      }
      throw error;
    }
    if (!paciente) return fallo(NO_ENCONTRADO);
    alCambiar();
    return exito(paciente);
  }

  return {
    crear(entrada: unknown) {
      return conAcceso(async () => {
        await requireRol(PERMISOS["pacientes.editar"]);
        const datos = validarPaciente.safeParse(entrada);
        if (!datos.success) return falloFormulario(datos.error);
        return guardar(() => repositorio.crear(datos.data));
      });
    },
    editar(id: unknown, entrada: unknown) {
      return conAcceso(async () => {
        await requireRol(PERMISOS["pacientes.editar"]);
        const identificador = esquemaId.safeParse(id);
        if (!identificador.success) return fallo("Identificador inválido");
        const datos = validarPaciente.safeParse(entrada);
        if (!datos.success) return falloFormulario(datos.error);
        return guardar(() => repositorio.editar(identificador.data, datos.data));
      });
    },
    darDeBaja(id: unknown) {
      return conAcceso(async () => {
        await requireRol(PERMISOS["pacientes.editar"]);
        const identificador = esquemaId.safeParse(id);
        if (!identificador.success) return fallo("Identificador inválido");
        if (!(await repositorio.darDeBaja(identificador.data))) return fallo(NO_ENCONTRADO);
        alCambiar();
        return exito(undefined);
      });
    },
    buscar(entrada: unknown) {
      return conAcceso(async () => {
        await requireRol(PERMISOS["pacientes.ver"]);
        const busqueda = esquemaBusqueda.safeParse(entrada);
        if (!busqueda.success) return fallo("Revisá los parámetros de búsqueda");
        const { consulta, pagina } = busqueda.data;
        const dni = normalizarDni(consulta);
        const criterio = dni ? { dni } : consulta ? { apellido: consulta } : null;
        return exito(await repositorio.buscar(criterio, pagina));
      });
    },
  };
}
