import { z } from "zod";
import { esFechaValida } from "@/domain/shared/fechas";
import { DURACION_MAXIMA, DURACION_MINIMA, MENSAJES } from "./constantes";
import { instanteDeFechaHoraLocal } from "./bloqueos";
import { parsearHora } from "./horas";

/**
 * Esquemas Zod compartidos por los formularios (cliente) y las Server Actions (servidor),
 * con los mensajes del dominio para que ambos muestren el mismo texto.
 */
const id = z.string().trim().min(1, MENSAJES.profesionalObligatorio);
const hora = z.string().refine((h) => parsearHora(h) !== null, MENSAJES.horaInvalida);
const fechaHora = z.string().refine((v) => instanteDeFechaHoraLocal(v) !== null, MENSAJES.fechaHoraInvalida);

/** RN-HO-01 */
export const esquemaFranja = z
  .object({
    profesionalId: id,
    diaSemana: z.number(MENSAJES.diaInvalido).int(MENSAJES.diaInvalido).min(1, MENSAJES.diaInvalido).max(7, MENSAJES.diaInvalido),
    horaDesde: hora,
    horaHasta: hora,
  })
  .refine(
    (f) => {
      const desde = parsearHora(f.horaDesde);
      const hasta = parsearHora(f.horaHasta);
      return desde === null || hasta === null || desde < hasta;
    },
    { message: MENSAJES.franjaInvertida, path: ["horaHasta"] },
  );
export type DatosFranja = z.infer<typeof esquemaFranja>;

/** RN-HO-03. `desde` y `hasta` son "AAAA-MM-DDTHH:mm" en hora de Argentina (selector fecha-hora). */
export const esquemaBloqueo = z
  .object({
    profesionalId: id,
    desde: fechaHora,
    hasta: fechaHora,
    motivo: z.string().trim().min(1, MENSAJES.motivoObligatorio),
  })
  .refine(
    (b) => {
      const desde = instanteDeFechaHoraLocal(b.desde);
      const hasta = instanteDeFechaHoraLocal(b.hasta);
      return desde === null || hasta === null || desde.getTime() < hasta.getTime();
    },
    { message: MENSAJES.bloqueoInvertido, path: ["hasta"] },
  );
export type DatosBloqueo = z.infer<typeof esquemaBloqueo>;

/** RN-CA-02 (duración) y RN-GL-03 (fecha del consultorio "AAAA-MM-DD"). */
export const esquemaConsultaDisponibilidad = z.object({
  profesionalId: id,
  fecha: z.string().refine(esFechaValida, MENSAJES.fechaInvalida),
  duracion: z
    .number(MENSAJES.duracionInvalida)
    .refine((d) => Number.isInteger(d) && d % 5 === 0 && d >= DURACION_MINIMA && d <= DURACION_MAXIMA, MENSAJES.duracionInvalida),
});
export type DatosConsultaDisponibilidad = z.infer<typeof esquemaConsultaDisponibilidad>;

export const esquemaId = z.object({ id: z.string().min(1) });

/** Errores por campo de Zod en el formato de `Resultado.campos`. */
export function erroresDeCampo(error: z.ZodError): Record<string, string[]> {
  const { fieldErrors } = z.flattenError(error);
  const campos: Record<string, string[]> = {};
  for (const [campo, mensajes] of Object.entries(fieldErrors)) if (Array.isArray(mensajes) && mensajes.length > 0) campos[campo] = mensajes;
  return campos;
}
