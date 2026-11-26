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
  EntradaNumero,
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
import { esquemaPrestacion, type DatosPrestacion, type FormularioPrestacion } from "@/domain/catalogo/esquemas";
import { DURACION_MAXIMA, DURACION_MINIMA, PASO_DURACION } from "@/domain/catalogo/reglas";
import type { Prestacion } from "@/domain/catalogo/tipos";
import { cambiarActivoPrestacion, crearPrestacion, editarPrestacion } from "@/server/catalogo/acciones";

const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

type Props = { prestaciones: Prestacion[]; puedeEditar: boolean };

export function ListaPrestaciones({ prestaciones, puedeEditar }: Props) {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Prestacion | null>(null);

  const form = useForm<FormularioPrestacion, unknown, DatosPrestacion>({
    resolver: zodResolver(esquemaPrestacion),
    defaultValues: { nombre: "", duracionMinutos: 30, precioReferencia: null },
  });

  function abrir(prestacion: Prestacion | null) {
    setEditando(prestacion);
    form.reset(
      prestacion
        ? { nombre: prestacion.nombre, duracionMinutos: prestacion.duracionMinutos, precioReferencia: prestacion.precioReferencia }
        : { nombre: "", duracionMinutos: 30, precioReferencia: null },
    );
    setAbierto(true);
  }

  async function guardar(datos: DatosPrestacion) {
    const resultado = editando ? await editarPrestacion(editando.id, datos) : await crearPrestacion(datos);
    if (!resultado.ok) {
      for (const [campo, mensajes] of Object.entries(resultado.campos ?? {})) {
        form.setError(campo as keyof FormularioPrestacion, { message: mensajes[0] });
      }
      toast.error("No se pudo guardar la prestación", resultado.error);
      return;
    }
    toast.exito(editando ? "Prestación actualizada" : "Prestación creada", resultado.data.nombre);
    setAbierto(false);
  }

  async function cambiarActivo(prestacion: Prestacion, activo: boolean) {
    const resultado = await cambiarActivoPrestacion(prestacion.id, activo);
    if (!resultado.ok) toast.error("No se pudo cambiar el estado", resultado.error);
    else toast.exito(activo ? "Prestación activada" : "Prestación desactivada", prestacion.nombre);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Prestaciones"
        descripcion="Tratamientos con su duración. La duración fija la hora de fin del turno."
        acciones={
          puedeEditar ? (
            <Boton variante="primario" tamano="sm" icono="plus" onClick={() => abrir(null)}>
              Nueva prestación
            </Boton>
          ) : null
        }
      />
      <CuerpoPagina>
        <Tabla titulo="Prestaciones del consultorio">
          <TablaEncabezado>
            <TablaFila>
              <TablaCeldaEncabezado>Nombre</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Duración</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Precio de referencia</TablaCeldaEncabezado>
              <TablaCeldaEncabezado>Estado</TablaCeldaEncabezado>
              {puedeEditar ? <TablaCeldaEncabezado aria-label="Acciones" /> : null}
            </TablaFila>
          </TablaEncabezado>
          <TablaCuerpo>
            {prestaciones.length === 0 ? (
              <TablaVacia columnas={puedeEditar ? 5 : 4} icono="clipboard-list" titulo="Todavía no hay prestaciones" />
            ) : (
              prestaciones.map((p) => (
                <TablaFila key={p.id}>
                  <TablaCelda destacada>{p.nombre}</TablaCelda>
                  <TablaCelda className="num">{p.duracionMinutos} min</TablaCelda>
                  <TablaCelda className="num" apagada={p.precioReferencia === null}>
                    {p.precioReferencia === null ? "—" : formatoPrecio.format(p.precioReferencia)}
                  </TablaCelda>
                  <TablaCelda>
                    {puedeEditar ? (
                      <Interruptor
                        aria-label={`Prestación ${p.nombre} activa`}
                        activo={p.activo}
                        alCambiar={(activo) => void cambiarActivo(p, activo)}
                      />
                    ) : (
                      <Etiqueta>{p.activo ? "Activa" : "Inactiva"}</Etiqueta>
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
        <Dialogo
          abierto={abierto}
          alCambiarAbierto={setAbierto}
          titulo={editando ? "Editar prestación" : "Nueva prestación"}
          descripcion="Cambiar la duración no modifica los turnos ya creados."
        >
          <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
            <FormField control={form.control} name="nombre" etiqueta="Nombre" obligatorio>
              {({ control, campo }) => <Entrada {...control} {...campo} />}
            </FormField>
            <FormField
              control={form.control}
              name="duracionMinutos"
              etiqueta="Duración"
              obligatorio
              ayuda="Múltiplo de 5, entre 10 y 240 minutos."
            >
              {({ control, campo }) => (
                <EntradaNumero
                  {...control}
                  ref={campo.ref}
                  name={campo.name}
                  valor={campo.value}
                  alCambiar={campo.onChange}
                  onBlur={campo.onBlur}
                  min={DURACION_MINIMA}
                  max={DURACION_MAXIMA}
                  paso={PASO_DURACION}
                  unidad="minutos"
                />
              )}
            </FormField>
            <FormField control={form.control} name="precioReferencia" etiqueta="Precio de referencia" opcional>
              {({ control, campo }) => (
                <EntradaNumero
                  {...control}
                  ref={campo.ref}
                  name={campo.name}
                  valor={campo.value}
                  alCambiar={campo.onChange}
                  onBlur={campo.onBlur}
                  min={0}
                  paso={100}
                  unidad="ARS"
                />
              )}
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
