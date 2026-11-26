// Dobles en memoria del repositorio y de Supabase Auth para testear las acciones de equipo
// sin base ni red (design D2). No es un archivo de test.
import type { EstadoUsuario, Rol } from "@/generated/prisma/enums";
import type { UsuarioEquipo } from "@/domain/equipo/tipos";
import { crearControlDeAcceso, type UsuarioSesion } from "@/server/auth/acceso";
import { crearAccionesEquipo } from "@/server/equipo/fabrica";
import type { NuevaInvitacion, RepositorioEquipo, ResultadoInvitarAuth, ServicioAuthAdmin } from "@/server/equipo/tipos";

export const ID = {
  francisco: "00000000-0000-4000-8000-0000000000a1",
  octavio: "00000000-0000-4000-8000-0000000000a3",
  lautaro: "00000000-0000-4000-8000-0000000000a4",
  ulises: "00000000-0000-4000-8000-0000000000a5",
  ana: "00000000-0000-4000-8000-0000000000a6",
  nuevo: "00000000-0000-4000-8000-0000000000b1",
  profLautaro: "00000000-0000-4000-8000-0000000000e2",
  profEchenagorria: "00000000-0000-4000-8000-0000000000e1",
} as const;

export const AHORA = new Date("2026-11-26T17:00:00Z");

export type FilaUsuario = UsuarioEquipo & { invitadoPorId: string | null; invitadoEn: Date | null };

export function equipoInicial(): FilaUsuario[] {
  const base = { invitadoPorId: null, invitadoEn: null };
  return [
    { ...base, id: ID.francisco, email: "francisco.valles@example.com", rol: "ADMIN", estado: "ACTIVO", profesionalId: null },
    { ...base, id: ID.octavio, email: "octavio.crescini@example.com", rol: "RECEPCION", estado: "ACTIVO", profesionalId: null },
    { ...base, id: ID.lautaro, email: "lautaro.deconinck@example.com", rol: "PROFESIONAL", estado: "ACTIVO", profesionalId: ID.profLautaro },
    {
      id: ID.ulises, email: "ulises.lucato@example.com", rol: "RECEPCION", estado: "INVITADO", profesionalId: null,
      invitadoPorId: ID.francisco, invitadoEn: new Date("2026-11-24T12:00:00Z"),
    },
    { ...base, id: ID.ana, email: "ana.paz@example.com", rol: "RECEPCION", estado: "INACTIVO", profesionalId: null },
  ];
}

export class RepositorioEnMemoria implements RepositorioEquipo {
  profesionales = new Set<string>([ID.profLautaro, ID.profEchenagorria]);
  fallarCreacion = false;
  constructor(public filas: FilaUsuario[] = equipoInicial()) {}

  private copia(f: FilaUsuario): UsuarioEquipo {
    return { id: f.id, email: f.email, rol: f.rol, estado: f.estado, profesionalId: f.profesionalId };
  }
  fila(id: string) {
    return this.filas.find((f) => f.id === id);
  }
  async buscarPorEmail(email: string) {
    const f = this.filas.find((x) => x.email === email);
    return f ? this.copia(f) : null;
  }
  async buscarPorId(id: string) {
    const f = this.fila(id);
    return f ? this.copia(f) : null;
  }
  async contarAdminsActivos() {
    return this.filas.filter((f) => f.rol === "ADMIN" && f.estado === "ACTIVO").length;
  }
  async buscarProfesional(id: string) {
    if (!this.profesionales.has(id)) return null;
    return { id, usuarioId: this.filas.find((f) => f.profesionalId === id)?.id ?? null };
  }
  async crearInvitado(d: NuevaInvitacion) {
    if (this.fallarCreacion) throw new Error("fallo simulado de la base");
    const fila: FilaUsuario = { ...d, estado: "INVITADO" };
    this.filas.push(fila);
    return this.copia(fila);
  }
  async renovarInvitacion(id: string, invitadoPorId: string, invitadoEn: Date) {
    Object.assign(this.fila(id)!, { invitadoPorId, invitadoEn });
  }
  async cambiarRol(id: string, rol: Rol, profesionalId: string | null) {
    const f = this.fila(id)!;
    Object.assign(f, { rol, profesionalId });
    return this.copia(f);
  }
  async cambiarEstado(id: string, estado: EstadoUsuario) {
    const f = this.fila(id)!;
    f.estado = estado;
    return this.copia(f);
  }
  async eliminar(id: string) {
    this.filas = this.filas.filter((f) => f.id !== id);
  }
}

export class AuthEnMemoria implements ServicioAuthAdmin {
  /** Usuarios de Auth: id → { email, confirmado }. */
  usuarios = new Map<string, { email: string; confirmado: boolean }>();
  enviados: { email: string; redirectTo: string }[] = [];
  eliminados: string[] = [];
  fallarEnvio = false;
  siguienteId: string = ID.nuevo;

  constructor(filas: FilaUsuario[] = equipoInicial()) {
    for (const f of filas) this.usuarios.set(f.id, { email: f.email, confirmado: f.estado !== "INVITADO" });
  }

  async invitar(email: string, redirectTo: string): Promise<ResultadoInvitarAuth> {
    if (this.fallarEnvio) return { ok: false, motivo: "error", detalle: "over_email_send_rate_limit" };
    const existente = [...this.usuarios.entries()].find(([, u]) => u.email === email);
    if (existente?.[1].confirmado) return { ok: false, motivo: "ya-registrado" };
    const id = existente?.[0] ?? this.siguienteId;
    this.usuarios.set(id, { email, confirmado: false });
    this.enviados.push({ email, redirectTo });
    return { ok: true, id };
  }

  async eliminar(id: string) {
    this.usuarios.delete(id);
    this.eliminados.push(id);
    return { ok: true };
  }
}

export function sesion(rol: Rol, id: string = ID.francisco): UsuarioSesion {
  return { id, email: `${rol.toLowerCase()}@example.com`, nombre: null, rol, profesionalId: null, avatar: null };
}

export function armar(opciones: { usuario?: UsuarioSesion | null; filas?: FilaUsuario[] } = {}) {
  const filas = opciones.filas ?? equipoInicial();
  const repo = new RepositorioEnMemoria(filas);
  const auth = new AuthEnMemoria(filas);
  const registro = { revalidaciones: 0, errores: [] as string[] };
  const usuario = opciones.usuario === undefined ? sesion("ADMIN") : opciones.usuario;
  const acciones = crearAccionesEquipo({
    requireRol: crearControlDeAcceso(async () => usuario).requireRol,
    repo,
    auth,
    origen: async () => "https://consultorio.example.com",
    revalidar: () => {
      registro.revalidaciones += 1;
    },
    ahora: () => AHORA,
    registrarError: (mensaje) => registro.errores.push(mensaje),
  });
  return { acciones, repo, auth, registro };
}
