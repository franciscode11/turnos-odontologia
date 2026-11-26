"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boton, CerrarDialogo, Dialogo, FormField, Selector, SelectorHora, useToast } from "@/components/ui";
import { NOMBRES_DIA } from "@/domain/horarios/constantes";
import { esquemaFranja, type DatosFranja } from "@/domain/horarios/esquemas";
import { crearFranja, editarFranja } from "@/server/horarios/franjas";
import { aplicarResultado } from "./resultado-formulario";

const OPCIONES_DIA = NOMBRES_DIA.map((nombre, i) => ({ valor: String(i + 1), etiqueta: nombre }));
const CAMPOS = ["diaSemana", "horaDesde", "horaHasta"] as const;

type Props = {
  profesionalId: string;
  /** Franja a editar; sin ella, el diálogo da de alta una nueva en `diaInicial`. */
  franja?: { id: string; diaSemana: number; horaDesde: string; horaHasta: string };
  diaInicial?: number;
};

/** Alta y edición de una franja semanal (RN-HO-01, RN-HO-02). Solo se muestra a ADMIN; el servidor lo verifica igual. */
export function DialogoFranja({ profesionalId, franja, diaInicial = 1 }: Props) {
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const valoresIniciales: DatosFranja = {
    profesionalId,
    diaSemana: franja?.diaSemana ?? diaInicial,
    horaDesde: franja?.horaDesde ?? "",
    horaHasta: franja?.horaHasta ?? "",
  };
  const form = useForm<DatosFranja>({ resolver: zodResolver(esquemaFranja), defaultValues: valoresIniciales });

  const guardar = async (datos: DatosFranja) => {
    const resultado = franja ? await editarFranja({ id: franja.id, datos }) : await crearFranja(datos);
    const etiqueta = `${NOMBRES_DIA[datos.diaSemana - 1]} ${datos.horaDesde} - ${datos.horaHasta}`;
    if (aplicarResultado(resultado, toast, form.setError, CAMPOS, franja ? `Franja actualizada: ${etiqueta}` : `Franja agregada: ${etiqueta}`)) {
      setAbierto(false);
    }
  };

  return (
    <Dialogo
      abierto={abierto}
      alCambiarAbierto={(a) => {
        setAbierto(a);
        if (a) form.reset(valoresIniciales);
      }}
      disparador={
        franja ? (
          <Boton variante="fantasma" tamano="sm" icono="pencil" etiqueta={`Editar franja ${franja.horaDesde} - ${franja.horaHasta}`} />
        ) : (
          <Boton variante="fantasma" tamano="sm" icono="plus" etiqueta={`Agregar franja el ${NOMBRES_DIA[diaInicial - 1]}`} />
        )
      }
      titulo={franja ? "Editar franja" : "Agregar franja"}
      descripcion="Horario de atención en hora del consultorio. Una franja puede empezar justo cuando termina otra."
    >
      <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
        <FormField control={form.control} name="diaSemana" etiqueta="Día" obligatorio>
          {({ control, campo }) => (
            <Selector
              {...control}
              ref={campo.ref}
              name={campo.name}
              valor={String(campo.value)}
              alCambiar={(v) => campo.onChange(Number(v))}
              onBlur={campo.onBlur}
              opciones={OPCIONES_DIA}
            />
          )}
        </FormField>
        <div className="grid g-2 gap-5">
          <FormField control={form.control} name="horaDesde" etiqueta="Hora desde" obligatorio>
            {({ control, campo }) => (
              <SelectorHora {...control} ref={campo.ref} valor={campo.value || null} alCambiar={campo.onChange} onBlur={campo.onBlur} desde="06:00" hasta="23:45" />
            )}
          </FormField>
          <FormField control={form.control} name="horaHasta" etiqueta="Hora hasta" obligatorio>
            {({ control, campo }) => (
              <SelectorHora {...control} ref={campo.ref} valor={campo.value || null} alCambiar={campo.onChange} onBlur={campo.onBlur} desde="06:00" hasta="23:45" />
            )}
          </FormField>
        </div>
        <div className="row justify-end">
          <CerrarDialogo>
            <Boton variante="fantasma">Cancelar</Boton>
          </CerrarDialogo>
          <Boton type="submit" cargando={form.formState.isSubmitting}>
            Guardar franja
          </Boton>
        </div>
      </form>
    </Dialogo>
  );
}
