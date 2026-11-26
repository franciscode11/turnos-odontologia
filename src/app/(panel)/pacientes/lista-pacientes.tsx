"use client";

import { useEffect, useState } from "react";
import {
  Boton,
  CeldaPersona,
  CerrarDialogo,
  CuerpoPagina,
  Dialogo,
  EncabezadoPagina,
  Entrada,
  Tabla,
  TablaCelda,
  TablaCeldaEncabezado,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TablaVacia,
  useToast,
} from "@/components/ui";
import type { Paciente, PaginaPacientes } from "@/domain/pacientes/tipos";
import { buscarPacientes, darDeBajaPaciente } from "@/server/pacientes/acciones";
import type { Resultado } from "@/server/resultado";
import { programarBusqueda } from "./busqueda";
import { FormularioPacienteDialogo } from "./formulario-paciente";

type Solicitud = { consulta: string; pagina: number; espera?: number };
type Lectura = { solicitud: Solicitud | null; resultado: Resultado<PaginaPacientes> };
type Props = { inicial: Resultado<PaginaPacientes>; puedeEditar: boolean };

export function ListaPacientes({ inicial, puedeEditar }: Props) {
  const toast = useToast();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [lectura, setLectura] = useState<Lectura>({ solicitud: null, resultado: inicial });
  const [formulario, setFormulario] = useState<{ paciente: Paciente | null } | null>(null);
  const [paraBaja, setParaBaja] = useState<Paciente | null>(null);
  const [aplicandoBaja, setAplicandoBaja] = useState(false);
  const [errorBaja, setErrorBaja] = useState("");

  useEffect(() => {
    if (!solicitud) return;
    return programarBusqueda(
      () => buscarPacientes({ consulta: solicitud.consulta, pagina: solicitud.pagina }),
      (resultado) => setLectura({ solicitud, resultado }),
      () => setLectura({ solicitud, resultado: { ok: false, error: "No se pudo consultar el listado." } }),
      solicitud.espera,
    );
  }, [solicitud]);

  const consulta = solicitud?.consulta ?? "";
  const cargando = lectura.solicitud !== solicitud;
  const { resultado } = lectura;
  const datos = resultado.ok ? resultado.data : null;
  const pagina = datos?.pagina ?? solicitud?.pagina ?? 1;
  const columnas = puedeEditar ? 5 : 4;

  function consultarPagina(nuevaPagina: number) {
    setSolicitud({ consulta, pagina: nuevaPagina, espera: 0 });
  }

  function abrirBaja(paciente: Paciente) {
    setErrorBaja("");
    setParaBaja(paciente);
  }

  async function confirmarBaja() {
    if (!paraBaja || aplicandoBaja) return;
    setAplicandoBaja(true);
    setErrorBaja("");
    try {
      const respuesta = await darDeBajaPaciente(paraBaja.id);
      if (!respuesta.ok) {
        setErrorBaja(respuesta.error);
        return;
      }
      setParaBaja(null);
      toast.exito("Paciente dado de baja");
      consultarPagina(pagina);
    } catch {
      setErrorBaja("No se pudo dar de baja al paciente. Volvé a intentar.");
    } finally {
      setAplicandoBaja(false);
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Pacientes"
        descripcion="Buscá pacientes por apellido o DNI."
        acciones={puedeEditar ? (
          <Boton tamano="sm" icono="plus" onClick={() => setFormulario({ paciente: null })}>
            Nuevo paciente
          </Boton>
        ) : null}
      />
      <CuerpoPagina>
        <div className="stack gap-4" aria-busy={cargando}>
          <Entrada
            tipo="search"
            aria-label="Buscar por apellido o DNI"
            placeholder="Buscar por apellido o DNI"
            value={consulta}
            onChange={(evento) => setSolicitud({ consulta: evento.target.value, pagina: 1 })}
            alLimpiar={() => setSolicitud({ consulta: "", pagina: 1 })}
          />
          <Tabla titulo="Listado de pacientes">
            <TablaEncabezado>
              <TablaFila>
                <TablaCeldaEncabezado>Paciente</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>DNI</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Teléfono</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Obra social</TablaCeldaEncabezado>
                {puedeEditar ? <TablaCeldaEncabezado>Acciones</TablaCeldaEncabezado> : null}
              </TablaFila>
            </TablaEncabezado>
            <TablaCuerpo>
              {cargando ? <TablaVacia columnas={columnas} titulo="Buscando pacientes…" /> : null}
              {!cargando && !resultado.ok ? (
                <TablaVacia
                  columnas={columnas}
                  titulo="No se pudo cargar el listado"
                  descripcion={resultado.error}
                  accion={<Boton variante="secundario" onClick={() => consultarPagina(pagina)}>Reintentar</Boton>}
                />
              ) : null}
              {!cargando && datos?.pacientes.length === 0 ? (
                <TablaVacia columnas={columnas} titulo={consulta.trim() ? "No se encontraron pacientes" : "No hay pacientes activos"} />
              ) : null}
              {!cargando ? datos?.pacientes.map((paciente) => (
                <TablaFila key={paciente.id}>
                  <TablaCelda>
                    <CeldaPersona nombre={`${paciente.apellido}, ${paciente.nombre}`} avatar={paciente.avatar} />
                  </TablaCelda>
                  <TablaCelda className="mono">{paciente.dni}</TablaCelda>
                  <TablaCelda>{paciente.telefono}</TablaCelda>
                  <TablaCelda>{paciente.obraSocial ?? "—"}</TablaCelda>
                  {puedeEditar ? (
                    <TablaCelda>
                      <div className="row">
                        <Boton
                          variante="fantasma" tamano="sm" icono="pencil"
                          aria-label={`Editar paciente ${paciente.nombre} ${paciente.apellido}`}
                          onClick={() => setFormulario({ paciente })}
                        >
                          Editar
                        </Boton>
                        <Boton variante="peligro-fantasma" tamano="sm" onClick={() => abrirBaja(paciente)}>
                          Dar de baja
                        </Boton>
                      </div>
                    </TablaCelda>
                  ) : null}
                </TablaFila>
              )) : null}
            </TablaCuerpo>
          </Tabla>
          {datos && datos.paginas > 1 ? (
            <nav className="row justify-end" aria-label="Páginas del listado de pacientes">
              <Boton variante="secundario" tamano="sm" disabled={cargando || pagina <= 1} onClick={() => consultarPagina(pagina - 1)}>
                Anterior
              </Boton>
              <span aria-live="polite">Página {pagina} de {datos.paginas}</span>
              <Boton variante="secundario" tamano="sm" disabled={cargando || pagina >= datos.paginas} onClick={() => consultarPagina(pagina + 1)}>
                Siguiente
              </Boton>
            </nav>
          ) : null}
        </div>
      </CuerpoPagina>

      {puedeEditar && formulario ? (
        <FormularioPacienteDialogo
          paciente={formulario.paciente}
          alCerrar={() => setFormulario(null)}
          alGuardar={() => { setFormulario(null); consultarPagina(pagina); }}
        />
      ) : null}
      {puedeEditar && paraBaja ? (
        <Dialogo
          abierto
          alCambiarAbierto={(abierto) => { if (!abierto && !aplicandoBaja) setParaBaja(null); }}
          titulo={`¿Dar de baja a ${paraBaja.nombre} ${paraBaja.apellido}?`}
          descripcion="Sus turnos anteriores se conservan. El paciente dejará de aparecer para nuevas reservas."
          acciones={(
            <>
              <CerrarDialogo>
                <Boton variante="fantasma" disabled={aplicandoBaja}>Cancelar</Boton>
              </CerrarDialogo>
              <Boton variante="peligro" cargando={aplicandoBaja} onClick={() => void confirmarBaja()}>
                Confirmar baja
              </Boton>
            </>
          )}
        >
          {errorBaja ? <p role="alert">{errorBaja}</p> : null}
        </Dialogo>
      ) : null}
    </>
  );
}
