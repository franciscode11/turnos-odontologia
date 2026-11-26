import { z } from "zod";
import { esFechaValida, hoy } from "@/domain/shared/fechas";

export function normalizarDni(entrada: string): string | null {
  const dni = entrada.trim();
  if (!/^(?:\d{7,8}|\d{1,2}\.\d{3}\.\d{3})$/.test(dni)) return null;
  return dni.replaceAll(".", "");
}

const obligatorio = (mensaje: string) => z.string({ error: mensaje }).trim().min(1, mensaje);
const opcional = z
  .string()
  .trim()
  .nullish()
  .transform((valor) => valor || null);

export function esquemaPaciente(ahora: () => Date = () => new Date()) {
  return z.object({
    nombre: obligatorio("Ingresá el nombre"),
    apellido: obligatorio("Ingresá el apellido"),
    dni: z
      .string({ error: "Ingresá el DNI" })
      .transform(normalizarDni)
      .pipe(z.string({ error: "Ingresá un DNI de 7 u 8 dígitos" })),
    fechaNacimiento: z
      .string({ error: "Ingresá la fecha de nacimiento" })
      .trim()
      .refine(esFechaValida, { error: "Ingresá una fecha válida (AAAA-MM-DD)", abort: true })
      .refine((fecha) => fecha <= hoy(ahora()), "La fecha de nacimiento no puede ser futura"),
    telefono: obligatorio("Ingresá el teléfono"),
    email: opcional.pipe(z.email("Ingresá un email válido").nullable()),
    obraSocial: opcional,
    numeroAfiliado: opcional,
  });
}

export type FormularioPaciente = z.input<ReturnType<typeof esquemaPaciente>>;
export type DatosPaciente = z.output<ReturnType<typeof esquemaPaciente>>;
