"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Boton, CerrarDialogo, Dialogo, Entrada, FormField, useToast } from "@/components/ui";
import { esquemaPaciente, type DatosPaciente, type FormularioPaciente } from "@/domain/pacientes/esquemas";
import type { Paciente } from "@/domain/pacientes/tipos";
import { crearPaciente, editarPaciente } from "@/server/pacientes/acciones";

const CAMPOS = [
  { name: "nombre", etiqueta: "Nombre", obligatorio: true },
  { name: "apellido", etiqueta: "Apellido", obligatorio: true },
  { name: "dni", etiqueta: "DNI", obligatorio: true, ayuda: "7 u 8 dígitos. Se aceptan puntos." },
  { name: "fechaNacimiento", etiqueta: "Fecha de nacimiento", obligatorio: true, ayuda: "Formato AAAA-MM-DD." },
  { name: "telefono", etiqueta: "Teléfono", obligatorio: true, tipo: "tel" },
  { name: "email", etiqueta: "Email", obligatorio: false, tipo: "email" },
  { name: "obraSocial", etiqueta: "Obra social", obligatorio: false },
  { name: "numeroAfiliado", etiqueta: "Número de afiliado", obligatorio: false },
] as const;

const validar = esquemaPaciente();

type Props = {
  paciente: Paciente | null;
  alCerrar: () => void;
  alGuardar: () => void;
};

export function FormularioPacienteDialogo({ paciente, alCerrar, alGuardar }: Props) {
  const toast = useToast();
  const form = useForm<FormularioPaciente, unknown, DatosPaciente>({
    resolver: zodResolver(validar),
    defaultValues: {
      nombre: paciente?.nombre ?? "",
      apellido: paciente?.apellido ?? "",
      dni: paciente?.dni ?? "",
      fechaNacimiento: paciente?.fechaNacimiento ?? "",
      telefono: paciente?.telefono ?? "",
      email: paciente?.email ?? "",
      obraSocial: paciente?.obraSocial ?? "",
      numeroAfiliado: paciente?.numeroAfiliado ?? "",
    },
  });
  const { isSubmitting, errors } = form.formState;

  async function guardar(datos: DatosPaciente) {
    form.clearErrors("root");
    try {
      const resultado = paciente ? await editarPaciente(paciente.id, datos) : await crearPaciente(datos);
      if (!resultado.ok) {
        for (const { name } of CAMPOS) {
          const mensaje = resultado.campos?.[name]?.[0];
          if (mensaje) form.setError(name, { message: mensaje });
        }
        form.setError("root", { message: resultado.error });
        return;
      }
      toast.exito(paciente ? "Paciente actualizado" : "Paciente registrado");
      alGuardar();
    } catch {
      form.setError("root", { message: "No se pudo guardar. Volvé a intentar." });
    }
  }

  return (
    <Dialogo
      abierto
      alCambiarAbierto={(abierto) => { if (!abierto && !isSubmitting) alCerrar(); }}
      titulo={paciente ? "Editar paciente" : "Nuevo paciente"}
    >
      <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CAMPOS.map((campo) => (
            <FormField
              key={campo.name}
              control={form.control}
              name={campo.name}
              etiqueta={campo.etiqueta}
              ayuda={"ayuda" in campo ? campo.ayuda : undefined}
              obligatorio={campo.obligatorio}
              opcional={!campo.obligatorio}
            >
              {({ control, campo: entrada }) => (
                <Entrada
                  {...control}
                  {...entrada}
                  tipo={"tipo" in campo ? campo.tipo : "text"}
                  value={entrada.value ?? ""}
                  disabled={isSubmitting}
                />
              )}
            </FormField>
          ))}
        </div>
        {errors.root?.message ? <p role="alert">{errors.root.message}</p> : null}
        <div className="row justify-end">
          <CerrarDialogo>
            <Boton variante="fantasma" tamano="sm" disabled={isSubmitting}>Cancelar</Boton>
          </CerrarDialogo>
          <Boton tamano="sm" type="submit" cargando={isSubmitting}>Guardar</Boton>
        </div>
      </form>
    </Dialogo>
  );
}
