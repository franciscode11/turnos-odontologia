"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AreaTexto, Avatar, AVATARES, BadgeEstado, Boton, Calendario, Campo, CampoOculto, Casilla, CeldaPersona, CerrarDialogo,
  Combobox, ControlSegmentado, Deslizador, Dialogo, Entrada, EntradaNumero, Esqueleto, EstadoVacio, Etiqueta, FormField,
  GrupoRadio, Interruptor, ListaHorarios, ProveedorToast, ProveedorTooltip, Selector, SelectorColor, SelectorFecha,
  SelectorFechaHora, SelectorHora, SelectorMes, SelectorMultiple, SelectorSemana, Tabla, TablaCelda,
  TablaCeldaEncabezado, TablaCuerpo, TablaEncabezado, TablaFila, TablaVacia, Tarjeta, ToastEstatico, Tooltip,
  ZonaArchivos, instanteDeFechaHora, useToast, type ColorAgenda, type EstadoCasilla, type GrupoOpciones, type Opcion,
} from "@/components/ui";
import type { EstadoTurno } from "@/domain/shared/estados";

/* Datos ficticios: pacientes, DNI y teléfonos inventados. El personal usa los nombres del equipo (DD-17). */
const PRESTACIONES: GrupoOpciones[] = [
  { grupo: "Generales", opciones: [{ valor: "consulta", etiqueta: "Consulta", meta: "30 min" }, { valor: "limpieza", etiqueta: "Limpieza", meta: "30 min" }] },
  {
    grupo: "Cirugía",
    opciones: [
      { valor: "extraccion", etiqueta: "Extracción", meta: "60 min" },
      { valor: "implante", etiqueta: "Implante, inactiva", meta: "120 min", deshabilitada: true },
    ],
  },
];
const SILLONES: Opcion[] = [
  { valor: "s1", etiqueta: "Sillón 1" },
  { valor: "s2", etiqueta: "Sillón 2" },
  { valor: "s3", etiqueta: "Sillón 3" },
  { valor: "s4", etiqueta: "Sillón 4, en reparación", deshabilitada: true },
];
const PACIENTES: Opcion[] = [
  { valor: "p1", etiqueta: "Gaitán, Rocío", meta: "31.482.907" },
  { valor: "p2", etiqueta: "Gaido, Marcelo", meta: "27.903.115" },
  { valor: "p3", etiqueta: "Sosa, Martina", meta: "38.114.260" },
  { valor: "p4", etiqueta: "Zabala, Ignacio", meta: "40.118.552" },
  { valor: "p5", etiqueta: "Molina, Agustina", meta: "33.690.024" },
];
const PROFESIONALES: Opcion[] = [
  { valor: "cortez", etiqueta: "Dr. Joaquín Cortez", meta: "MP 4471" },
  { valor: "coninck", etiqueta: "Dr. Lautaro de Coninck", meta: "MP 5120" },
  { valor: "echenagorria", etiqueta: "Dr. Joaquín Echenagorria", meta: "MP 3982" },
];
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;
/** Sábado o domingo ("AAAA-MM-DD", calendario puro sin zona horaria). */
const finDeSemana = (f: string) => {
  const [a = 0, m = 1, d = 1] = f.split("-").map(Number);
  const dia = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return dia === 0 || dia === 6;
};

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section className="section">
      <h2 className="section-title">{titulo}</h2>
      {descripcion ? <p className="section-desc">{descripcion}</p> : null}
      {children}
    </section>
  );
}

/** Proveedores de toasts y tooltips (si el layout ya los tiene, no se duplican los toasts). */
export function ProveedoresCatalogo({ children }: { children: ReactNode }) {
  return (
    <ProveedorToast>
      <ProveedorTooltip>{children}</ProveedorTooltip>
    </ProveedorToast>
  );
}

/* ============================== Reacción ============================== */

export function SeccionReaccion() {
  const toast = useToast();
  const [lento, setLento] = useState(false);
  const [rapido, setRapido] = useState(false);
  const probar = (ms: number, fijar: (v: boolean) => void) => {
    fijar(true);
    setTimeout(() => {
      fijar(false);
      toast.exito("Turno creado", "Martina Sosa, mié 25/11 10:30");
    }, ms);
  };
  return (
    <div className="row mt-4">
      <Boton cargando={lento} onClick={() => probar(900, setLento)}>{lento ? "Guardando" : "Probar guardado lento"}</Boton>
      <Boton variante="secundario" cargando={rapido} onClick={() => probar(90, setRapido)}>Probar guardado rápido</Boton>
      <span className="help">El rápido no muestra spinner: responde antes de 150 ms.</span>
    </div>
  );
}

/* ============================== Botones ============================== */

export function SeccionBotones() {
  return (
    <Seccion titulo="Botones" descripcion="Una acción primaria por pantalla. Textos de una a tres palabras, siempre en una línea.">
      <div className="row">
        <Boton icono="plus">Nuevo turno</Boton>
        <Boton variante="secundario">Exportar</Boton>
        <Boton variante="fantasma">Limpiar</Boton>
        <Boton variante="peligro">Cancelar turno</Boton>
        <Boton variante="peligro-fantasma">Dar de baja</Boton>
        <Boton cargando>Guardando</Boton>
        <Tooltip texto="Editar">
          <Boton variante="secundario" icono="pencil" etiqueta="Editar" />
        </Tooltip>
        <Boton variante="secundario" tamano="sm">Chico</Boton>
        <Boton disabled>Deshabilitado</Boton>
      </div>
      <p className="help mt-2">El botón de editar muestra un tooltip a los 400 ms (con mouse o con foco de teclado).</p>
    </Seccion>
  );
}

/* ============================== Toasts ============================== */

export function SeccionToasts() {
  const toast = useToast();
  return (
    <Seccion titulo="Toasts" descripcion="Mismo lenguaje que los estados. Aparecen abajo a la derecha, se apilan y se pausan con el mouse o el foco.">
      <div className="grid g-2">
        <div className="stack items-start gap-2">
          <ToastEstatico variante="exito" titulo="Turno creado" detalle="Martina Sosa, 10:30" />
          <ToastEstatico variante="error" titulo="El sillón ya está ocupado" detalle="Sillón 1, 10:30-11:00" />
          <ToastEstatico variante="aviso" titulo="Turno marcado ausente" detalle="Ignacio Zabala" />
          <ToastEstatico variante="info" titulo="Horario liberado" detalle="Se canceló el turno de las 9:30" />
        </div>
        <div className="row content-start">
          <Boton variante="secundario" tamano="sm" onClick={() => toast.exito("Turno creado", "Rocío Gaitán, 11:00")}>Éxito</Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => toast.error("El profesional ya tiene un turno", "10:00-10:30")}>Error</Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => toast.aviso("Turno marcado ausente", "Ignacio Zabala")}>Aviso</Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => toast.info("Horario liberado", "Lunes 9:30")}>Info</Boton>
        </div>
      </div>
    </Seccion>
  );
}

/* ============================== Texto ============================== */

export function SeccionTexto() {
  const [busqueda, setBusqueda] = useState("Gait");
  return (
    <Seccion titulo="Campos de texto" descripcion="Etiqueta arriba, ayuda o error abajo. El placeholder nunca reemplaza a la etiqueta.">
      <div className="grid g-3">
        <Campo etiqueta="Apellido" obligatorio ayuda="Como figura en el DNI.">
          {(p) => <Entrada {...p} defaultValue="Gaitán" />}
        </Campo>
        <Campo etiqueta="Email" opcional>
          {(p) => <Entrada {...p} tipo="email" placeholder="nombre@example.com" />}
        </Campo>
        <Campo etiqueta="DNI" obligatorio error="Ya existe un paciente con ese DNI">
          {(p) => <Entrada {...p} className="mono" defaultValue="31.482.907" />}
        </Campo>
        <Campo etiqueta="Contraseña">
          {(p) => <Entrada {...p} tipo="password" defaultValue="turnos-2026" autoComplete="off" />}
        </Campo>
        <Campo etiqueta="Teléfono" obligatorio>
          {(p) => (
            <div className="addon">
              <span>+54</span>
              <Entrada {...p} tipo="tel" className="num flex-1" defaultValue="261 486 2093" />
            </div>
          )}
        </Campo>
        <Campo etiqueta="Sitio web (url)" opcional>
          {(p) => (
            <div className="addon">
              <span>https://</span>
              <Entrada {...p} tipo="url" className="flex-1" placeholder="consultorio.example.com" />
            </div>
          )}
        </Campo>
        <Campo etiqueta="Buscar paciente" ayuda="Por apellido o DNI. Con botón para limpiar.">
          {(p) => <Entrada {...p} tipo="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} alLimpiar={() => setBusqueda("")} />}
        </Campo>
        <Campo etiqueta="Matrícula" ayuda="Deshabilitado.">
          {(p) => <Entrada {...p} className="mono" defaultValue="MP 4471" disabled />}
        </Campo>
        <Campo etiqueta="Motivo de cancelación" obligatorio>
          {(p) => <AreaTexto {...p} placeholder="Por ejemplo, avisó que no puede venir" />}
        </Campo>
        <Campo etiqueta="Observaciones" error="Escribí al menos 10 caracteres">
          {(p) => <AreaTexto {...p} defaultValue="Dolor" />}
        </Campo>
        <Campo etiqueta="Notas internas" ayuda="Deshabilitado.">
          {(p) => <AreaTexto {...p} defaultValue="Paciente con turno fijo los lunes." disabled />}
        </Campo>
        <Campo etiqueta="Obra social" ayuda="Cargando.">
          {() => <Esqueleto alto={36} />}
        </Campo>
      </div>
    </Seccion>
  );
}

/* ============================== Números y rangos ============================== */

export function SeccionNumeros() {
  const [duracion, setDuracion] = useState<number | null>(45);
  const [paso, setPaso] = useState(15);
  return (
    <Seccion titulo="Números y rangos">
      <div className="grid g-3">
        <Campo etiqueta="Duración" opcional ayuda="Múltiplo de 5, entre 10 y 240 minutos.">
          {(p) => <EntradaNumero {...p} valor={duracion} alCambiar={setDuracion} min={10} max={240} paso={5} unidad="minutos" />}
        </Campo>
        <Campo etiqueta="Precio de referencia" opcional>
          {(p) => (
            <div className="addon">
              <span>$</span>
              <Entrada {...p} className="num flex-1" defaultValue="38.500" inputMode="numeric" />
            </div>
          )}
        </Campo>
        <Campo etiqueta={<>Paso de la agenda<span className="opt num">{paso} min</span></>}>
          {(p) => <Deslizador {...p} aria-label="Paso de la agenda" valor={paso} alCambiar={setPaso} min={5} max={60} paso={5} textoValor={(v) => `${v} minutos`} mostrarEscala />}
        </Campo>
        <Campo etiqueta="Sobreturnos por día" error="Debe ser entre 0 y 4">
          {(p) => <EntradaNumero {...p} valor={6} alCambiar={() => undefined} min={0} paso={1} />}
        </Campo>
        <Campo etiqueta="Duración (deshabilitado)">
          {(p) => <EntradaNumero {...p} valor={30} alCambiar={() => undefined} disabled />}
        </Campo>
        <Campo etiqueta="Rango (deshabilitado)">
          {(p) => <Deslizador {...p} aria-label="Rango deshabilitado" valor={30} alCambiar={() => undefined} min={5} max={60} disabled mostrarEscala />}
        </Campo>
      </div>
    </Seccion>
  );
}

/* ============================== Fecha y hora ============================== */

export function SeccionFechas() {
  const [fecha, setFecha] = useState<string | null>("2026-11-25");
  const [hora, setHora] = useState<string | null>("10:30");
  const [fechaHora, setFechaHora] = useState<string | null>(null);
  const [mes, setMes] = useState<string | null>("2026-11");
  const [semana, setSemana] = useState<string | null>("2026-W48");
  const instante = fechaHora ? instanteDeFechaHora(fechaHora) : null;
  return (
    <Seccion titulo="Fecha y hora" descripcion="Selectores propios, iguales en todos los navegadores y en hora de Argentina. Lo ocupado o bloqueado aparece tachado. Se manejan solo con teclado: Enter abre, flechas recorren, Enter elige, Escape cierra.">
      <div className="grid g-3">
        <div className="stack gap-6">
          <Campo etiqueta="Fecha (date)" ayuda="Sábados y domingos sin atención.">
            {(p) => <SelectorFecha {...p} valor={fecha} alCambiar={setFecha} deshabilitarFecha={finDeSemana} />}
          </Campo>
          <div className="popover inline w-fit">
            <Calendario seleccionada={fecha} alElegir={setFecha} deshabilitarFecha={finDeSemana} />
          </div>
        </div>
        <div className="stack gap-6">
          <Campo etiqueta="Hora (time)" ayuda="Cada 15 minutos.">
            {(p) => <SelectorHora {...p} valor={hora} alCambiar={setHora} ocupadas={["09:30", "11:30"]} />}
          </Campo>
          <div className="popover inline ui-hora">
            <ListaHorarios valor={hora} alElegir={setHora} desde="09:00" hasta="12:30" paso={30} ocupadas={["09:30", "11:30"]} />
          </div>
          <Campo
            etiqueta="Fecha y hora (datetime-local)"
            ayuda={instante ? <>Se guarda en UTC: <span className="mono">{instante.toISOString()}</span></> : "Elegí 25/11/2026 09:30 solo con el teclado."}
          >
            {(p) => <SelectorFechaHora {...p} valor={fechaHora} alCambiar={setFechaHora} deshabilitarFecha={finDeSemana} />}
          </Campo>
        </div>
        <div className="stack gap-6">
          <Campo etiqueta="Mes (month)">
            {(p) => <SelectorMes {...p} valor={mes} alCambiar={setMes} />}
          </Campo>
          <Campo etiqueta="Semana (week)">
            {(p) => <SelectorSemana {...p} valor={semana} alCambiar={setSemana} />}
          </Campo>
          <Campo etiqueta="Fecha del turno" obligatorio error="Elegí una fecha">
            {(p) => <SelectorFecha {...p} valor={null} alCambiar={() => undefined} />}
          </Campo>
          <Campo etiqueta="Hora (deshabilitado)">
            {(p) => <SelectorHora {...p} valor="09:00" alCambiar={() => undefined} disabled />}
          </Campo>
          <Campo etiqueta="Agenda" ayuda="Cargando.">
            {() => <Esqueleto alto={36} />}
          </Campo>
        </div>
      </div>
    </Seccion>
  );
}

/* ============================== Selección ============================== */

export function SeccionSeleccion() {
  const [prestacion, setPrestacion] = useState<string | null>("limpieza");
  const [sillones, setSillones] = useState<string[]>(["s1", "s3"]);
  const [paciente, setPaciente] = useState<string | null>(null);
  const [dias, setDias] = useState<Record<string, boolean>>({ Lunes: true });
  const [vista, setVista] = useState("profesional");
  const [activa, setActiva] = useState(true);
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("dia");
  const marcados = DIAS.filter((d) => dias[d]).length;
  const todos: EstadoCasilla = marcados === 0 ? false : marcados === DIAS.length ? true : "mixto";

  return (
    <Seccion titulo="Selección" descripcion="Teclado: flechas recorren, Enter elige, Escape cierra.">
      <div className="grid g-3">
        <div className="stack gap-6">
          <Campo etiqueta="Prestación (select con grupos)">
            {(p) => <Selector {...p} opciones={PRESTACIONES} valor={prestacion} alCambiar={setPrestacion} />}
          </Campo>
          <Campo etiqueta="Profesional" obligatorio error="Elegí un profesional">
            {(p) => <Selector {...p} opciones={PROFESIONALES} valor={null} alCambiar={() => undefined} placeholder="Elegí un profesional" />}
          </Campo>
          <Campo etiqueta="Sillón (deshabilitado)">
            {(p) => <Selector {...p} opciones={SILLONES} valor="s2" disabled />}
          </Campo>
          <Campo etiqueta="Prestaciones del profesional" ayuda="Cargando opciones.">
            {(p) => <Selector {...p} opciones={[]} valor={null} cargando />}
          </Campo>
        </div>
        <div className="stack gap-6">
          <Campo etiqueta="Sillones (select múltiple)">
            {(p) => <SelectorMultiple {...p} aria-label="Sillones" opciones={SILLONES} valor={sillones} alCambiar={setSillones} />}
          </Campo>
          <Campo etiqueta="Sillones habilitados" error="Elegí al menos un sillón">
            {(p) => <SelectorMultiple {...p} aria-label="Sillones habilitados" opciones={SILLONES} valor={[]} alCambiar={() => undefined} />}
          </Campo>
          <Campo etiqueta="Paciente (combobox, reemplaza datalist)" ayuda="Escribí parte del apellido o del DNI.">
            {(p) => <Combobox {...p} opciones={PACIENTES} valor={paciente} alCambiar={setPaciente} placeholder="Buscar paciente" />}
          </Campo>
          <Campo etiqueta="Paciente (deshabilitado)">
            {(p) => <Combobox {...p} opciones={PACIENTES} valor="p3" alCambiar={() => undefined} disabled />}
          </Campo>
          <Campo etiqueta="Paciente (buscando)">
            {(p) => <Combobox {...p} opciones={[]} filtrar={false} valor={null} alCambiar={() => undefined} cargando placeholder="Escribí para buscar" />}
          </Campo>
        </div>
        <div className="stack gap-5">
          <Campo etiqueta="Días de atención (checkbox)">
            {() => (
              <div className="stack gap-2.5" role="group" aria-label="Días de atención">
                <Casilla etiqueta="Toda la semana" marcada={todos} alCambiar={(v) => setDias(Object.fromEntries(DIAS.map((d) => [d, v])))} />
                {DIAS.map((d) => (
                  <Casilla key={d} etiqueta={d} marcada={Boolean(dias[d])} alCambiar={(v) => setDias((x) => ({ ...x, [d]: v }))} />
                ))}
                <Casilla etiqueta="Sábado" descripcion="Deshabilitado." marcada={false} disabled />
              </div>
            )}
          </Campo>
          <Campo etiqueta="Acepto el consentimiento" error="Tenés que aceptar para continuar">
            {(p) => <Casilla {...p} etiqueta="Leí y acepto" marcada={false} />}
          </Campo>
          <Campo etiqueta="Vista (radio)">
            {(p) => (
              <GrupoRadio
                {...p}
                aria-label="Vista"
                valor={vista}
                alCambiar={setVista}
                opciones={[
                  { valor: "profesional", etiqueta: "Por profesional" },
                  { valor: "sillon", etiqueta: "Por sillón" },
                  { valor: "paciente", etiqueta: "Por paciente", descripcion: "Deshabilitado.", deshabilitada: true },
                ]}
              />
            )}
          </Campo>
          <Interruptor etiqueta="Prestación activa" descripcion="Se ofrece en turnos nuevos." activo={activa} alCambiar={setActiva} />
          <Interruptor etiqueta="Recordatorio por email" descripcion="Deshabilitado." activo={false} disabled />
          <ControlSegmentado
            etiqueta="Período"
            valor={periodo}
            alCambiar={setPeriodo}
            opciones={[{ valor: "dia", etiqueta: "Día" }, { valor: "semana", etiqueta: "Semana" }, { valor: "mes", etiqueta: "Mes" }]}
          />
          <ControlSegmentado etiqueta="Período (deshabilitado)" valor="dia" alCambiar={() => undefined} disabled opciones={[{ valor: "dia", etiqueta: "Día" }, { valor: "semana", etiqueta: "Semana" }]} />
        </div>
      </div>
    </Seccion>
  );
}

/* ============================== Archivos, color y oculto ============================== */

export function SeccionArchivos() {
  const [archivos, setArchivos] = useState<File[]>(() => [new File([new Uint8Array(1_887_437)], "consentimiento.pdf", { type: "application/pdf" })]);
  const [error, setError] = useState<string | undefined>();
  const [color, setColor] = useState<ColorAgenda | null>("verde-azulado");
  return (
    <Seccion titulo="Archivos, color y campo oculto">
      <div className="grid g-3">
        <div className="stack gap-6">
          <Campo etiqueta="Adjunto (file)" error={error}>
            {(p) => (
              <ZonaArchivos
                {...p}
                archivos={archivos}
                alCambiar={(a) => {
                  setArchivos(a);
                  setError(undefined);
                }}
                alRechazar={setError}
                aceptar="application/pdf,image/*"
                maximoMb={5}
                ayuda="PDF o imagen, hasta 5 MB."
                progreso={{ "consentimiento.pdf": 66 }}
              />
            )}
          </Campo>
          <Campo etiqueta="Estudios (deshabilitado)">
            {(p) => <ZonaArchivos {...p} archivos={[]} alCambiar={() => undefined} disabled ayuda="Disponible al confirmar el turno." />}
          </Campo>
        </div>
        <div className="stack gap-6">
          <Campo etiqueta="Color en la agenda (color)" ayuda="Paleta cerrada de 4 tonos; sin selector libre.">
            {(p) => <SelectorColor {...p} aria-label="Color en la agenda" valor={color} alCambiar={setColor} />}
          </Campo>
          <Campo etiqueta="Color (deshabilitado)">
            {(p) => <SelectorColor {...p} aria-label="Color deshabilitado" valor="azul" alCambiar={() => undefined} disabled />}
          </Campo>
        </div>
        <div className="field">
          <span className="label">Campo oculto (hidden)</span>
          <p className="help m-0 text-[length:var(--text-sm)]">
            No se ve. <span className="mono">CampoOculto</span> registra un valor en el formulario (por ejemplo, el id del turno) sin usar un input crudo.
          </p>
          <CampoOculto name="turnoId" value="turno-ejemplo-0001" readOnly />
        </div>
      </div>
    </Seccion>
  );
}

/* ============================== Card, tabla, vacío y carga ============================== */

type FilaTurno = { hora: string; paciente: string; dni: string; avatar: string | null; profesional: string; sillon: string; estado: EstadoTurno };
const TURNOS: FilaTurno[] = [
  { hora: "09:00", paciente: "Federico Albornoz", dni: "28.774.310", avatar: AVATARES[5], profesional: "Dr. Lautaro de Coninck", sillon: "Sillón 2", estado: "ATENDIDO" },
  { hora: "09:30", paciente: "Ignacio Zabala", dni: "40.118.552", avatar: AVATARES[7], profesional: "Dr. Joaquín Cortez", sillon: "Sillón 1", estado: "AUSENTE" },
  { hora: "09:30", paciente: "Nahuel Paz", dni: "36.205.871", avatar: AVATARES[3], profesional: "Dr. Joaquín Echenagorria", sillon: "Sillón 3", estado: "CANCELADO" },
  { hora: "10:00", paciente: "Agustina Molina", dni: "33.690.024", avatar: AVATARES[6], profesional: "Dr. Lautaro de Coninck", sillon: "Sillón 2", estado: "CONFIRMADO" },
  { hora: "12:00", paciente: "Camila Ledesma", dni: "42.307.618", avatar: null, profesional: "Dr. Joaquín Cortez", sillon: "Sillón 1", estado: "RESERVADO" },
];
const EQUIPO = [
  { nombre: "Francisco Valles", rol: "Administrador", avatar: AVATARES[0] },
  { nombre: "Octavio Crescini", rol: "Recepción", avatar: AVATARES[9] },
  { nombre: "Ulises Lucato", rol: "Recepción", avatar: AVATARES[10] },
  { nombre: "Dr. Joaquín Cortez", rol: "Profesional", avatar: AVATARES[8] },
  { nombre: "Dr. Lautaro de Coninck", rol: "Profesional", avatar: AVATARES[13] },
  { nombre: "Dr. Joaquín Echenagorria", rol: "Profesional", avatar: AVATARES[14] },
];

export function SeccionContenedores() {
  const toast = useToast();
  const [cancelar, setCancelar] = useState(false);
  return (
    <Seccion titulo="Card, tabla, vacío y carga" descripcion="Sin avatar (o si la imagen falla) se ve un ícono neutro, nunca iniciales.">
      <div className="grid g-21">
        <div className="stack gap-6">
          <Tabla
            titulo="Turnos del día"
            pie={
              <>
                <span className="num">5 de 18 turnos</span>
                <div className="row gap-1">
                  <Boton variante="secundario" tamano="sm" icono="chevron-left" etiqueta="Anterior" disabled />
                  <Boton variante="secundario" tamano="sm" icono="chevron-right" etiqueta="Siguiente" />
                </div>
              </>
            }
          >
            <TablaEncabezado>
              <tr>
                <TablaCeldaEncabezado>Hora</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Paciente</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Profesional</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Sillón</TablaCeldaEncabezado>
                <TablaCeldaEncabezado>Estado</TablaCeldaEncabezado>
              </tr>
            </TablaEncabezado>
            <TablaCuerpo>
              {TURNOS.map((t) => {
                const cancelado = t.estado === "CANCELADO";
                return (
                  <TablaFila key={`${t.hora}-${t.dni}`} cancelada={cancelado}>
                    <TablaCelda hora destacada={!cancelado}>{t.hora}</TablaCelda>
                    <TablaCelda><CeldaPersona nombre={t.paciente} detalle={`DNI ${t.dni}`} avatar={t.avatar} /></TablaCelda>
                    <TablaCelda apagada={!cancelado}>{t.profesional}</TablaCelda>
                    <TablaCelda apagada={!cancelado}>{t.sillon}</TablaCelda>
                    <TablaCelda><BadgeEstado estado={t.estado} /></TablaCelda>
                  </TablaFila>
                );
              })}
            </TablaCuerpo>
          </Tabla>

          <Tabla titulo="Equipo del consultorio">
            <TablaEncabezado>
              <tr><TablaCeldaEncabezado>Persona</TablaCeldaEncabezado><TablaCeldaEncabezado>Rol</TablaCeldaEncabezado></tr>
            </TablaEncabezado>
            <TablaCuerpo>
              {EQUIPO.map((u) => (
                <TablaFila key={u.nombre}>
                  <TablaCelda><CeldaPersona nombre={u.nombre} avatar={u.avatar} /></TablaCelda>
                  <TablaCelda><Etiqueta>{u.rol}</Etiqueta></TablaCelda>
                </TablaFila>
              ))}
              <TablaFila>
                <TablaCelda>
                  <div className="cell-person">
                    <Avatar iconoSinFoto="mail" />
                    <div><b>Invitación pendiente</b><span>recepcion@example.com</span></div>
                  </div>
                </TablaCelda>
                <TablaCelda><Etiqueta>Recepción</Etiqueta></TablaCelda>
              </TablaFila>
            </TablaCuerpo>
          </Tabla>

          <Tabla titulo="Turnos cancelados">
            <TablaEncabezado>
              <tr><TablaCeldaEncabezado>Hora</TablaCeldaEncabezado><TablaCeldaEncabezado>Paciente</TablaCeldaEncabezado><TablaCeldaEncabezado>Motivo</TablaCeldaEncabezado></tr>
            </TablaEncabezado>
            <TablaCuerpo>
              <TablaVacia columnas={3} icono="calendar-off" titulo="Sin cancelaciones" descripcion="Cuando se cancele un turno, va a aparecer acá." />
            </TablaCuerpo>
          </Tabla>
        </div>

        <div className="stack gap-6">
          <Tarjeta
            titulo="Historial del turno"
            acciones={<BadgeEstado estado="CONFIRMADO" />}
            pie={
              <>
                <Boton variante="fantasma" tamano="sm">Marcar atendido</Boton>
                <Boton variante="peligro-fantasma" tamano="sm" onClick={() => setCancelar(true)}>Cancelar turno</Boton>
              </>
            }
          >
            <div className="stack num gap-3.5 text-[length:var(--text-sm)]">
              <div><b className="font-medium">Confirmado</b> <span className="muted">por Octavio Crescini</span><div className="help">25/11/2026, 08:41</div></div>
              <div><b className="font-medium">Reservado</b> <span className="muted">por Octavio Crescini</span><div className="help">24/11/2026, 17:02</div></div>
            </div>
          </Tarjeta>
          <Tarjeta>
            <EstadoVacio
              icono="calendar-off"
              titulo="Sin turnos este día"
              descripcion="Elegí otra fecha o creá el primer turno del día."
              accion={<Boton variante="secundario" tamano="sm" icono="plus">Nuevo turno</Boton>}
            />
          </Tarjeta>
          <Tarjeta>
            <div className="stack gap-2.5" aria-busy="true" aria-label="Cargando">
              <Esqueleto alto={12} ancho="40%" />
              <Esqueleto alto={12} ancho="85%" />
              <Esqueleto alto={12} ancho="65%" />
            </div>
          </Tarjeta>
        </div>
      </div>
      <Dialogo
        abierto={cancelar}
        alCambiarAbierto={setCancelar}
        titulo="Cancelar turno"
        descripcion="Rocío Gaitán, miércoles 25 a las 10:30."
        acciones={
          <>
            <CerrarDialogo><Boton variante="fantasma" tamano="sm">Volver</Boton></CerrarDialogo>
            <Boton
              variante="peligro"
              tamano="sm"
              onClick={() => {
                setCancelar(false);
                toast.info("Turno cancelado", "El horario de las 10:30 quedó libre");
              }}
            >
              Cancelar turno
            </Boton>
          </>
        }
      >
        <Campo etiqueta="Motivo" obligatorio>
          {(p) => <AreaTexto {...p} placeholder="Por ejemplo, avisó que no puede venir" />}
        </Campo>
      </Dialogo>
    </Seccion>
  );
}

/* ============================== Diálogo ============================== */

export function SeccionDialogo() {
  const toast = useToast();
  const [motivo, setMotivo] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const error = intentado && !motivo.trim() ? "Escribí el motivo de la cancelación" : undefined;
  return (
    <Seccion titulo="Diálogo" descripcion="Para confirmar acciones con consecuencias. Escape o clic afuera lo cierra y el foco vuelve al botón.">
      <div className="row">
        <Dialogo
          abierto={abierto}
          alCambiarAbierto={(a) => {
            setAbierto(a);
            if (!a) {
              setMotivo("");
              setIntentado(false);
            }
          }}
          disparador={<Boton variante="peligro">Cancelar turno</Boton>}
          titulo="Cancelar turno"
          descripcion="El horario queda libre y la cancelación se guarda en el historial."
          acciones={
            <>
              <CerrarDialogo><Boton variante="fantasma" tamano="sm">Volver</Boton></CerrarDialogo>
              <Boton
                variante="peligro"
                tamano="sm"
                onClick={() => {
                  setIntentado(true);
                  if (!motivo.trim()) return;
                  setAbierto(false);
                  toast.info("Turno cancelado", "El horario quedó libre");
                }}
              >
                Cancelar turno
              </Boton>
            </>
          }
        >
          <Campo etiqueta="Motivo" obligatorio error={error}>
            {(p) => <AreaTexto {...p} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}
          </Campo>
        </Dialogo>
        <Dialogo
          disparador={<Boton variante="secundario">Ver detalle</Boton>}
          titulo="Turno de Martina Sosa"
          descripcion="Miércoles 25/11/2026, 10:30-11:00, Limpieza, Sillón 1."
          acciones={<CerrarDialogo><Boton variante="secundario" tamano="sm">Cerrar</Boton></CerrarDialogo>}
        />
        <span className="help">Probá el primero sin motivo para ver el error.</span>
      </div>
    </Seccion>
  );
}

/* ============================== Formulario de ejemplo (FormField + Zod) ============================== */

const esquemaTurno = z.object({
  paciente: z.string().trim().min(1, "Ingresá el nombre del paciente"),
  telefono: z
    .string()
    .trim()
    .min(1, "Ingresá el teléfono")
    .regex(/^[\d\s()+-]{8,20}$/, "Usá solo números, espacios o guiones"),
  prestacion: z.string().min(1, "Elegí una prestación"),
  inicio: z.string().min(1, "Elegí fecha y hora"),
  duracion: z.number({ error: "Ingresá la duración" }).int().min(10, "Mínimo 10 minutos").max(240, "Máximo 240 minutos"),
  confirmado: z.boolean(),
  notas: z.string().max(200, "Hasta 200 caracteres"),
});
type DatosTurno = z.infer<typeof esquemaTurno>;

export function SeccionFormulario() {
  const toast = useToast();
  const form = useForm<DatosTurno>({
    resolver: zodResolver(esquemaTurno),
    defaultValues: { paciente: "Rocío Gaitán", telefono: "", prestacion: "", inicio: "", duracion: 30, confirmado: false, notas: "" },
  });
  const guardar = async (datos: DatosTurno) => {
    await new Promise((r) => setTimeout(r, 700));
    const instante = instanteDeFechaHora(datos.inicio);
    toast.exito("Turno creado", `${datos.paciente}, ${instante ? instante.toISOString() : datos.inicio}`);
    form.reset();
  };
  return (
    <Seccion
      titulo="Formulario de ejemplo"
      descripcion="FormField conecta react-hook-form y el esquema Zod con cada control. Enviá sin teléfono: el campo muestra el error y el foco va al primer campo con error."
    >
      <Tarjeta titulo="Nuevo turno">
        <form noValidate onSubmit={form.handleSubmit(guardar)} className="stack gap-5">
          <div className="grid g-2 gap-5">
            <FormField control={form.control} name="paciente" etiqueta="Paciente" obligatorio>
              {({ control, campo }) => <Entrada {...control} {...campo} />}
            </FormField>
            <FormField control={form.control} name="telefono" etiqueta="Teléfono" obligatorio ayuda="Con característica, sin el 0 ni el 15.">
              {({ control, campo }) => <Entrada {...control} {...campo} tipo="tel" className="num" placeholder="261 486 2093" />}
            </FormField>
            <FormField control={form.control} name="prestacion" etiqueta="Prestación" obligatorio>
              {({ control, campo }) => (
                <Selector {...control} ref={campo.ref} name={campo.name} valor={campo.value} alCambiar={campo.onChange} onBlur={campo.onBlur} opciones={PRESTACIONES} />
              )}
            </FormField>
            <FormField control={form.control} name="inicio" etiqueta="Fecha y hora" obligatorio>
              {({ control, campo }) => (
                <SelectorFechaHora {...control} ref={campo.ref} valor={campo.value || null} alCambiar={campo.onChange} onBlur={campo.onBlur} deshabilitarFecha={finDeSemana} />
              )}
            </FormField>
            <FormField control={form.control} name="duracion" etiqueta="Duración" ayuda="En minutos.">
              {({ control, campo }) => (
                <EntradaNumero {...control} ref={campo.ref} valor={Number.isNaN(campo.value) ? null : campo.value} alCambiar={(v) => campo.onChange(v ?? Number.NaN)} onBlur={campo.onBlur} min={10} max={240} paso={5} unidad="minutos" />
              )}
            </FormField>
            <FormField control={form.control} name="notas" etiqueta="Notas" opcional>
              {({ control, campo }) => <AreaTexto {...control} {...campo} rows={2} />}
            </FormField>
          </div>
          <FormField control={form.control} name="confirmado" etiqueta="Estado inicial">
            {({ control, campo }) => (
              <Interruptor {...control} ref={campo.ref} activo={campo.value} alCambiar={campo.onChange} onBlur={campo.onBlur} etiqueta="Turno confirmado" descripcion="Si el paciente ya confirmó por teléfono." />
            )}
          </FormField>
          <div className="row justify-end">
            <Boton variante="fantasma" onClick={() => form.reset()}>Limpiar</Boton>
            <Boton type="submit" cargando={form.formState.isSubmitting}>Guardar turno</Boton>
          </div>
        </form>
      </Tarjeta>
    </Seccion>
  );
}
