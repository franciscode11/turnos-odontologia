"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ControlSegmentado, Selector, SelectorFecha, type Opcion } from "@/components/ui";
import { DIAS_MAXIMOS_RANGO, type Periodo, type TipoPeriodo } from "@/domain/estadisticas/periodos";
import { sumarDias } from "@/domain/shared/fechas";
import { TODOS, enlaceEstadisticas } from "./enlaces";

const OPCIONES_PERIODO = [
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
  { valor: "rango", etiqueta: "Rango" },
] as const satisfies ReadonlyArray<{ valor: TipoPeriodo; etiqueta: string }>;

type Props = { periodo: Periodo; profesionalId: string | null; profesionales: Opcion[] };

/** Período (semana, mes o rango) y profesional por searchParams; el servidor valida todo (inválido → mes actual). */
export function FiltrosEstadisticas({ periodo, profesionalId, profesionales }: Props) {
  const router = useRouter();
  const [cargando, iniciar] = useTransition();
  const ir = (p: Periodo, profesional: string | null = profesionalId) => iniciar(() => router.push(enlaceEstadisticas(p, profesional), { scroll: false }));

  const cambiarTipo = (tipo: TipoPeriodo) => {
    if (tipo === periodo.tipo) return;
    // Rango arranca con el período que se está viendo; semana y mes, con la fecha de inicio actual.
    ir({ tipo, desde: periodo.desde, hasta: tipo === "rango" ? periodo.hasta : periodo.desde });
  };

  // Un rango invertido o más largo que el máximo se ajusta antes de navegar.
  const cambiarDesde = (desde: string) => {
    const hasta = periodo.hasta < desde || periodo.hasta > sumarDias(desde, DIAS_MAXIMOS_RANGO - 1) ? desde : periodo.hasta;
    ir({ tipo: "rango", desde, hasta });
  };
  const cambiarHasta = (hasta: string) => {
    const desde = periodo.desde > hasta || periodo.desde < sumarDias(hasta, 1 - DIAS_MAXIMOS_RANGO) ? hasta : periodo.desde;
    ir({ tipo: "rango", desde, hasta });
  };

  return (
    <div className="row" style={{ flexWrap: "wrap", gap: 8 }} aria-busy={cargando || undefined}>
      <ControlSegmentado etiqueta="Período" opciones={OPCIONES_PERIODO} valor={periodo.tipo} alCambiar={cambiarTipo} />
      {periodo.tipo === "rango" ? (
        <>
          <SelectorFecha aria-label="Desde" className="w-40" valor={periodo.desde} alCambiar={cambiarDesde} />
          <SelectorFecha aria-label="Hasta" className="w-40" valor={periodo.hasta} alCambiar={cambiarHasta} />
        </>
      ) : (
        <SelectorFecha
          aria-label={periodo.tipo === "semana" ? "Semana que contiene la fecha" : "Mes que contiene la fecha"}
          className="w-40"
          valor={periodo.desde}
          alCambiar={(fecha) => ir({ tipo: periodo.tipo, desde: fecha, hasta: fecha })}
        />
      )}
      <Selector
        aria-label="Profesional"
        className="w-56"
        valor={profesionalId ?? TODOS}
        opciones={[{ valor: TODOS, etiqueta: "Todos los profesionales" }, ...profesionales]}
        alCambiar={(valor) => ir(periodo, valor === TODOS ? null : valor)}
      />
    </div>
  );
}
