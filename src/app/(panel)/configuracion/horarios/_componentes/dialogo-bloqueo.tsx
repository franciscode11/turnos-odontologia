"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AreaTexto, Boton, CerrarDialogo, Dialogo, FormField, SelectorFechaHora, useToast } from "@/components/ui";
import { esquemaBloqueo, type DatosBloqueo } from "@/domain/horarios/esquemas";
import { crearBloqueo, editarBloqueo } from "@/server/horarios/bloqueos";
import { aplicarResultado } from "./resultado-formulario";

const CAMPOS = ["desde", "hasta", "motivo"] as const;

type Props = {
  profesionalId: string;
  /** Bloqueo a editar, con `desde` y `hasta` como "AAAA-MM-DDTHH:mm" en hora de Argentina. */
  bloqueo?: { id: string; desde: string; hasta: string; motivo: string };
};

/** Alta y edición de un bloqueo (RN-HO-03). Fechas en hora de Argentina; el servidor guarda en UTC (RN-GL-03). */
export function DialogoBloqueo({ profesionalId, bloqueo }: Props) {
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const valoresIniciales: DatosBloqueo = {
    profesionalId,
    desde: bloqueo?.desde ?? "",
    hasta: bloqueo?.hasta ?? "",
    motivo: bloqueo?.motivo ?? "",
  };
  const form = useForm<DatosBloqueo>({ resolver: zodResolver(esquemaBloqueo), defaultValues: valoresIniciales });

  const guardar = async (datos: DatosBloqueo) => {
    const resultado = bloqueo ? await editarBloqueo({ id: bloqueo.id, datos }) : await crearBloqueo(datos);
    if (aplicarResultado(resultado, toast, form.setError, CAMPOS, bloqueo ? "Bloqueo actualizado" : "Bloqueo agregado")) setAbierto(false);
  };

  return (
    <Dialogo
      abierto={abierto}
      alCambiarAbierto={(a) => {
        setAbierto(a);
        if (a) form.reset(valoresIniciales);
      }}
      disparador={
        bloqueo ? (
          <Boton variante="fantasma" tamano="sm" icono="pencil" etiqueta={`Editar bloqueo ${bloqueo.motivo}`} />
        ) : (
          <Boton variante="secundario" tamano="sm" icono="plus">
            Agregar bloqueo
          </Boton>
        )
      }
      titulo={bloqueo ? "Editar bloqueo" : "Agregar bloqueo"}
      descripcion="Vacaciones, feriados o congresos. Los turnos ya reservados no cambian."
    >
      <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
        <div className="grid g-2 gap-5">
          <FormField control={form.control} name="desde" etiqueta="Desde" obligatorio>
            {({ control, campo }) => (
              <SelectorFechaHora {...control} ref={campo.ref} valor={campo.value || null} alCambiar={campo.onChange} onBlur={campo.onBlur} desde="00:00" hasta="23:45" />
            )}
          </FormField>
          <FormField control={form.control} name="hasta" etiqueta="Hasta" obligatorio ayuda="No incluido: hasta 00:00 libera todo el día siguiente.">
            {({ control, campo }) => (
              <SelectorFechaHora {...control} ref={campo.ref} valor={campo.value || null} alCambiar={campo.onChange} onBlur={campo.onBlur} desde="00:00" hasta="23:45" />
            )}
          </FormField>
        </div>
        <FormField control={form.control} name="motivo" etiqueta="Motivo" obligatorio>
          {({ control, campo }) => <AreaTexto {...control} {...campo} rows={2} placeholder="Congreso de endodoncia" />}
        </FormField>
        <div className="row justify-end">
          <CerrarDialogo>
            <Boton variante="fantasma">Cancelar</Boton>
          </CerrarDialogo>
          <Boton type="submit" cargando={form.formState.isSubmitting}>
            Guardar bloqueo
          </Boton>
        </div>
      </form>
    </Dialogo>
  );
}
