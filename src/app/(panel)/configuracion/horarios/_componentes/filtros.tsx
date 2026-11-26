"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Campo, EntradaNumero, Selector, SelectorFecha } from "@/components/ui";
import { esquemaConsultaDisponibilidad } from "@/domain/horarios/esquemas";
import { DURACION_MAXIMA, DURACION_MINIMA, MENSAJES, PASO_MINUTOS } from "@/domain/horarios/constantes";

export type Parametros = { profesional: string; fecha: string; duracion: number };

function enlace(p: Parametros): string {
  const q = new URLSearchParams({ profesional: p.profesional, fecha: p.fecha, duracion: String(p.duracion) });
  return `/configuracion/horarios?${q.toString()}`;
}

/** Cambia de profesional manteniendo fecha y duración en la URL. */
export function SelectorProfesional({ parametros, opciones }: { parametros: Parametros; opciones: { valor: string; etiqueta: string; meta?: string }[] }) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  return (
    <Selector
      aria-label="Profesional"
      className="w-64"
      valor={parametros.profesional}
      opciones={opciones}
      alCambiar={(profesional) => iniciar(() => router.push(enlace({ ...parametros, profesional })))}
    />
  );
}

/** Fecha, duración y prestación para precargar la duración de la consulta de disponibilidad. */
export function ControlesDisponibilidad({
  parametros,
  prestaciones,
}: {
  parametros: Parametros;
  prestaciones: { id: string; nombre: string; duracionMinutos: number }[];
}) {
  const router = useRouter();
  const [cargando, iniciar] = useTransition();
  const ir = (cambios: Partial<Parametros>) => iniciar(() => router.push(enlace({ ...parametros, ...cambios }), { scroll: false }));
  const prestacionActual = prestaciones.find((p) => p.duracionMinutos === parametros.duracion)?.id ?? null;

  // La duración se escribe libre: se consulta medio segundo después del último cambio válido.
  const [duracion, setDuracion] = useState<number | null>(parametros.duracion);
  const [duracionPrevia, setDuracionPrevia] = useState(parametros.duracion);
  if (duracionPrevia !== parametros.duracion) {
    setDuracionPrevia(parametros.duracion);
    setDuracion(parametros.duracion);
  }
  const duracionValida = esquemaConsultaDisponibilidad.shape.duracion.safeParse(duracion).success;
  useEffect(() => {
    if (!duracionValida || duracion === null || duracion === parametros.duracion) return;
    const t = setTimeout(() => iniciar(() => router.push(enlace({ ...parametros, duracion }), { scroll: false })), 500);
    return () => clearTimeout(t);
  }, [duracion, duracionValida, parametros, router]);

  return (
    <div className="stack" style={{ gap: 16 }} aria-busy={cargando || undefined}>
      <Campo etiqueta="Fecha">
        {(p) => <SelectorFecha {...p} valor={parametros.fecha} alCambiar={(fecha) => ir({ fecha })} />}
      </Campo>
      <Campo
        etiqueta="Duración"
        error={duracionValida ? undefined : MENSAJES.duracionInvalida}
        ayuda={duracionValida ? `Múltiplo de ${PASO_MINUTOS} entre ${DURACION_MINIMA} y ${DURACION_MAXIMA} minutos.` : undefined}
      >
        {(p) => (
          <EntradaNumero
            {...p}
            valor={duracion}
            alCambiar={setDuracion}
            min={DURACION_MINIMA}
            max={DURACION_MAXIMA}
            paso={PASO_MINUTOS}
            unidad="minutos"
          />
        )}
      </Campo>
      <Campo etiqueta="Precargar desde una prestación" opcional>
        {(p) => (
          <Selector
            {...p}
            valor={prestacionActual}
            placeholder="Elegí una prestación"
            opciones={prestaciones.map((x) => ({ valor: x.id, etiqueta: x.nombre, meta: `${x.duracionMinutos} min` }))}
            alCambiar={(id) => {
              const elegida = prestaciones.find((x) => x.id === id);
              if (elegida) ir({ duracion: elegida.duracionMinutos });
            }}
          />
        )}
      </Campo>
    </div>
  );
}
