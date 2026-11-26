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
import { esquemaSillon, type DatosSillon, type FormularioSillon } from "@/domain/catalogo/esquemas";
import type { Sillon } from "@/domain/catalogo/tipos";
import { cambiarActivoSillon, crearSillon, editarSillon } from "@/server/catalogo/acciones";

type Props = { sillones: Sillon[]; puedeEditar: boolean };

export function ListaSillones({ sillones, puedeEditar }: Props) {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Sillon | null>(null);

  const form = useForm<FormularioSillon, unknown, DatosSillon>({
    resolver: zodResolver(esquemaSillon),
    defaultValues: { nombre: "" },
  });

  function abrir(sillon: Sillon | null) {
    setEditando(sillon);
    form.reset({ nombre: sillon?.nombre ?? "" });
    setAbierto(true);
  }

  async function guardar(datos: DatosSillon) {
    const resultado = editando ? await editarSillon(editando.id, datos) : await crearSillon(datos);
    if (!resultado.ok) {
      for (const [campo, mensajes] of Object.entries(resultado.campos ?? {})) {
        form.setError(campo as keyof FormularioSillon, { message: mensajes[0] });
      }
      toast.error("No se pudo guardar el sillón", resultado.error);
      return;
    }
    toast.exito(editando ? "Sillón actualizado" : "Sillón creado", resultado.data.nombre);
    setAbierto(false);
  }

  async function cambiarActivo(sillon: Sillon, activo: boolean) {
    const resultado = await cambiarActivoSillon(sillon.id, activo);
    if (!resultado.ok) toast.error("No se pudo cambiar el estado", resultado.error);
    else toast.exito(activo ? "Sillón activado" : "Sillón desactivado", sillon.nombre);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Sillones"
        descripcion="Sillones y boxes donde se atiende. Un sillón inactivo no se ofrece para turnos nuevos."
        acciones={
          puedeEditar ? (
            <Boton variante="primario" tamano="sm" icono="plus" onClick={() => abrir(null)}>
              Nuevo sillón
            </Boton>
          ) : null
        }
      />
      <CuerpoPagina>
        <Tabla titulo="Sillones del consultorio">
          <TablaEncabezado>
            <TablaFila>
              <TablaCeldaEncabezado>Nombre</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Estado</TablaCeldaEncabezado>
              {puedeEditar ? <TablaCeldaEncabezado aria-label="Acciones" /> : null}
            </TablaFila>
          </TablaEncabezado>
          <TablaCuerpo>
            {sillones.length === 0 ? (
              <TablaVacia columnas={puedeEditar ? 3 : 2} titulo="Todavía no hay sillones" />
            ) : (
              sillones.map((s) => (
                <TablaFila key={s.id}>
                  <TablaCelda destacada>{s.nombre}</TablaCelda>
                  <TablaCelda>
                    {puedeEditar ? (
                      <Interruptor
                        aria-label={`Sillón ${s.nombre} activo`}
                        activo={s.activo}
                        alCambiar={(activo) => void cambiarActivo(s, activo)}
                      />
                    ) : (
                      <Etiqueta>{s.activo ? "Activo" : "Inactivo"}</Etiqueta>
                    )}
                  </TablaCelda>
                  {puedeEditar ? (
                    <TablaCelda>
                      <Boton variante="fantasma" tamano="sm" icono="pencil" onClick={() => abrir(s)}>
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
        <Dialogo abierto={abierto} alCambiarAbierto={setAbierto} titulo={editando ? "Editar sillón" : "Nuevo sillón"}>
          <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
            <FormField control={form.control} name="nombre" etiqueta="Nombre" obligatorio ayuda="Único en el consultorio.">
              {({ control, campo }) => <Entrada {...control} {...campo} placeholder="Box 1" />}
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
