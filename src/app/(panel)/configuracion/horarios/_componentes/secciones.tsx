import { EstadoVacio, Etiqueta, Tabla, TablaCelda, TablaCeldaEncabezado, TablaCuerpo, TablaEncabezado, TablaFila, TablaVacia } from "@/components/ui";
import { aFechaHoraLocal, formatearRangoBloqueo } from "@/domain/horarios/bloqueos";
import { agruparFranjasPorDia, type FranjaDominio } from "@/domain/horarios/franjas";
import { formatearHora } from "@/domain/shared/fechas";
import { BotonEliminar } from "./boton-eliminar";
import { DialogoBloqueo } from "./dialogo-bloqueo";
import { DialogoFranja } from "./dialogo-franja";

type Franja = FranjaDominio & { id: string };

/** Horario semanal de lunes a domingo (spec horarios-de-atencion). Controles solo si `editable` (ADMIN). */
export function HorarioSemanal({ profesionalId, franjas, editable }: { profesionalId: string; franjas: Franja[]; editable: boolean }) {
  return (
    <Tabla titulo="Horario semanal">
      <TablaEncabezado>
        <TablaFila>
          <TablaCeldaEncabezado style={{ width: 140 }}>Día</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Franjas</TablaCeldaEncabezado>
          {editable ? <TablaCeldaEncabezado style={{ width: 64 }}><span className="sr-only">Acciones</span></TablaCeldaEncabezado> : null}
        </TablaFila>
      </TablaEncabezado>
      <TablaCuerpo>
        {agruparFranjasPorDia(franjas).map((dia) => (
          <TablaFila key={dia.diaSemana}>
            <TablaCelda destacada>{dia.nombre}</TablaCelda>
            <TablaCelda style={{ whiteSpace: "normal" }}>
              {dia.franjas.length === 0 ? (
                <span className="muted">No atiende</span>
              ) : (
                <div className="row">
                  {dia.franjas.map((f) => (
                    <span key={f.id} className="row" style={{ gap: 2 }}>
                      <Etiqueta>{f.etiqueta}</Etiqueta>
                      {editable ? (
                        <>
                          <DialogoFranja profesionalId={profesionalId} franja={f} />
                          <BotonEliminar tipo="franja" id={f.id} descripcion={`${dia.nombre} ${f.etiqueta}`} />
                        </>
                      ) : null}
                    </span>
                  ))}
                </div>
              )}
            </TablaCelda>
            {editable ? (
              <TablaCelda>
                <DialogoFranja profesionalId={profesionalId} diaInicial={dia.diaSemana} />
              </TablaCelda>
            ) : null}
          </TablaFila>
        ))}
      </TablaCuerpo>
    </Tabla>
  );
}

type Bloqueo = { id: string; profesionalId: string; desde: Date; hasta: Date; motivo: string };

/** Bloqueos vigentes y futuros en hora de Argentina (spec bloqueos-de-agenda). */
export function ListaBloqueos({ profesionalId, bloqueos, editable }: { profesionalId: string; bloqueos: Bloqueo[]; editable: boolean }) {
  const columnas = editable ? 3 : 2;
  return (
    <Tabla titulo="Bloqueos">
      <TablaEncabezado>
        <TablaFila>
          <TablaCeldaEncabezado>Período</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Motivo</TablaCeldaEncabezado>
          {editable ? <TablaCeldaEncabezado style={{ width: 96 }}><span className="sr-only">Acciones</span></TablaCeldaEncabezado> : null}
        </TablaFila>
      </TablaEncabezado>
      <TablaCuerpo>
        {bloqueos.length === 0 ? (
          <TablaVacia columnas={columnas} icono="calendar-off" titulo="Sin bloqueos próximos" descripcion="Vacaciones, feriados o congresos del profesional." />
        ) : (
          bloqueos.map((b) => {
            const rango = formatearRangoBloqueo(b.desde, b.hasta);
            return (
              <TablaFila key={b.id}>
                <TablaCelda hora>{rango}</TablaCelda>
                <TablaCelda style={{ whiteSpace: "normal" }}>{b.motivo}</TablaCelda>
                {editable ? (
                  <TablaCelda>
                    <div className="row" style={{ gap: 2 }}>
                      <DialogoBloqueo
                        profesionalId={profesionalId}
                        bloqueo={{ id: b.id, desde: aFechaHoraLocal(b.desde), hasta: aFechaHoraLocal(b.hasta), motivo: b.motivo }}
                      />
                      <BotonEliminar tipo="bloqueo" id={b.id} descripcion={`${b.motivo}, ${rango}`} />
                    </div>
                  </TablaCelda>
                ) : null}
              </TablaFila>
            );
          })
        )}
      </TablaCuerpo>
    </Tabla>
  );
}

/** Inicios libres agrupados por franja, o el estado vacío (spec disponibilidad). */
export function IniciosDisponibles({ grupos, mensajeVacio }: { grupos: { etiqueta: string; inicios: Date[] }[]; mensajeVacio: string | null }) {
  if (mensajeVacio) return <EstadoVacio icono="calendar-off" titulo={mensajeVacio} />;
  return (
    <div className="stack" style={{ gap: 16 }}>
      {grupos.map((g) => (
        <div key={g.etiqueta} className="stack">
          <p className="help">
            Franja {g.etiqueta} · {g.inicios.length} {g.inicios.length === 1 ? "inicio" : "inicios"}
          </p>
          {g.inicios.length === 0 ? (
            <span className="muted">Sin horarios libres en esta franja.</span>
          ) : (
            <ul className="row num" aria-label={`Inicios libres en la franja ${g.etiqueta}`} style={{ listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
              {g.inicios.map((i) => (
                <li key={i.getTime()}>
                  <Etiqueta>{formatearHora(i)}</Etiqueta>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
