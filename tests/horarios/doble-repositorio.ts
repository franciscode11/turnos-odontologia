// Doble en memoria del repositorio de C-04 para testear las acciones sin base de datos (design §5).
// No es un archivo de test (no termina en .test.ts).
import type { Rol } from "@/generated/prisma/enums";
import { crearControlDeAcceso, type UsuarioSesion } from "@/server/auth/acceso";
import { ocupaAgenda, type EstadoTurno } from "@/domain/shared/estados";
import { seSuperponen } from "@/domain/shared/intervalos";
import { crearAccionesHorarios } from "@/server/horarios/acciones";
import type { BloqueoGuardado, FranjaGuardada, RepositorioHorarios } from "@/server/horarios/tipos";

export const PROF = {
  lautaro: "prof-lautaro-de-coninck",
  cortez: "prof-joaquin-cortez",
  echenagorria: "prof-joaquin-echenagorria",
  inactivo: "prof-inactivo-ficticio",
} as const;

export type TurnoEnMemoria = { id: string; profesionalId: string; paciente: string; inicio: Date; fin: Date; estado: EstadoTurno };

export function crearRepositorioEnMemoria(inicial: { franjas?: FranjaGuardada[]; bloqueos?: BloqueoGuardado[]; turnos?: TurnoEnMemoria[] } = {}) {
  const profesionales = new Map<string, boolean>([
    [PROF.lautaro, true],
    [PROF.cortez, true],
    [PROF.echenagorria, true],
    [PROF.inactivo, false],
  ]);
  const franjas = new Map((inicial.franjas ?? []).map((f) => [f.id, { ...f }]));
  const bloqueos = new Map((inicial.bloqueos ?? []).map((b) => [b.id, { ...b }]));
  const turnos = (inicial.turnos ?? []).map((t) => ({ ...t }));
  const registro = { lecturas: 0, escrituras: 0, transacciones: 0 };
  let siguiente = 1;
  const nuevoId = (prefijo: string) => `${prefijo}-${siguiente++}`;

  const repo: RepositorioHorarios = {
    async enTransaccion(trabajo) {
      registro.transacciones++;
      return trabajo(repo);
    },
    async buscarProfesional(id) {
      registro.lecturas++;
      return profesionales.has(id) ? { id, activo: profesionales.get(id) as boolean } : null;
    },
    async franjasDelDia(profesionalId, diaSemana) {
      registro.lecturas++;
      return [...franjas.values()].filter((f) => f.profesionalId === profesionalId && f.diaSemana === diaSemana).map((f) => ({ ...f }));
    },
    async buscarFranja(id) {
      registro.lecturas++;
      const f = franjas.get(id);
      return f ? { ...f } : null;
    },
    async crearFranja(datos) {
      registro.escrituras++;
      const f = { ...datos, id: nuevoId("franja") };
      franjas.set(f.id, f);
      return { ...f };
    },
    async actualizarFranja(id, datos) {
      registro.escrituras++;
      const f = { ...datos, id };
      franjas.set(id, f);
      return { ...f };
    },
    async eliminarFranja(id) {
      registro.escrituras++;
      franjas.delete(id);
    },
    async buscarBloqueo(id) {
      registro.lecturas++;
      const b = bloqueos.get(id);
      return b ? { ...b } : null;
    },
    async crearBloqueo(datos) {
      registro.escrituras++;
      const b = { ...datos, id: nuevoId("bloqueo") };
      bloqueos.set(b.id, b);
      return { ...b };
    },
    async actualizarBloqueo(id, datos) {
      registro.escrituras++;
      const b = { ...datos, id };
      bloqueos.set(id, b);
      return { ...b };
    },
    async eliminarBloqueo(id) {
      registro.escrituras++;
      bloqueos.delete(id);
    },
    async bloqueosEnRango(profesionalId, inicio, fin) {
      registro.lecturas++;
      return [...bloqueos.values()]
        .filter((b) => b.profesionalId === profesionalId && seSuperponen({ inicio: b.desde, fin: b.hasta }, { inicio, fin }))
        .map((b) => ({ desde: b.desde, hasta: b.hasta }));
    },
    async turnosQueOcupanEnRango(profesionalId, inicio, fin) {
      registro.lecturas++;
      // Igual que el filtro de Prisma: estado in ESTADOS_QUE_OCUPAN_AGENDA.
      return turnos
        .filter((t) => t.profesionalId === profesionalId && ocupaAgenda(t.estado) && seSuperponen(t, { inicio, fin }))
        .map((t) => ({ inicio: t.inicio, fin: t.fin, estado: t.estado }));
    },
  };

  return { repo, franjas, bloqueos, turnos, registro, profesionales };
}

const USUARIOS: Record<string, UsuarioSesion> = {
  "francisco.valles@example.com": { id: "u-admin", email: "francisco.valles@example.com", nombre: "Francisco Valles", rol: "ADMIN", profesionalId: null, avatar: null },
  "octavio.crescini@example.com": { id: "u-recep-1", email: "octavio.crescini@example.com", nombre: "Octavio Crescini", rol: "RECEPCION", profesionalId: null, avatar: null },
  "ulises.lucato@example.com": { id: "u-recep-2", email: "ulises.lucato@example.com", nombre: "Ulises Lucato", rol: "RECEPCION", profesionalId: null, avatar: null },
  "joaquin.cortez@example.com": { id: "u-prof-1", email: "joaquin.cortez@example.com", nombre: "Joaquín Cortez", rol: "PROFESIONAL", profesionalId: PROF.cortez, avatar: null },
  "joaquin.echenagorria@example.com": { id: "u-prof-2", email: "joaquin.echenagorria@example.com", nombre: "Joaquín Echenagorria", rol: "PROFESIONAL", profesionalId: PROF.echenagorria, avatar: null },
  "lautaro.deconinck@example.com": { id: "u-prof-3", email: "lautaro.deconinck@example.com", nombre: "Lautaro de Coninck", rol: "PROFESIONAL", profesionalId: PROF.lautaro, avatar: null },
};

/** Acciones con un usuario de prueba (o sin sesión con `null`) y el repositorio en memoria. */
export function accionesComo(email: keyof typeof USUARIOS | null, memoria: ReturnType<typeof crearRepositorioEnMemoria>) {
  const usuario = email ? (USUARIOS[email] ?? null) : null;
  const { requireRol } = crearControlDeAcceso(async () => usuario);
  const revalidadas: string[] = [];
  const acciones = crearAccionesHorarios({
    requireRol: (roles: readonly Rol[]) => requireRol(roles),
    repo: memoria.repo,
    revalidar: (ruta) => revalidadas.push(ruta),
  });
  return { acciones, revalidadas, usuario };
}
