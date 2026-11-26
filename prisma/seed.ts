/**
 * Seed del MVP (knowledge-base/04 §Seed, DD-17). Lo corre SOLO el líder:
 *   npx prisma db seed
 * Necesita en el .env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_PASSWORD y DIRECT_URL.
 * Pacientes, DNI y teléfonos inventados. El personal usa los nombres del equipo con emails @example.com.
 * Para probar contra un Postgres local sin Supabase: SEED_SIN_SUPABASE=1 (no crea cuentas de Auth).
 * Es idempotente: los usuarios y el catálogo se actualizan; los turnos se crean solo si no hay ninguno
 * (el historial es de solo inserción y no se puede borrar).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient, type EstadoTurno, type Rol } from "../src/generated/prisma/client";
import { aInstante, hoy, sumarDias } from "../src/domain/shared/fechas";

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta ${nombre} en el .env`);
  return valor;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? requerida("DATABASE_URL") }),
});
const SIN_SUPABASE = process.env.SEED_SIN_SUPABASE === "1";
const supabase = SIN_SUPABASE
  ? null
  : createClient(requerida("NEXT_PUBLIC_SUPABASE_URL"), requerida("SUPABASE_SECRET_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
const CONTRASENA = SIN_SUPABASE ? "" : requerida("SEED_PASSWORD");

const PROFESIONALES = [
  { clave: "cortez", nombre: "Joaquín", apellido: "Cortez", matricula: "MP 4521", especialidad: "Odontología general", avatar: "avatar-09-anteojos-chomba-verde.webp" },
  { clave: "deconinck", nombre: "Lautaro", apellido: "de Coninck", matricula: "MP 5187", especialidad: "Endodoncia", avatar: "avatar-14-camisa-azul-petroleo.webp" },
  { clave: "echenagorria", nombre: "Joaquín", apellido: "Echenagorria", matricula: "MP 6218", especialidad: "Ortodoncia", avatar: "avatar-10-remera-celeste.webp" },
] as const;

const USUARIOS: { email: string; nombre: string; rol: Rol; avatar: string; profesional?: (typeof PROFESIONALES)[number]["clave"] }[] = [
  { email: "francisco.valles@example.com", nombre: "Francisco Valles", rol: "ADMIN", avatar: "avatar-01-remera-naranja.webp" },
  { email: "octavio.crescini@example.com", nombre: "Octavio Crescini", rol: "RECEPCION", avatar: "avatar-03-camisa-amarilla.webp" },
  { email: "ulises.lucato@example.com", nombre: "Ulises Lucato", rol: "RECEPCION", avatar: "avatar-11-campera-de-jean.webp" },
  { email: "joaquin.cortez@example.com", nombre: "Joaquín Cortez", rol: "PROFESIONAL", avatar: "avatar-09-anteojos-chomba-verde.webp", profesional: "cortez" },
  { email: "lautaro.deconinck@example.com", nombre: "Lautaro de Coninck", rol: "PROFESIONAL", avatar: "avatar-14-camisa-azul-petroleo.webp", profesional: "deconinck" },
  { email: "joaquin.echenagorria@example.com", nombre: "Joaquín Echenagorria", rol: "PROFESIONAL", avatar: "avatar-10-remera-celeste.webp", profesional: "echenagorria" },
];

const PRESTACIONES = [
  { nombre: "Consulta", duracionMinutos: 30, precioReferencia: "25000" },
  { nombre: "Limpieza", duracionMinutos: 30, precioReferencia: "30000" },
  { nombre: "Extracción", duracionMinutos: 60, precioReferencia: "60000" },
] as const;

const SILLONES = ["Sillón 1", "Sillón 2", "Sillón 3"] as const;

// Franjas de lunes (1) a viernes (5), en hora del consultorio.
const FRANJAS: Record<(typeof PROFESIONALES)[number]["clave"], [string, string][]> = {
  cortez: [["08:00", "13:00"], ["14:00", "18:00"]],
  deconinck: [["09:00", "13:00"], ["15:00", "19:00"]],
  echenagorria: [["08:00", "12:30"], ["14:00", "17:00"]],
};

// Pacientes inventados (DNI de la serie 99, que no se asigna a personas).
const PACIENTES = [
  { nombre: "Martina", apellido: "Sosa", dni: "99100201", fechaNacimiento: "1991-03-14", telefono: "2615550101", obraSocial: "OSEP", avatar: "avatar-02-flequillo-remera-azul.webp" },
  { nombre: "Ramiro", apellido: "Ojeda", dni: "99100202", fechaNacimiento: "1984-07-02", telefono: "2615550102", obraSocial: null, avatar: "avatar-06-camisa-oliva.webp" },
  { nombre: "Agustina", apellido: "Molina", dni: "99100203", fechaNacimiento: "1999-11-23", telefono: "2615550103", obraSocial: "OSDE", avatar: "avatar-07-ondas-pelirrojas.webp" },
  { nombre: "Ignacio", apellido: "Zabala", dni: "99100204", fechaNacimiento: "1976-01-30", telefono: "2615550104", obraSocial: null, avatar: "avatar-08-rulos-remera-dorada.webp" },
  { nombre: "Camila", apellido: "Ledesma", dni: "99100205", fechaNacimiento: "2002-05-09", telefono: "2615550105", obraSocial: "Swiss Medical", avatar: "avatar-13-rodete-remera-rosa.webp" },
] as const;

async function idDeAuth(email: string): Promise<string> {
  if (!supabase) {
    const existente = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
    return existente?.id ?? crypto.randomUUID();
  }
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const existente = data.users.find((u) => u.email?.toLowerCase() === email);
  if (existente) {
    const { error: e } = await supabase.auth.admin.updateUserById(existente.id, { password: CONTRASENA, email_confirm: true });
    if (e) throw e;
    return existente.id;
  }
  const { data: creado, error: e } = await supabase.auth.admin.createUser({ email, password: CONTRASENA, email_confirm: true });
  if (e || !creado.user) throw e ?? new Error(`No se pudo crear ${email}`);
  return creado.user.id;
}

async function main() {
  // Catálogo
  const profesionales = new Map<string, string>();
  for (const p of PROFESIONALES) {
    const { clave, ...datos } = p;
    const fila = await prisma.profesional.upsert({ where: { matricula: p.matricula }, update: datos, create: datos });
    profesionales.set(clave, fila.id);
    await prisma.horarioAtencion.deleteMany({ where: { profesionalId: fila.id } });
    await prisma.horarioAtencion.createMany({
      data: [1, 2, 3, 4, 5].flatMap((dia) => FRANJAS[clave].map(([horaDesde, horaHasta]) => ({ profesionalId: fila.id, diaSemana: dia, horaDesde, horaHasta }))),
    });
  }
  const prestaciones = new Map<string, string>();
  for (const pr of PRESTACIONES) {
    const existente = await prisma.prestacion.findFirst({ where: { nombre: pr.nombre } });
    const fila = existente
      ? await prisma.prestacion.update({ where: { id: existente.id }, data: pr })
      : await prisma.prestacion.create({ data: pr });
    prestaciones.set(pr.nombre, fila.id);
  }
  const sillones = new Map<string, string>();
  for (const nombre of SILLONES) {
    const fila = await prisma.sillon.upsert({ where: { nombre }, update: {}, create: { nombre } });
    sillones.set(nombre, fila.id);
  }

  // Usuarios del equipo (Supabase Auth + tabla usuario)
  const usuarios = new Map<string, string>();
  for (const u of USUARIOS) {
    const id = await idDeAuth(u.email);
    const profesionalId = u.profesional ? profesionales.get(u.profesional) ?? null : null;
    await prisma.usuario.upsert({
      where: { id },
      update: { email: u.email, nombre: u.nombre, rol: u.rol, estado: "ACTIVO", avatar: u.avatar, profesionalId },
      create: { id, email: u.email, nombre: u.nombre, rol: u.rol, estado: "ACTIVO", avatar: u.avatar, profesionalId },
    });
    usuarios.set(u.email, id);
  }
  const admin = usuarios.get("francisco.valles@example.com")!;
  const recepcion = usuarios.get("octavio.crescini@example.com")!;
  for (const u of USUARIOS) {
    if (u.rol !== "ADMIN") await prisma.usuario.update({ where: { id: usuarios.get(u.email)! }, data: { invitadoPorId: admin, invitadoEn: new Date() } });
  }

  // Pacientes
  const pacientes = new Map<string, string>();
  for (const p of PACIENTES) {
    const datos = { ...p, fechaNacimiento: new Date(`${p.fechaNacimiento}T00:00:00Z`) };
    const existente = await prisma.paciente.findFirst({ where: { dni: p.dni, activo: true } });
    const fila = existente ? await prisma.paciente.update({ where: { id: existente.id }, data: datos }) : await prisma.paciente.create({ data: datos });
    pacientes.set(p.apellido, fila.id);
  }

  // Turnos de ejemplo (solo si no hay ninguno): hoy y mañana, en estados distintos, con historial.
  if ((await prisma.turno.count()) > 0) {
    console.log("Ya hay turnos: no se crean turnos de ejemplo.");
    return;
  }
  const dia = hoy();
  const manana = sumarDias(dia, 1);
  const usuarioDe = (clave: string) => usuarios.get(USUARIOS.find((u) => u.profesional === clave)!.email)!;
  type Ejemplo = { fecha: string; hora: string; prof: (typeof PROFESIONALES)[number]["clave"]; paciente: string; prestacion: (typeof PRESTACIONES)[number]["nombre"]; sillon: (typeof SILLONES)[number]; estado: EstadoTurno; motivo?: string };
  const ejemplos: Ejemplo[] = [
    { fecha: dia, hora: "08:30", prof: "cortez", paciente: "Sosa", prestacion: "Consulta", sillon: "Sillón 1", estado: "ATENDIDO" },
    { fecha: dia, hora: "09:30", prof: "cortez", paciente: "Ojeda", prestacion: "Extracción", sillon: "Sillón 1", estado: "CONFIRMADO" },
    { fecha: dia, hora: "11:00", prof: "cortez", paciente: "Ledesma", prestacion: "Limpieza", sillon: "Sillón 1", estado: "RESERVADO" },
    { fecha: dia, hora: "09:00", prof: "deconinck", paciente: "Zabala", prestacion: "Consulta", sillon: "Sillón 2", estado: "AUSENTE" },
    { fecha: dia, hora: "10:00", prof: "deconinck", paciente: "Molina", prestacion: "Limpieza", sillon: "Sillón 2", estado: "CONFIRMADO" },
    { fecha: dia, hora: "11:00", prof: "deconinck", paciente: "Sosa", prestacion: "Consulta", sillon: "Sillón 2", estado: "CANCELADO", motivo: "La paciente avisó que no puede venir" },
    { fecha: dia, hora: "08:30", prof: "echenagorria", paciente: "Molina", prestacion: "Consulta", sillon: "Sillón 3", estado: "ATENDIDO" },
    { fecha: dia, hora: "10:00", prof: "echenagorria", paciente: "Ojeda", prestacion: "Extracción", sillon: "Sillón 3", estado: "RESERVADO" },
    { fecha: manana, hora: "09:00", prof: "cortez", paciente: "Zabala", prestacion: "Limpieza", sillon: "Sillón 1", estado: "RESERVADO" },
    { fecha: manana, hora: "10:30", prof: "echenagorria", paciente: "Ledesma", prestacion: "Consulta", sillon: "Sillón 3", estado: "CONFIRMADO" },
  ];
  for (const e of ejemplos) {
    const duracion = PRESTACIONES.find((p) => p.nombre === e.prestacion)!.duracionMinutos;
    const inicio = aInstante(e.fecha, e.hora);
    const fin = new Date(inicio.getTime() + duracion * 60_000);
    const quienCierra = e.estado === "ATENDIDO" || e.estado === "AUSENTE" ? usuarioDe(e.prof) : recepcion;
    await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.create({
        data: {
          pacienteId: pacientes.get(e.paciente)!,
          profesionalId: profesionales.get(e.prof)!,
          prestacionId: prestaciones.get(e.prestacion)!,
          sillonId: sillones.get(e.sillon)!,
          inicio,
          fin,
          estado: e.estado,
          motivoCancelacion: e.motivo ?? null,
          creadoPorId: recepcion,
        },
      });
      await tx.historialTurno.create({ data: { turnoId: turno.id, estadoAnterior: null, estadoNuevo: "RESERVADO", usuarioId: recepcion } });
      if (e.estado !== "RESERVADO") {
        await tx.historialTurno.create({ data: { turnoId: turno.id, estadoAnterior: "RESERVADO", estadoNuevo: e.estado, motivo: e.motivo ?? null, usuarioId: quienCierra } });
      }
    });
  }
  await prisma.bloqueo.create({
    data: { profesionalId: profesionales.get("deconinck")!, desde: aInstante(dia, "12:00"), hasta: aInstante(dia, "13:00"), motivo: "Capacitación" },
  });
  console.log(`Seed listo: ${USUARIOS.length} usuarios, ${PACIENTES.length} pacientes, ${ejemplos.length} turnos.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
