"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Boton, Combobox, FormField, Selector, SelectorFecha, useToast, type Opcion } from "@/components/ui";
import { aInstante, formatearHora } from "@/domain/shared/fechas";
import { esquemaNuevoTurno, finDeTurno, type SolicitudTurno } from "@/domain/turnos/crear-turno";
import type { Resultado } from "@/server/resultado";
import { buscarPacientesParaTurno, consultarHorariosTurno, crearTurno } from "@/server/turnos/crear-turno";

type Props = {
  fechaInicial: string;
  profesionales: Opcion[];
  prestaciones: (Opcion & { duracionMinutos: number })[];
  sillones: Opcion[];
};

const campos = ["pacienteId", "profesionalId", "prestacionId", "sillonId", "fecha", "hora"] as const;
const valoresIniciales: SolicitudTurno = { pacienteId: "", profesionalId: "", prestacionId: "", sillonId: "", fecha: "", hora: "" };

export function FormularioNuevoTurno({ fechaInicial, profesionales, prestaciones, sillones }: Props) {
  const { control, handleSubmit, reset, resetField, clearErrors, setError, formState } = useForm<SolicitudTurno>({
    resolver: zodResolver(esquemaNuevoTurno),
    defaultValues: { ...valoresIniciales, fecha: fechaInicial },
  });
  const [profesionalId, prestacionId, fecha, hora] = useWatch({
    control, name: ["profesionalId", "prestacionId", "fecha", "hora"],
  });
  const [consulta, setConsulta] = useState("");
  const [paciente, setPaciente] = useState<Opcion | null>(null);
  const [busqueda, setBusqueda] = useState<{ consulta: string; resultado: Resultado<Opcion[]> }>();
  const [disponibilidad, setDisponibilidad] = useState<{ clave: string; resultado: Resultado<string[]> }>();
  const toast = useToast();

  const claveHorarios = profesionalId && prestacionId && fecha ? `${profesionalId}/${prestacionId}/${fecha}` : "";
  const resultadoHorarios = disponibilidad?.clave === claveHorarios ? disponibilidad.resultado : undefined;
  const horarios = resultadoHorarios?.ok ? resultadoHorarios.data : [];
  const cargandoHorarios = Boolean(claveHorarios) && !resultadoHorarios;
  const resultadoPacientes = busqueda?.consulta === consulta ? busqueda.resultado : undefined;
  const pacientes = resultadoPacientes?.ok ? resultadoPacientes.data : [];
  const opcionesPaciente = paciente && !pacientes.some((opcion) => opcion.valor === paciente.valor)
    ? [paciente, ...pacientes]
    : pacientes;

  useEffect(() => {
    let vigente = true;
    const timer = setTimeout(async () => {
      try {
        const resultado = await buscarPacientesParaTurno(consulta);
        if (vigente) setBusqueda({ consulta, resultado });
      } catch {
        if (vigente) setBusqueda({ consulta, resultado: { ok: false, error: "No se pudieron cargar los pacientes." } });
      }
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(timer);
    };
  }, [consulta]);

  useEffect(() => {
    if (!claveHorarios) return;
    let vigente = true;
    async function cargar() {
      try {
        const resultado = await consultarHorariosTurno({ profesionalId, prestacionId, fecha });
        if (vigente) setDisponibilidad({ clave: claveHorarios, resultado });
      } catch {
        if (vigente) {
          setDisponibilidad({ clave: claveHorarios, resultado: { ok: false, error: "No se pudieron cargar los horarios." } });
        }
      }
    }
    void cargar();
    return () => { vigente = false; };
  }, [claveHorarios, profesionalId, prestacionId, fecha]);

  function reiniciarHorario() {
    resetField("hora");
    clearErrors("root");
    setDisponibilidad(undefined);
  }

  const guardar = handleSubmit(async (solicitud) => {
    try {
      const resultado = await crearTurno(solicitud);
      if (!resultado.ok) {
        for (const campo of campos) {
          const mensaje = resultado.campos?.[campo]?.[0];
          if (mensaje) setError(campo, { type: "server", message: mensaje });
        }
        setError("root", { type: "server", message: resultado.error });
        return;
      }

      toast.exito("Turno reservado", `${formatearHora(aInstante(solicitud.fecha, solicitud.hora))} · hora de Argentina`);
      reset({ ...valoresIniciales, fecha: solicitud.fecha });
      setDisponibilidad(undefined);
      setPaciente(null);
      setConsulta("");
    } catch {
      setError("root", { type: "server", message: "No se pudo completar la reserva. Podés volver a intentar." });
    }
  });

  const prestacion = prestaciones.find(({ valor }) => valor === prestacionId);
  const detalleHorario = hora && fecha && prestacion
    ? `Fin a las ${formatearHora(finDeTurno(aInstante(fecha, hora), prestacion.duracionMinutos))} · hora de Argentina`
    : "Hora de Argentina";

  return (
    <form noValidate onSubmit={guardar} className="grid gap-5">
      <FormField control={control} name="pacienteId" etiqueta="Paciente" obligatorio>
        {({ control: accesible, campo }) => (
          <Combobox
            {...accesible} ref={campo.ref} onBlur={campo.onBlur}
            opciones={opcionesPaciente} valor={campo.value || null} filtrar={false}
            placeholder="Buscá por nombre, apellido o DNI"
            alCambiarTexto={setConsulta} cargando={!resultadoPacientes} disabled={formState.isSubmitting}
            sinResultados={resultadoPacientes && !resultadoPacientes.ok ? resultadoPacientes.error : "No se encontraron pacientes activos."}
            alCambiar={(id) => {
              setPaciente(opcionesPaciente.find((opcion) => opcion.valor === id) ?? null);
              campo.onChange(id ?? "");
            }}
          />
        )}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField control={control} name="profesionalId" etiqueta="Profesional" obligatorio>
          {({ control: accesible, campo }) => (
            <Selector
              {...accesible} ref={campo.ref} onBlur={campo.onBlur} valor={campo.value}
              opciones={profesionales} disabled={formState.isSubmitting}
              alCambiar={(valor) => { campo.onChange(valor); reiniciarHorario(); }}
            />
          )}
        </FormField>
        <FormField control={control} name="prestacionId" etiqueta="Prestación" obligatorio>
          {({ control: accesible, campo }) => (
            <Selector
              {...accesible} ref={campo.ref} onBlur={campo.onBlur} valor={campo.value}
              opciones={prestaciones} disabled={formState.isSubmitting}
              alCambiar={(valor) => { campo.onChange(valor); reiniciarHorario(); }}
            />
          )}
        </FormField>
        <FormField control={control} name="sillonId" etiqueta="Sillón" ayuda="Se verifica al confirmar." obligatorio>
          {({ control: accesible, campo }) => (
            <Selector
              {...accesible} ref={campo.ref} onBlur={campo.onBlur} valor={campo.value}
              opciones={sillones} disabled={formState.isSubmitting}
              alCambiar={(valor) => { campo.onChange(valor); clearErrors("root"); }}
            />
          )}
        </FormField>
        <FormField control={control} name="fecha" etiqueta="Fecha" obligatorio>
          {({ control: accesible, campo }) => (
            <SelectorFecha
              {...accesible} ref={campo.ref} onBlur={campo.onBlur} valor={campo.value}
              min={fechaInicial} disabled={formState.isSubmitting}
              alCambiar={(valor) => {
                if (valor === campo.value) return;
                campo.onChange(valor);
                reiniciarHorario();
              }}
            />
          )}
        </FormField>
      </div>
      <FormField control={control} name="hora" etiqueta="Horarios del profesional" ayuda={detalleHorario} obligatorio>
        {({ control: accesible, campo }) => (
          <Selector
            {...accesible} ref={campo.ref} onBlur={campo.onBlur} valor={campo.value} alCambiar={campo.onChange}
            opciones={horarios.map((h) => ({ valor: h, etiqueta: h }))}
            placeholder={claveHorarios ? "Elegí un horario" : "Elegí profesional, prestación y fecha"}
            cargando={cargandoHorarios} disabled={!horarios.length || formState.isSubmitting}
          />
        )}
      </FormField>
      {resultadoHorarios?.ok && !horarios.length ? <p className="help" role="status">No hay horarios disponibles para esa fecha.</p> : null}
      {resultadoHorarios && !resultadoHorarios.ok ? <p className="help" role="alert">{resultadoHorarios.error}</p> : null}
      {formState.errors.root?.message ? <p className="help" role="alert">{formState.errors.root.message}</p> : null}
      <div className="flex justify-end">
        <Boton type="submit" disabled={!hora} cargando={formState.isSubmitting}>Confirmar turno</Boton>
      </div>
    </form>
  );
}
