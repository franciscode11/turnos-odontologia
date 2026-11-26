import type { DatosPaciente } from "./esquemas";

export type Paciente = DatosPaciente & {
  id: string;
  avatar: string | null;
};

export type CriterioPacientes = { dni: string } | { apellido: string } | null;

export type PaginaPacientes = {
  pacientes: Paciente[];
  pagina: number;
  paginas: number;
};
