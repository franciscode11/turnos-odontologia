"use client";

import { useRouter } from "next/navigation";
import { SelectorFecha } from "@/components/ui";

/** Salta a cualquier día de la agenda conservando la vista. */
export function SelectorDia({ fecha, vista }: { fecha: string; vista: "dia" | "lista" }) {
  const router = useRouter();
  return (
    <div className="ag-selector-dia">
      <SelectorFecha
        aria-label="Elegir día"
        valor={fecha}
        alCambiar={(f) => router.push(`/turnos?fecha=${f}${vista === "lista" ? "&vista=lista" : ""}`)}
      />
    </div>
  );
}
