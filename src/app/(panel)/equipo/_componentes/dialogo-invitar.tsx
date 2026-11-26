"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boton, CerrarDialogo, Dialogo, Entrada, FormField, GrupoRadio, Selector, useToast } from "@/components/ui";
import { esquemaInvitacion, type DatosInvitacion, type FormularioInvitacion } from "@/domain/equipo/esquemas";
import { invitarMiembro } from "@/server/equipo/acciones";
import { OPCIONES_ROL, opcionesProfesional, type ProfesionalVinculo } from "./tipos";

const CAMPOS = ["email", "rol", "profesionalId"] as const;
const VALORES_INICIALES: FormularioInvitacion = { email: "", rol: "RECEPCION", profesionalId: "" };

/** Diálogo "Invitar al equipo" (US-060, RN-EQ-02, RN-EQ-03). */
export function DialogoInvitar({ profesionales }: { profesionales: ProfesionalVinculo[] }) {
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const form = useForm<FormularioInvitacion, unknown, DatosInvitacion>({
    resolver: zodResolver(esquemaInvitacion),
    defaultValues: VALORES_INICIALES,
  });
  const rol = useWatch({ control: form.control, name: "rol" });

  async function enviar(datos: DatosInvitacion) {
    const resultado = await invitarMiembro(datos);
    if (resultado.ok) {
      toast.exito("Invitación enviada", resultado.data.email);
      setAbierto(false);
      return;
    }
    for (const [campo, mensajes] of Object.entries(resultado.campos ?? {})) {
      const nombre = CAMPOS.find((c) => c === campo);
      if (nombre && mensajes[0]) form.setError(nombre, { type: "server", message: mensajes[0] });
    }
    toast.error("No se pudo enviar la invitación", resultado.error);
  }

  return (
    <Dialogo
      abierto={abierto}
      alCambiarAbierto={(a) => {
        setAbierto(a);
        if (a) form.reset(VALORES_INICIALES);
      }}
      disparador={
        <Boton variante="primario" tamano="sm" icono="user-plus">
          Invitar
        </Boton>
      }
      titulo="Invitar al equipo"
      descripcion="Le llega un email para activar su cuenta."
    >
      <form noValidate onSubmit={form.handleSubmit(enviar)} className="stack gap-5">
        <FormField control={form.control} name="email" etiqueta="Email" obligatorio>
          {({ control, campo }) => <Entrada {...control} {...campo} tipo="email" autoComplete="off" placeholder="nombre.apellido@example.com" />}
        </FormField>
        <FormField control={form.control} name="rol" etiqueta="Rol" obligatorio>
          {({ control, campo }) => (
            <GrupoRadio
              {...control}
              aria-label="Rol"
              ref={campo.ref}
              name={campo.name}
              valor={campo.value}
              alCambiar={campo.onChange}
              onBlur={campo.onBlur}
              opciones={OPCIONES_ROL}
            />
          )}
        </FormField>
        {rol === "PROFESIONAL" ? (
          <FormField control={form.control} name="profesionalId" etiqueta="Profesional vinculado" obligatorio ayuda="Obligatorio para el rol Profesional.">
            {({ control, campo }) => (
              <Selector
                {...control}
                ref={campo.ref}
                name={campo.name}
                valor={campo.value || null}
                alCambiar={campo.onChange}
                onBlur={campo.onBlur}
                placeholder={profesionales.length ? "Elegí un profesional" : "No hay profesionales activos"}
                opciones={opcionesProfesional(profesionales)}
              />
            )}
          </FormField>
        ) : null}
        <div className="row justify-end">
          <CerrarDialogo>
            <Boton variante="fantasma" tamano="sm" type="button">
              Cancelar
            </Boton>
          </CerrarDialogo>
          <Boton variante="primario" tamano="sm" type="submit" cargando={form.formState.isSubmitting}>
            Enviar invitación
          </Boton>
        </div>
      </form>
    </Dialogo>
  );
}
