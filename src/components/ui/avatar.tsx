"use client";

import { useState } from "react";
import { cn } from "./cn";
import { Icono } from "./icono";

/** Los 15 avatares 3D de public/avatars (design system Revision 3). */
export const AVATARES = [
  "avatar-01-remera-naranja.webp", "avatar-02-flequillo-remera-azul.webp", "avatar-03-camisa-amarilla.webp",
  "avatar-04-rulos-pelirrojos-anteojos.webp", "avatar-05-buzo-crema-y-rosa.webp", "avatar-06-camisa-oliva.webp",
  "avatar-07-ondas-pelirrojas.webp", "avatar-08-rulos-remera-dorada.webp", "avatar-09-anteojos-chomba-verde.webp",
  "avatar-10-remera-celeste.webp", "avatar-11-campera-de-jean.webp", "avatar-12-rulos-remera-coral.webp",
  "avatar-13-rodete-remera-rosa.webp", "avatar-14-camisa-azul-petroleo.webp", "avatar-15-anteojos-remera-terracota.webp",
] as const;

type Props = {
  /** Nombre de archivo guardado en el campo `avatar` (por ejemplo "avatar-06-camisa-oliva.webp"). */
  avatar?: string | null;
  tamano?: "md" | "lg";
  /** Ícono si no hay foto: "user" (persona) o "mail" (invitación pendiente). */
  iconoSinFoto?: "user" | "mail";
  className?: string;
};

/** Foto de perfil. Nunca iniciales: sin avatar (o si la imagen falla) muestra un ícono. */
export function Avatar({ avatar, tamano = "md", iconoSinFoto = "user", className }: Props) {
  const [fallo, setFallo] = useState(false);
  const valido = avatar && (AVATARES as readonly string[]).includes(avatar) && !fallo;
  return (
    <span className={cn("avatar", tamano === "lg" && "lg", !valido && "pending", className)} aria-hidden="true">
      {valido ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatares estáticos y livianos (WebP 256 px)
        <img src={`/avatars/${avatar}`} alt="" width={36} height={36} onError={() => setFallo(true)} />
      ) : (
        <Icono nombre={iconoSinFoto} />
      )}
    </span>
  );
}
