"use client";

import { useId, useState, useTransition } from "react";
import { AreaTexto, Boton, Campo, CerrarDialogo, Dialogo } from "@/components/ui";
import type { DestinoTurno } from "@/domain/turnos/estados";
import { cancelarTurno, confirmarTurno, marcarAtendido, marcarAusente } from "@/server/turnos/estados-turno";

const accionesDirectas = {
  CONFIRMADO: { etiqueta: "Confirmar turno", ejecutar: confirmarTurno, variante: "primario" },
  ATENDIDO: { etiqueta: "Marcar atendido", ejecutar: marcarAtendido, variante: "secundario" },
  AUSENTE: { etiqueta: "Marcar ausente", ejecutar: marcarAusente, variante: "secundario" },
} as const;

export function AccionesDelTurno({ id, acciones }: { id: string; acciones: readonly DestinoTurno[] }) {
  const idFormulario = useId();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [accionEnCurso, setAccionEnCurso] = useState<DestinoTurno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiarDialogo(abierto: boolean) {
    if (pendiente) return;
    setError(null);
    setErrorMotivo(null);
    setDialogoAbierto(abierto);
  }

  function ejecutar(destino: DestinoTurno, motivo = "") {
    setAccionEnCurso(destino);
    setError(null);
    setErrorMotivo(null);

    iniciarTransicion(async () => {
      try {
        const resultado = destino === "CANCELADO"
          ? await cancelarTurno(id, motivo)
          : await accionesDirectas[destino].ejecutar(id);

        if (resultado.ok) {
          if (destino === "CANCELADO") setDialogoAbierto(false);
          return;
        }
        const mensajeMotivo = resultado.campos?.motivo?.[0];
        if (mensajeMotivo) setErrorMotivo(mensajeMotivo);
        else setError(resultado.error);
      } catch {
        setError("No pudimos actualizar el turno. Volvé a intentarlo.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {error && !dialogoAbierto ? <p className="err" role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Acciones del turno">
        {acciones.map((destino) => {
          if (destino === "CANCELADO") {
            return (
              <Dialogo
                key={destino}
                abierto={dialogoAbierto}
                alCambiarAbierto={cambiarDialogo}
                titulo="Cancelar turno"
                descripcion="El horario quedará disponible para otro turno."
                disparador={<Boton variante="peligro-fantasma" disabled={pendiente}>Cancelar turno</Boton>}
                acciones={
                  <>
                    <CerrarDialogo><Boton variante="secundario" disabled={pendiente}>Volver</Boton></CerrarDialogo>
                    <Boton type="submit" form={idFormulario} variante="peligro" cargando={pendiente}>
                      Confirmar cancelación
                    </Boton>
                  </>
                }
              >
                <form id={idFormulario} onSubmit={(evento) => {
                  evento.preventDefault();
                  const motivo = new FormData(evento.currentTarget).get("motivo");
                  if (!pendiente && typeof motivo === "string") ejecutar("CANCELADO", motivo);
                }}>
                  {error ? <p className="err" role="alert">{error}</p> : null}
                  <Campo etiqueta="Motivo de la cancelación" obligatorio error={errorMotivo ?? undefined}>
                    {(propiedades) => <AreaTexto {...propiedades} name="motivo" rows={3} disabled={pendiente} />}
                  </Campo>
                </form>
              </Dialogo>
            );
          }

          const accion = accionesDirectas[destino];
          return (
            <Boton
              key={destino}
              variante={accion.variante}
              disabled={pendiente}
              cargando={pendiente && accionEnCurso === destino}
              onClick={() => ejecutar(destino)}
            >
              {accion.etiqueta}
            </Boton>
          );
        })}
      </div>
    </div>
  );
}
