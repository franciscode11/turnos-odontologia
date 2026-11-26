import { seSuperponen, type Intervalo } from "@/domain/shared/intervalos";
import { franjaSuperpuesta, MENSAJES, NOMBRES_DIA } from "./constantes";
import { etiquetaRango, parsearHora } from "./horas";

/** Franja semanal de atención en hora del consultorio (KB 04, HorarioAtencion). */
export type FranjaDominio = {
  id?: string;
  profesionalId: string;
  /** 1 = lunes ... 7 = domingo (ISO). */
  diaSemana: number;
  horaDesde: string;
  horaHasta: string;
};

export type ErroresCampos = Record<string, string[]>;

/**
 * RN-HO-01: día ISO 1-7, horas "HH:mm" válidas y hora desde < hora hasta.
 * Devuelve los errores por campo o null si la franja es válida.
 */
export function validarFranja(franja: FranjaDominio): ErroresCampos | null {
  const errores: ErroresCampos = {};
  if (!Number.isInteger(franja.diaSemana) || franja.diaSemana < 1 || franja.diaSemana > 7) errores.diaSemana = [MENSAJES.diaInvalido];
  const desde = parsearHora(franja.horaDesde);
  const hasta = parsearHora(franja.horaHasta);
  if (desde === null) errores.horaDesde = [MENSAJES.horaInvalida];
  if (hasta === null) errores.horaHasta = [MENSAJES.horaInvalida];
  else if (desde !== null && desde >= hasta) errores.horaHasta = [MENSAJES.franjaInvertida];
  return Object.keys(errores).length > 0 ? errores : null;
}

/** Fecha base fija (lunes 03/01/2000 UTC): solo sirve para comparar horas con `seSuperponen`. */
const BASE = Date.UTC(2000, 0, 3);

function aIntervalo(franja: Pick<FranjaDominio, "horaDesde" | "horaHasta">): Intervalo | null {
  const desde = parsearHora(franja.horaDesde);
  const hasta = parsearHora(franja.horaHasta);
  if (desde === null || hasta === null) return null;
  return { inicio: new Date(BASE + desde * 60_000), fin: new Date(BASE + hasta * 60_000) };
}

/**
 * RN-HO-02: dos franjas se superponen si comparten profesional y día y sus horas se pisan
 * como intervalos semiabiertos [desde, hasta). Usa la única definición del proyecto (`seSuperponen`).
 */
export function franjasSeSuperponen(a: FranjaDominio, b: FranjaDominio): boolean {
  if (a.profesionalId !== b.profesionalId || a.diaSemana !== b.diaSemana) return false;
  const ia = aIntervalo(a);
  const ib = aIntervalo(b);
  return ia !== null && ib !== null && seSuperponen(ia, ib);
}

/**
 * RN-HO-02: compara la franja nueva (o editada) contra las existentes del mismo profesional y día.
 * Al editar, `idEnEdicion` excluye la propia franja. Devuelve el mensaje de error o null.
 */
export function validarFranjaContraExistentes(
  nueva: FranjaDominio,
  existentes: readonly FranjaDominio[],
  idEnEdicion?: string,
): string | null {
  const choque = existentes
    .filter((f) => idEnEdicion === undefined || f.id !== idEnEdicion)
    .filter((f) => franjasSeSuperponen(nueva, f))
    .sort((a, b) => a.horaDesde.localeCompare(b.horaDesde))[0];
  return choque ? franjaSuperpuesta(etiquetaRango(choque.horaDesde, choque.horaHasta)) : null;
}

export type FranjaDelDia<F extends FranjaDominio = FranjaDominio> = F & { etiqueta: string };
export type DiaDeLaSemana<F extends FranjaDominio = FranjaDominio> = {
  diaSemana: number;
  nombre: (typeof NOMBRES_DIA)[number];
  franjas: FranjaDelDia<F>[];
};

/** Horario semanal para mostrar: los 7 días de lunes a domingo con sus franjas ordenadas por hora. */
export function agruparFranjasPorDia<F extends FranjaDominio>(franjas: readonly F[]): DiaDeLaSemana<F>[] {
  return NOMBRES_DIA.map((nombre, i) => ({
    diaSemana: i + 1,
    nombre,
    franjas: franjas
      .filter((f) => f.diaSemana === i + 1)
      .sort((a, b) => a.horaDesde.localeCompare(b.horaDesde))
      .map((f) => ({ ...f, etiqueta: etiquetaRango(f.horaDesde, f.horaHasta) })),
  }));
}
