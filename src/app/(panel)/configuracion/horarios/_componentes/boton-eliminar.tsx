"use client";

import { useState, useTransition } from "react";
import { Boton, CerrarDialogo, Dialogo, useToast } from "@/components/ui";
import { eliminarBloqueo } from "@/server/horarios/bloqueos";
import { eliminarFranja } from "@/server/horarios/franjas";

type Props = {
  tipo: "franja" | "bloqueo";
  id: string;
  /** Texto que identifica lo que se borra ("Lunes 09:00 - 12:00"). */
  descripcion: string;
};

/** Eliminación con confirmación (spec: "Eliminar una franja" / "Eliminar un bloqueo"). Solo ADMIN. */
export function BotonEliminar({ tipo, id, descripcion }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [eliminando, iniciar] = useTransition();
  const toast = useToast();
  const nombre = tipo === "franja" ? "franja" : "bloqueo";

  const confirmar = () =>
    iniciar(async () => {
      const resultado = tipo === "franja" ? await eliminarFranja({ id }) : await eliminarBloqueo({ id });
      if (resultado.ok) {
        toast.exito(tipo === "franja" ? "Franja eliminada" : "Bloqueo eliminado", descripcion);
        setAbierto(false);
      } else {
        toast.error(resultado.error);
      }
    });

  return (
    <Dialogo
      abierto={abierto}
      alCambiarAbierto={setAbierto}
      disparador={<Boton variante="peligro-fantasma" tamano="sm" icono="trash" etiqueta={`Eliminar ${nombre} ${descripcion}`} />}
      titulo={tipo === "franja" ? "¿Eliminar la franja?" : "¿Eliminar el bloqueo?"}
      descripcion={`${descripcion}. Los turnos ya creados no cambian.`}
      acciones={
        <>
          <CerrarDialogo>
            <Boton variante="fantasma">Cancelar</Boton>
          </CerrarDialogo>
          <Boton variante="peligro" cargando={eliminando} onClick={confirmar}>
            Eliminar
          </Boton>
        </>
      }
    />
  );
}
