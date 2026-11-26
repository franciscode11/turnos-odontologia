"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boton, CerrarDialogo, Dialogo, FormField, GrupoRadio, Selector, useToast } from "@/components/ui";
import { esquemaCambioRol, type DatosCambioRol, type FormularioCambioRol } from "@/domain/equipo/esquemas";
import { cambiarRol, desactivarUsuario, reactivarUsuario, reenviarInvitacion, revocarInvitacion } from "@/server/equipo/acciones";
import { avisarResultado, OPCIONES_ROL, opcionesProfesional, type FilaEquipo, type ProfesionalVinculo } from "./tipos";

type Modo = "menu" | "rol" | "desactivar" | "revocar";

const TITULO: Record<Modo, string> = {
  menu: "Opciones",
  rol: "Cambiar rol",
  desactivar: "Desactivar usuario",
  revocar: "Revocar invitación",
};

type Props = { fila: FilaEquipo; profesionales: ProfesionalVinculo[] };

/**
 * Acciones de una fila (menú "Opciones" de la referencia). El sistema de componentes no tiene
 * menú desplegable: se usa un Dialogo con modos, y las acciones destructivas piden confirmación.
 */
export function DialogoAcciones({ fila, profesionales }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<Modo>("menu");
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();
  const valoresRol: FormularioCambioRol = { usuarioId: fila.id, rol: fila.rol, profesionalId: fila.profesionalId ?? "" };
  const form = useForm<FormularioCambioRol, unknown, DatosCambioRol>({ resolver: zodResolver(esquemaCambioRol), defaultValues: valoresRol });
  const rol = useWatch({ control: form.control, name: "rol" });

  async function ejecutar(accion: () => Promise<Parameters<typeof avisarResultado>[0]>, titulo: string) {
    setEnviando(true);
    try {
      if (avisarResultado(await accion(), toast, titulo, fila.titulo)) setAbierto(false);
    } finally {
      setEnviando(false);
    }
  }

  async function guardarRol(datos: DatosCambioRol) {
    const resultado = await cambiarRol(datos);
    if (!resultado.ok && resultado.campos?.profesionalId?.[0]) {
      form.setError("profesionalId", { type: "server", message: resultado.campos.profesionalId[0] });
    }
    if (avisarResultado(resultado, toast, "Rol actualizado", fila.titulo)) setAbierto(false);
  }

  const id = { usuarioId: fila.id };
  const descripcion =
    modo === "desactivar"
      ? `${fila.titulo} no va a poder entrar al sistema. Sus turnos y el historial se conservan y podés reactivarlo cuando quieras.`
      : modo === "revocar"
        ? `El enlace que recibió ${fila.email} deja de servir y la persona sale de la lista.`
        : fila.titulo;

  return (
    <Dialogo
      abierto={abierto}
      alCambiarAbierto={(a) => {
        setAbierto(a);
        if (a) {
          setModo("menu");
          form.reset(valoresRol);
        }
      }}
      disparador={<Boton variante="fantasma" tamano="sm" icono="dots" etiqueta={`Opciones de ${fila.titulo}`} />}
      titulo={TITULO[modo]}
      descripcion={descripcion}
    >
      {modo === "menu" ? (
        <div className="stack gap-2">
          {fila.estado === "INVITADO" ? (
            <Boton variante="secundario" icono="mail" bloque cargando={enviando} onClick={() => void ejecutar(() => reenviarInvitacion(id), "Invitación reenviada")}>
              Reenviar invitación
            </Boton>
          ) : null}
          {fila.estado === "INACTIVO" ? (
            <Boton variante="secundario" icono="user-check" bloque cargando={enviando} onClick={() => void ejecutar(() => reactivarUsuario(id), "Usuario reactivado")}>
              Reactivar
            </Boton>
          ) : null}
          <Boton variante="secundario" icono="users" bloque onClick={() => setModo("rol")}>
            Cambiar rol
          </Boton>
          {fila.estado === "ACTIVO" && !fila.esUsuarioActual ? (
            <Boton variante="peligro-fantasma" icono="lock" bloque onClick={() => setModo("desactivar")}>
              Desactivar
            </Boton>
          ) : null}
          {fila.estado === "INVITADO" ? (
            <Boton variante="peligro-fantasma" icono="trash" bloque onClick={() => setModo("revocar")}>
              Revocar invitación
            </Boton>
          ) : null}
        </div>
      ) : null}

      {modo === "rol" ? (
        <form noValidate onSubmit={form.handleSubmit(guardarRol)} className="stack gap-5">
          <FormField control={form.control} name="rol" etiqueta="Rol" obligatorio>
            {({ control, campo }) => (
              <GrupoRadio {...control} aria-label="Rol" ref={campo.ref} name={campo.name} valor={campo.value} alCambiar={campo.onChange} onBlur={campo.onBlur} opciones={OPCIONES_ROL} />
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
                  placeholder="Elegí un profesional"
                  opciones={opcionesProfesional(profesionales, fila.id)}
                />
              )}
            </FormField>
          ) : null}
          <div className="row justify-end">
            <Boton variante="fantasma" tamano="sm" onClick={() => setModo("menu")}>
              Volver
            </Boton>
            <Boton variante="primario" tamano="sm" type="submit" cargando={form.formState.isSubmitting}>
              Guardar rol
            </Boton>
          </div>
        </form>
      ) : null}

      {modo === "desactivar" || modo === "revocar" ? (
        <div className="row justify-end">
          <CerrarDialogo>
            <Boton variante="fantasma" tamano="sm">
              Cancelar
            </Boton>
          </CerrarDialogo>
          {modo === "desactivar" ? (
            <Boton variante="peligro" tamano="sm" cargando={enviando} onClick={() => void ejecutar(() => desactivarUsuario(id), "Usuario desactivado")}>
              Desactivar
            </Boton>
          ) : (
            <Boton variante="peligro" tamano="sm" cargando={enviando} onClick={() => void ejecutar(() => revocarInvitacion(id), "Invitación revocada")}>
              Revocar invitación
            </Boton>
          )}
        </div>
      ) : null}
    </Dialogo>
  );
}
