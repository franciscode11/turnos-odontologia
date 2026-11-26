/**
 * Fechas del consultorio (RN-GL-03): se guardan como instantes UTC y se muestran
 * e interpretan en hora de Argentina, sin importar la zona del servidor o del navegador.
 * Formatos locales: fecha "AAAA-MM-DD", hora "HH:mm" (24 h).
 */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const RE_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

const partesFormato = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partesLocales(instante: Date) {
  const p: Record<string, string> = {};
  for (const { type, value } of partesFormato.formatToParts(instante)) p[type] = value;
  return {
    anio: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    hora: Number(p.hour),
    minuto: Number(p.minute),
  };
}

/** Diferencia en minutos entre la hora local de Argentina y UTC para ese instante. */
function desfasajeMinutos(instante: Date): number {
  const l = partesLocales(instante);
  const comoUtc = Date.UTC(l.anio, l.mes - 1, l.dia, l.hora, l.minuto);
  const instanteSinSegundos = Math.floor(instante.getTime() / 60_000) * 60_000;
  return (comoUtc - instanteSinSegundos) / 60_000;
}

export function esFechaValida(fecha: string): boolean {
  const m = RE_FECHA.exec(fecha);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

export function esHoraValida(hora: string): boolean {
  return RE_HORA.test(hora);
}

/** Convierte una fecha y hora de Argentina en el instante UTC correspondiente. */
export function aInstante(fecha: string, hora: string): Date {
  if (!esFechaValida(fecha)) throw new RangeError(`Fecha inválida: ${fecha}`);
  const mh = RE_HORA.exec(hora);
  if (!mh) throw new RangeError(`Hora inválida: ${hora}`);
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  const comoUtc = Date.UTC(anio, mes - 1, dia, Number(mh[1]), Number(mh[2]));
  // Dos pasadas por si el desfasaje cambiara entre la suposición y el resultado.
  let instante = comoUtc - desfasajeMinutos(new Date(comoUtc)) * 60_000;
  instante = comoUtc - desfasajeMinutos(new Date(instante)) * 60_000;
  return new Date(instante);
}

/** Fecha local "AAAA-MM-DD" en Argentina de un instante. */
export function fechaLocal(instante: Date): string {
  const l = partesLocales(instante);
  return `${l.anio}-${String(l.mes).padStart(2, "0")}-${String(l.dia).padStart(2, "0")}`;
}

/** Hora local "HH:mm" en Argentina de un instante. */
export function horaLocal(instante: Date): string {
  const l = partesLocales(instante);
  return `${String(l.hora).padStart(2, "0")}:${String(l.minuto).padStart(2, "0")}`;
}

/** "25/11/2026" */
export function formatearFecha(instante: Date): string {
  return formatoFecha.format(instante);
}

/** "09:00" */
export function formatearHora(instante: Date): string {
  return formatoHora.format(instante);
}

/** Suma (o resta) días a una fecha local "AAAA-MM-DD". */
export function sumarDias(fecha: string, dias: number): string {
  if (!esFechaValida(fecha)) throw new RangeError(`Fecha inválida: ${fecha}`);
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  const d = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return d.toISOString().slice(0, 10);
}

/** Intervalo [00:00, 00:00 del día siguiente) de un día del consultorio, en UTC. */
export function rangoDelDia(fecha: string): { inicio: Date; fin: Date } {
  return { inicio: aInstante(fecha, "00:00"), fin: aInstante(sumarDias(fecha, 1), "00:00") };
}

/** Fecha local de hoy en Argentina. `ahora` se inyecta para poder fijarla en tests. */
export function hoy(ahora: Date = new Date()): string {
  return fechaLocal(ahora);
}

/** Día de la semana ISO (1 = lunes ... 7 = domingo) de una fecha local "AAAA-MM-DD". */
export function diaSemanaIso(fecha: string): number {
  if (!esFechaValida(fecha)) throw new RangeError(`Fecha inválida: ${fecha}`);
  const [anio, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  const d = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return d === 0 ? 7 : d;
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"] as const;

/** "Miércoles 25 de noviembre" para una fecha local "AAAA-MM-DD". */
export function formatearFechaLarga(fecha: string): string {
  const [, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  return `${DIAS[diaSemanaIso(fecha) - 1]} ${dia} de ${MESES[mes - 1]}`;
}

/** Minutos desde las 00:00 de una hora "HH:mm". */
export function minutosDelDia(hora: string): number {
  if (!esHoraValida(hora)) throw new RangeError(`Hora inválida: ${hora}`);
  const [h, m] = hora.split(":").map(Number) as [number, number];
  return h * 60 + m;
}
