import { CeldaPersona, Tabla, TablaCelda, TablaCeldaEncabezado, TablaCuerpo, TablaEncabezado, TablaFila, TablaVacia } from "@/components/ui";
import { formatearCantidad, formatearPorcentaje } from "@/domain/estadisticas/formato";
import type { FilaProfesional } from "@/domain/estadisticas/reporte";

const ANCHO_BARRA = 80;

/** Turnos, ocupación, ausentismo, cancelaciones y prestación más dada por profesional (RN-ST-02 a RN-ST-05). */
export function TablaProfesionales({ filas }: { filas: FilaProfesional[] }) {
  return (
    <Tabla titulo="Indicadores por profesional">
      <TablaEncabezado>
        <TablaFila>
          <TablaCeldaEncabezado>Profesional</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Turnos</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Ocupación</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Ausentismo</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Cancelaciones</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Prestación más dada</TablaCeldaEncabezado>
        </TablaFila>
      </TablaEncabezado>
      <TablaCuerpo>
        {filas.length === 0 ? (
          <TablaVacia columnas={6} titulo="No hay profesionales para mostrar" icono="stethoscope" />
        ) : (
          filas.map(({ profesional, indicadores, prestacionMasDada }) => (
            <TablaFila key={profesional.id}>
              <TablaCelda>
                <CeldaPersona nombre={profesional.nombre} detalle={profesional.especialidad ?? undefined} avatar={profesional.avatar} detalleMono={false} />
              </TablaCelda>
              <TablaCelda destacada>{formatearCantidad(indicadores.turnosDados)}</TablaCelda>
              <TablaCelda>
                {indicadores.ocupacion !== null ? (
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      width: Math.round(Math.min(1, indicadores.ocupacion) * ANCHO_BARRA),
                      height: 6,
                      borderRadius: 3,
                      background: "var(--color-accent-600)",
                      verticalAlign: "middle",
                      marginRight: 8,
                    }}
                  />
                ) : null}
                {formatearPorcentaje(indicadores.ocupacion)}
              </TablaCelda>
              <TablaCelda>{formatearPorcentaje(indicadores.ausentismo)}</TablaCelda>
              <TablaCelda>{formatearPorcentaje(indicadores.cancelaciones)}</TablaCelda>
              <TablaCelda apagada={prestacionMasDada === null}>{prestacionMasDada ?? "-"}</TablaCelda>
            </TablaFila>
          ))
        )}
      </TablaCuerpo>
    </Tabla>
  );
}
