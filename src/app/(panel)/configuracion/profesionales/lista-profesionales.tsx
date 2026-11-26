"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Boton,
  CerrarDialogo,
  CuerpoPagina,
  Dialogo,
  EncabezadoPagina,
  Entrada,
  Etiqueta,
  FormField,
  Interruptor,
  Tabla,
  TablaCelda,
  TablaCeldaEncabezado,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TablaVacia,
  useToast,
} from "@/components/ui";
import { esquemaProfesional, type DatosProfesional, type FormularioProfesional } from "@/domain/catalogo/esquemas";
import type { Profesional } from "@/domain/catalogo/tipos";
import { cambiarActivoProfesional, crearProfesional, editarProfesional } from "@/server/catalogo/acciones";

type Props = { profesionales: Profesional[]; puedeEditar: boolean };

const VACIO: FormularioProfesional = { nombre: "", apellido: "", matricula: "", especialidad: "" };

export function ListaProfesionales({ profesionales, puedeEditar }: Props) {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);

  const form = useForm<FormularioProfesional, unknown, DatosProfesional>({
    resolver: zodResolver(esquemaProfesional),
    defaultValues: VACIO,
  });

  function abrir(profesional: Profesional | null) {
    setEditando(profesional);
    form.reset(
      profesional
        ? {
            nombre: profesional.nombre,
            apellido: profesional.apellido,
            matricula: profesional.matricula,
            especialidad: profesional.especialidad ?? "",
          }
        : VACIO,
    );
    setAbierto(true);
  }

  async function guardar(datos: DatosProfesional) {
    const resultado = editando ? await editarProfesional(editando.id, datos) : await crearProfesional(datos);
    if (!resultado.ok) {
      for (const [campo, mensajes] of Object.entries(resultado.campos ?? {})) {
        form.setError(campo as keyof FormularioProfesional, { message: mensajes[0] });
      }
      toast.error("No se pudo guardar el profesional", resultado.error);
      return;
    }
    toast.exito(editando ? "Profesional actualizado" : "Profesional creado", `${resultado.data.nombre} ${resultado.data.apellido}`);
    setAbierto(false);
  }

  async function cambiarActivo(profesional: Profesional, activo: boolean) {
    const resultado = await cambiarActivoProfesional(profesional.id, activo);
    if (!resultado.ok) toast.error("No se pudo cambiar el estado", resultado.error);
    else toast.exito(activo ? "Profesional activado" : "Profesional desactivado", `${profesional.nombre} ${profesional.apellido}`);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Profesionales"
        descripcion="Quiénes atienden en el consultorio. Un profesional inactivo no se ofrece para turnos nuevos."
        acciones={
          puedeEditar ? (
            <Boton variante="primario" tamano="sm" icono="plus" onClick={() => abrir(null)}>
              Nuevo profesional
            </Boton>
          ) : null
        }
      />
      <CuerpoPagina>
        <Tabla titulo="Profesionales del consultorio">
          <TablaEncabezado>
            <TablaFila>
              <TablaCeldaEncabezado>Profesional</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Matrícula</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Especialidad</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Estado</TablaCeldaEncabezado>
              {puedeEditar ? <TablaCeldaEncabezado aria-label="Acciones" /> : null}
            </TablaFila>
          </TablaEncabezado>
          <TablaCuerpo>
            {profesionales.length === 0 ? (
              <TablaVacia columnas={puedeEditar ? 5 : 4} icono="stethoscope" titulo="Todavía no hay profesionales" />
            ) : (
              profesionales.map((p) => (
                <TablaFila key={p.id}>
                  <TablaCelda destacada>
                    {p.apellido}, {p.nombre}
                  </TablaCelda>
                  <TablaCelda className="num">{p.matricula}</TablaCelda>
                  <TablaCelda apagada={!p.especialidad}>{p.especialidad ?? "—"}</TablaCelda>
                  <TablaCelda>
                    {puedeEditar ? (
                      <Interruptor
                        aria-label={`Profesional ${p.nombre} ${p.apellido} activo`}
                        activo={p.activo}
                        alCambiar={(activo) => void cambiarActivo(p, activo)}
                      />
                    ) : (
                      <Etiqueta>{p.activo ? "Activo" : "Inactivo"}</Etiqueta>
                    )}
                  </TablaCelda>
                  {puedeEditar ? (
                    <TablaCelda>
                      <Boton variante="fantasma" tamano="sm" icono="pencil" onClick={() => abrir(p)}>
                        Editar
                      </Boton>
                    </TablaCelda>
                  ) : null}
                </TablaFila>
              ))
            )}
          </TablaCuerpo>
        </Tabla>
      </CuerpoPagina>

      {puedeEditar ? (
        <Dialogo abierto={abierto} alCambiarAbierto={setAbierto} titulo={editando ? "Editar profesional" : "Nuevo profesional"}>
          <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
            <div className="grid g-2 gap-5">
              <FormField control={form.control} name="nombre" etiqueta="Nombre" obligatorio>
                {({ control, campo }) => <Entrada {...control} {...campo} />}
              </FormField>
              <FormField control={form.control} name="apellido" etiqueta="Apellido" obligatorio>
                {({ control, campo }) => <Entrada {...control} {...campo} />}
              </FormField>
            </div>
            <FormField control={form.control} name="matricula" etiqueta="Matrícula" obligatorio ayuda="Única. Se guarda en mayúsculas.">
              {({ control, campo }) => <Entrada {...control} {...campo} className="num" placeholder="MP-1234" />}
            </FormField>
            <FormField control={form.control} name="especialidad" etiqueta="Especialidad" opcional>
              {({ control, campo }) => <Entrada {...control} {...campo} value={campo.value ?? ""} />}
            </FormField>
            <div className="row justify-end">
              <CerrarDialogo>
                <Boton variante="fantasma" tamano="sm" type="button">
                  Cancelar
                </Boton>
              </CerrarDialogo>
              <Boton variante="primario" tamano="sm" type="submit" cargando={form.formState.isSubmitting}>
                Guardar
              </Boton>
            </div>
          </form>
        </Dialogo>
      ) : null}
    </>
  );
}
