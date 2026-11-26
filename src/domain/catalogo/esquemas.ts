import { z } from "zod";
import { MENSAJE_DURACION, normalizarMatricula, validarDuracion } from "./reglas";

/** Esquemas compartidos por el formulario (cliente) y las acciones del servidor. */

const textoObligatorio = (mensaje: string) => z.string().trim().min(1, mensaje);

const textoOpcional = z
  .string()
  .trim()
  .nullish()
  .transform((valor) => (valor ? valor : null));

export const esquemaProfesional = z.object({
  nombre: textoObligatorio("Ingresá el nombre"),
  apellido: textoObligatorio("Ingresá el apellido"),
  matricula: textoObligatorio("Ingresá la matrícula").transform(normalizarMatricula),
  especialidad: textoOpcional,
});

export const MENSAJE_PRECIO_NEGATIVO = "El precio de referencia no puede ser negativo";
export const MENSAJE_PRECIO_DECIMALES = "El precio de referencia admite hasta 2 decimales";

const tieneHastaDosDecimales = (valor: number) => Math.abs(Math.round(valor * 100) - valor * 100) < 1e-6;

export const esquemaPrestacion = z.object({
  nombre: textoObligatorio("Ingresá el nombre"),
  duracionMinutos: z
    .number({ error: MENSAJE_DURACION })
    .refine((minutos) => validarDuracion(minutos) === null, MENSAJE_DURACION),
  precioReferencia: z
    .number({ error: "Ingresá un precio válido" })
    .min(0, MENSAJE_PRECIO_NEGATIVO)
    .refine(tieneHastaDosDecimales, MENSAJE_PRECIO_DECIMALES)
    .nullable(),
});

export const esquemaSillon = z.object({
  nombre: textoObligatorio("Ingresá el nombre"),
});

export type DatosProfesional = z.output<typeof esquemaProfesional>;
export type DatosPrestacion = z.output<typeof esquemaPrestacion>;
export type DatosSillon = z.output<typeof esquemaSillon>;

export type FormularioProfesional = z.input<typeof esquemaProfesional>;
export type FormularioPrestacion = z.input<typeof esquemaPrestacion>;
export type FormularioSillon = z.input<typeof esquemaSillon>;
