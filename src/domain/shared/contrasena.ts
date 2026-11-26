import { z } from "zod";

export const LARGO_MINIMO_CONTRASENA = 10;

/** Reglas visibles de la contraseña (pantalla de activación). */
export function reglasContrasena(contrasena: string): { largo: boolean; numero: boolean } {
  return { largo: contrasena.length >= LARGO_MINIMO_CONTRASENA, numero: /\d/.test(contrasena) };
}

export const esquemaContrasena = z
  .string()
  .min(LARGO_MINIMO_CONTRASENA, "Al menos 10 caracteres")
  .regex(/\d/, "Un número");

/** Activación de una cuenta invitada: nombre y contraseña nueva. */
export const esquemaActivacion = z.object({
  nombre: z.string().trim().min(1, "Completá tu nombre y apellido").max(120),
  contrasena: esquemaContrasena,
});

/** Inicio de sesión. */
export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresá un email válido")),
  contrasena: z.string().min(1, "Ingresá tu contraseña"),
});
