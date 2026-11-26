/**
 * Datos de demostración para el video y las estadísticas (todo inventado).
 * Lo corre SOLO el líder, después del seed:   npx tsx scripts/datos-demo.ts
 *
 * Agrega 15 pacientes ficticios y turnos de lunes a viernes desde 4 semanas atrás hasta
 * 1 semana adelante, dentro de las franjas de cada profesional, cada uno en su sillón.
 * Respeta las restricciones de la base (sin solapamientos) y deja el historial completo.
 * No se puede correr dos veces: si los pacientes de demo ya existen, no hace nada.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type EstadoTurno } from "../src/generated/prisma/client";
import { aInstante, diaSemanaIso, hoy, sumarDias } from "../src/domain/shared/fechas";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" }),
});

// Generador determinístico: los mismos datos en cada base nueva.
let semilla = 20261126;
function azar(): number {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
}

const PACIENTES = [
  ["Valentina", "Ríos", "1994-02-11", "avatar-05-buzo-crema-y-rosa.webp", "OSDE"],
  ["Tomás", "Herrera", "1988-09-03", "avatar-04-rulos-pelirrojos-anteojos.webp", null],
  ["Lucía", "Paredes", "2001-06-27", "avatar-12-rulos-remera-coral.webp", "Swiss Medical"],
  ["Mateo", "Aguirre", "1979-12-15", "avatar-06-camisa-oliva.webp", "OSEP"],
  ["Sofía", "Bustos", "1997-04-08", "avatar-15-anteojos-remera-terracota.webp", null],
  ["Benjamín", "Correa", "1983-01-21", "avatar-08-rulos-remera-dorada.webp", "Galeno"],
  ["Julieta", "Ponce", "1999-10-30", "avatar-07-ondas-pelirrojas.webp", "OSDE"],
  ["Santiago", "Vera", "1972-07-19", "avatar-04-rulos-pelirrojos-anteojos.webp", null],
  ["Florencia", "Godoy", "1990-03-02", "avatar-13-rodete-remera-rosa.webp", "Medifé"],
  ["Nicolás", "Funes", "1986-08-14", "avatar-06-camisa-oliva.webp", "OSEP"],
  ["Camila", "Arias", "2003-05-25", "avatar-02-flequillo-remera-azul.webp", null],
  ["Joaquina", "Luna", "1995-11-09", "avatar-12-rulos-remera-coral.webp", "Swiss Medical"],
  ["Facundo", "Olmedo", "1981-02-17", "avatar-08-rulos-remera-dorada.webp", null],
  ["Milagros", "Quiroga", "1998-12-04", "avatar-05-buzo-crema-y-rosa.webp", "OSDE"],
  ["Ezequiel", "Domínguez", "1976-06-12", "avatar-04-rulos-pelirrojos-anteojos.webp", "Galeno"],
] as const;

const MOTIVOS = [
  "El paciente avisó que no puede venir",
  "Reprogramado por el paciente",
  "Enfermedad del paciente",
  "Viaje del paciente",
  "El paciente pidió otro día",
];

const SILLON_DE: Record<string, string> = { "MP 4521": "Sillón 1", "MP 5187": "Sillón 2", "MP 6218": "Sillón 3" };

function minutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number) as [number, number];
  return h * 60 + m;
}
function hora(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

async function main() {
  if (await prisma.paciente.findFirst({ where: { dni: "99100206" } })) {
    console.log("Los datos de demo ya están cargados: no se hace nada.");
    return;
  }

  const [recepcion, profesionales, prestaciones, sillones] = await Promise.all([
    prisma.usuario.findMany({ where: { rol: "RECEPCION", estado: "ACTIVO" }, select: { id: true } }),
    prisma.profesional.findMany({
      where: { activo: true },
      select: { id: true, matricula: true, horarios: true, usuario: { select: { id: true } } },
    }),
    prisma.prestacion.findMany({ where: { activo: true }, select: { id: true, nombre: true, duracionMinutos: true } }),
    prisma.sillon.findMany({ select: { id: true, nombre: true } }),
  ]);
  if (recepcion.length === 0 || profesionales.length === 0 || prestaciones.length === 0) {
    throw new Error("Falta el seed: corré primero npx prisma db seed");
  }

  // Pacientes ficticios (DNI de la serie 99, que no se asigna a personas).
  await prisma.paciente.createMany({
    data: PACIENTES.map(([nombre, apellido, nacimiento, avatar, obraSocial], i) => ({
      nombre,
      apellido,
      dni: String(99100206 + i),
      fechaNacimiento: new Date(`${nacimiento}T00:00:00Z`),
      telefono: `26155502${String(i + 6).padStart(2, "0")}`,
      email: `${nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${apellido.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@example.com`,
      obraSocial,
      avatar,
    })),
  });
  const pacientes = await prisma.paciente.findMany({ where: { activo: true }, select: { id: true } });

  const fechaHoy = hoy();
  const ahora = new Date();
  const inicioPeriodo = sumarDias(fechaHoy, -28);
  let creados = 0;

  for (let d = 0; d <= 35; d++) {
    const fecha = sumarDias(inicioPeriodo, d);
    const dia = diaSemanaIso(fecha);
    if (dia > 5) continue;

    for (const prof of profesionales) {
      const sillon = sillones.find((s) => s.nombre === SILLON_DE[prof.matricula]) ?? sillones[0]!;
      const existentes = await prisma.turno.findMany({
        where: { OR: [{ profesionalId: prof.id }, { sillonId: sillon.id }], estado: { not: "CANCELADO" }, inicio: { gte: aInstante(fecha, "00:00"), lt: aInstante(sumarDias(fecha, 1), "00:00") } },
        select: { inicio: true, fin: true },
      });
      const bloqueos = await prisma.bloqueo.findMany({
        where: { profesionalId: prof.id, desde: { lt: aInstante(sumarDias(fecha, 1), "00:00") }, hasta: { gt: aInstante(fecha, "00:00") } },
        select: { desde: true, hasta: true },
      });
      const ocupados = [...existentes.map((t) => ({ inicio: t.inicio, fin: t.fin })), ...bloqueos.map((b) => ({ inicio: b.desde, fin: b.hasta }))];
      const ocupacion = 0.45 + azar() * 0.35; // cada día y profesional, entre 45 % y 80 %

      for (const franja of prof.horarios.filter((h) => h.diaSemana === dia)) {
        let cursor = minutos(franja.horaDesde);
        const finFranja = minutos(franja.horaHasta);
        while (cursor < finFranja) {
          const prestacion = prestaciones[Math.floor(azar() * prestaciones.length)]!;
          const fin = cursor + prestacion.duracionMinutos;
          if (fin > finFranja) break;
          const inicioTurno = aInstante(fecha, hora(cursor));
          const finTurno = aInstante(fecha, hora(fin));
          const choca = ocupados.some((o) => inicioTurno < o.fin && o.inicio < finTurno);
          if (!choca && azar() < ocupacion) {
            const pasado = finTurno < ahora;
            const r = azar();
            const estado: EstadoTurno = pasado
              ? r < 0.72 ? "ATENDIDO" : r < 0.84 ? "AUSENTE" : "CANCELADO"
              : r < 0.45 ? "RESERVADO" : r < 0.9 ? "CONFIRMADO" : "CANCELADO";
            const motivo = estado === "CANCELADO" ? MOTIVOS[Math.floor(azar() * MOTIVOS.length)]! : null;
            const quienCrea = recepcion[Math.floor(azar() * recepcion.length)]!.id;
            const paciente = pacientes[Math.floor(azar() * pacientes.length)]!.id;
            const reservadoEl = new Date(inicioTurno.getTime() - (2 + Math.floor(azar() * 10)) * 86_400_000);

            await prisma.$transaction(async (tx) => {
              const turno = await tx.turno.create({
                data: { pacienteId: paciente, profesionalId: prof.id, prestacionId: prestacion.id, sillonId: sillon.id, inicio: inicioTurno, fin: finTurno, estado, motivoCancelacion: motivo, creadoPorId: quienCrea },
                select: { id: true },
              });
              const historial: { estadoAnterior: EstadoTurno | null; estadoNuevo: EstadoTurno; motivo: string | null; usuarioId: string; fecha: Date }[] = [
                { estadoAnterior: null, estadoNuevo: "RESERVADO", motivo: null, usuarioId: quienCrea, fecha: reservadoEl },
              ];
              const confirmadoEl = new Date(inicioTurno.getTime() - 86_400_000);
              if (estado === "CONFIRMADO" || estado === "ATENDIDO" || estado === "AUSENTE") {
                historial.push({ estadoAnterior: "RESERVADO", estadoNuevo: "CONFIRMADO", motivo: null, usuarioId: quienCrea, fecha: confirmadoEl });
              }
              if (estado === "ATENDIDO" || estado === "AUSENTE") {
                historial.push({ estadoAnterior: "CONFIRMADO", estadoNuevo: estado, motivo: null, usuarioId: prof.usuario?.id ?? quienCrea, fecha: finTurno });
              }
              if (estado === "CANCELADO") {
                historial.push({ estadoAnterior: "RESERVADO", estadoNuevo: "CANCELADO", motivo, usuarioId: quienCrea, fecha: new Date(Math.min(confirmadoEl.getTime(), ahora.getTime())) });
              }
              await tx.historialTurno.createMany({ data: historial.map((h) => ({ ...h, turnoId: turno.id })) });
            });
            if (estado !== "CANCELADO") ocupados.push({ inicio: inicioTurno, fin: finTurno });
            creados++;
            cursor = fin;
          } else {
            cursor += 30;
          }
        }
      }
    }
  }

  // Un bloqueo pasado por profesional (congreso), para que la ocupación lo descuente.
  for (const [i, prof] of profesionales.entries()) {
    const fecha = sumarDias(fechaHoy, -(10 + i * 3));
    if (diaSemanaIso(fecha) > 5) continue;
    const yaHay = await prisma.turno.count({ where: { profesionalId: prof.id, estado: { not: "CANCELADO" }, inicio: { gte: aInstante(fecha, "14:00"), lt: aInstante(fecha, "18:00") } } });
    if (yaHay === 0) await prisma.bloqueo.create({ data: { profesionalId: prof.id, desde: aInstante(fecha, "14:00"), hasta: aInstante(fecha, "18:00"), motivo: "Congreso de odontología" } });
  }

  console.log(`Datos de demo listos: ${PACIENTES.length} pacientes y ${creados} turnos con historial.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
