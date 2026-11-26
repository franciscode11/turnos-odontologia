import type { Metadata } from "next";
import { BotonEnlace, CuerpoPagina, EncabezadoPagina, EstadoVacio } from "@/components/ui";
import { periodoAnterior, periodoSiguiente, resolverPeriodo } from "@/domain/estadisticas/periodos";
import { hoy } from "@/domain/shared/fechas";
import { MENSAJE_SIN_PERMISOS } from "@/server/auth/acceso";
import { accesoPagina } from "@/server/auth/pagina";
import { consultarEstadisticas } from "@/server/estadisticas/instancia";
import { SinPermiso } from "../_shell/sin-permiso";
import { TarjetaBarras } from "./_componentes/barras";
import { enlaceEstadisticas } from "./_componentes/enlaces";
import { FiltrosEstadisticas } from "./_componentes/filtros";
import { Indicadores } from "./_componentes/indicadores";
import { TablaProfesionales } from "./_componentes/tabla-profesionales";
import { TurnosPorDia } from "./_componentes/turnos-por-dia";

export const metadata: Metadata = { title: "Estadísticas" };

/**
 * /estadisticas (C-08): indicadores del período para el dueño del consultorio (DD-16, US-070).
 * Solo ADMIN (RN-ST-01): la página muestra SinPermiso y la consulta vuelve a exigir el rol.
 * Período y profesional por searchParams; cualquier valor inválido → mes actual y todos.
 */
export default async function PaginaEstadisticas({ searchParams }: PageProps<"/estadisticas">) {
  const { permitido } = await accesoPagina("estadisticas.ver");
  if (!permitido) return <SinPermiso />;

  const q = await searchParams;
  const periodo = resolverPeriodo(q, hoy(new Date()));
  const resultado = await consultarEstadisticas(periodo, q.profesional);

  if (!resultado.ok) {
    if (resultado.error === MENSAJE_SIN_PERMISOS) return <SinPermiso />;
    return (
      <>
        <EncabezadoPagina titulo="Estadísticas" />
        <CuerpoPagina>
          <EstadoVacio icono="alert-triangle" titulo="No pudimos calcular las estadísticas" descripcion={resultado.error} />
        </CuerpoPagina>
      </>
    );
  }

  const { reporte, profesionales } = resultado.data;
  const filtrado = profesionales.find((p) => p.id === reporte.profesionalId);

  return (
    <>
      <EncabezadoPagina
        titulo="Estadísticas"
        descripcion={`${reporte.etiqueta}, comparado con ${reporte.comparadoCon}${filtrado ? ` · ${filtrado.nombre}` : ""}`}
        acciones={
          <>
            <div className="row" style={{ gap: 4 }}>
              <BotonEnlace href={enlaceEstadisticas(periodoAnterior(periodo), reporte.profesionalId)} tamano="sm" icono="chevron-left" etiqueta="Período anterior" />
              <BotonEnlace href={enlaceEstadisticas(periodoSiguiente(periodo), reporte.profesionalId)} tamano="sm" icono="chevron-right" etiqueta="Período siguiente" />
            </div>
            <FiltrosEstadisticas
              periodo={periodo}
              profesionalId={reporte.profesionalId}
              profesionales={profesionales.map((p) => ({ valor: p.id, etiqueta: p.nombre, meta: p.especialidad ?? undefined }))}
            />
          </>
        }
      />
      <CuerpoPagina>
        <Indicadores reporte={reporte} />

        {reporte.sinTurnos ? (
          <div style={{ marginTop: 24 }}>
            <EstadoVacio icono="chart-bar" titulo="No hay turnos en este período" descripcion="Elegí otro período o profesional para ver turnos por día, motivos y la tabla por profesional." />
          </div>
        ) : (
          <>
            <div className="grid g-21" style={{ marginTop: 24 }}>
              <TurnosPorDia dias={reporte.turnosPorDia} />
              <div className="stack" style={{ gap: 24 }}>
                <TarjetaBarras
                  titulo="Motivos de cancelación"
                  vacio="No hubo cancelaciones"
                  filas={reporte.motivos.map((m) => ({ clave: m.motivo, etiqueta: m.motivo, cantidad: m.cantidad }))}
                />
                <TarjetaBarras
                  titulo="Turnos por prestación"
                  vacio="No hay turnos"
                  filas={reporte.prestaciones.map((p) => ({ clave: p.prestacionId, etiqueta: p.nombre, cantidad: p.cantidad }))}
                />
              </div>
            </div>

            <section className="section" style={{ marginTop: 24 }}>
              <TablaProfesionales filas={reporte.profesionales} />
              <p className="help" style={{ marginTop: 10 }}>
                Ocupación: minutos con turno que ocupa agenda sobre minutos de atención, descontando bloqueos. Ausentismo: ausentes sobre atendidos más ausentes. Solo la ve el rol Administrador.
              </p>
            </section>
          </>
        )}
      </CuerpoPagina>
    </>
  );
}
