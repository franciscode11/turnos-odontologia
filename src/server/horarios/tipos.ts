import type { Rol } from "@/generated/prisma/enums";
import type { UsuarioSesion } from "@/server/auth/acceso";
import type { FranjaDominio } from "@/domain/horarios/franjas";
import type { BloqueoDominio } from "@/domain/horarios/bloqueos";
import type { BloqueoOcupacion, TurnoOcupacion } from "@/domain/horarios/disponibilidad";

/** Franja guardada (con id). */
export type FranjaGuardada = FranjaDominio & { id: string };
/** Bloqueo guardado (con id y profesional). */
export type BloqueoGuardado = BloqueoDominio & { id: string; profesionalId: string };

/**
 * Acceso a datos que necesitan las acciones de C-04. La implementación real usa Prisma
 * (repositorio.ts); los tests usan una en memoria, sin base (design §5).
 */
export type RepositorioHorarios = {
  /** Ejecuta `trabajo` en una transacción (reduce la carrera entre dos ADMIN, design §3). */
  enTransaccion<T>(trabajo: (repo: RepositorioHorarios) => Promise<T>): Promise<T>;
  buscarProfesional(id: string): Promise<{ id: string; activo: boolean } | null>;
  franjasDelDia(profesionalId: string, diaSemana: number): Promise<FranjaGuardada[]>;
  buscarFranja(id: string): Promise<FranjaGuardada | null>;
  crearFranja(datos: FranjaDominio): Promise<FranjaGuardada>;
  actualizarFranja(id: string, datos: FranjaDominio): Promise<FranjaGuardada>;
  eliminarFranja(id: string): Promise<void>;
  buscarBloqueo(id: string): Promise<BloqueoGuardado | null>;
  crearBloqueo(datos: BloqueoDominio & { profesionalId: string }): Promise<BloqueoGuardado>;
  actualizarBloqueo(id: string, datos: BloqueoDominio & { profesionalId: string }): Promise<BloqueoGuardado>;
  eliminarBloqueo(id: string): Promise<void>;
  /** Bloqueos del profesional que se superponen con [inicio, fin). */
  bloqueosEnRango(profesionalId: string, inicio: Date, fin: Date): Promise<BloqueoOcupacion[]>;
  /** Turnos del profesional en estados que ocupan agenda que se superponen con [inicio, fin). */
  turnosQueOcupanEnRango(profesionalId: string, inicio: Date, fin: Date): Promise<TurnoOcupacion[]>;
};

export type DependenciasHorarios = {
  /** `requireRol` de src/server/auth: lanza ErrorDeAcceso ("No autenticado" / "Sin permisos"). */
  requireRol: (roles: readonly Rol[]) => Promise<UsuarioSesion>;
  repo: RepositorioHorarios;
  /** `revalidatePath` de next/cache. */
  revalidar: (ruta: string) => void;
};

export type ResultadoDisponibilidad = {
  profesionalId: string;
  fecha: string;
  duracion: number;
  /** Inicios libres ordenados, como instantes UTC. */
  inicios: Date[];
  /** Inicios agrupados por franja ("09:00 - 12:00"). */
  grupos: { etiqueta: string; inicios: Date[] }[];
  /** Texto del estado vacío o null. */
  mensajeVacio: string | null;
};


/**
 * La base rechazó el bloqueo por uno de sus CHECK (`bloqueo_hasta_posterior_a_desde`,
 * `bloqueo_motivo_obligatorio`). La acción lo traduce al mismo mensaje del dominio (design §3).
 */
export class RestriccionDeBloqueo extends Error {
  constructor(readonly campo: "hasta" | "motivo") {
    super(`La base rechazó el bloqueo (${campo})`);
    this.name = "RestriccionDeBloqueo";
  }
}
