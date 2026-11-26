import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases condicionales (usar para layout en los módulos). */
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}
