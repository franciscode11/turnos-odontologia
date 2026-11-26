import type { Metadata } from "next";
import { CuerpoPagina, EncabezadoPagina, EstadoVacio, Tarjeta } from "@/components/ui";
import { DURACION_PREDETERMINADA } from "@/domain/horarios/constantes";
import { esquemaConsultaDisponibilidad } from "@/domain/horarios/esquemas";
import { esFechaValida, formatearFechaLarga, hoy } from "@/domain/shared/fechas";
import { puede } from "@/server/auth/matriz";
import { accesoPagina } from "@/server/auth/pagina";
import { bloqueosDelProfesional, franjasDelProfesional, prestacionesActivas, profesionalesActivos } from "@/server/horarios/consultas";
import { consultarDisponibilidad } from "@/server/horarios/disponibilidad";
import { SinPermiso } from "../../_shell/sin-permiso";
import { DialogoBloqueo } from "./_componentes/dialogo-bloqueo";
import { ControlesDisponibilidad, SelectorProfesional, type Parametros } from "./_componentes/filtros";
import { HorarioSemanal, IniciosDisponibles, ListaBloqueos } from "./_componentes/secciones";

export const metadata: Metadata = { title: "Horarios" };

/**
 * /configuracion/horarios (C-04): horario semanal, bloqueos y disponibilidad del día por profesional.
 * Todos los roles consultan; solo ADMIN ve los controles de edición (RN-HO-06). El control real
 * está en cada Server Action (requireRol).
 */
export default async function PaginaConfiguracionHorarios({ searchParams }: PageProps<"/configuracion/horarios">) {
  const { usuario, permitido } = await accesoPagina("horarios.ver");
  if (!permitido) return <SinPermiso />;

  const profesionales = await profesionalesActivos();
  if (profesionales.length === 0) {
    return (
      <>
        <EncabezadoPagina titulo="Horarios" />
        <CuerpoPagina>
          <EstadoVacio icono="stethoscope" titulo="No hay profesionales activos" descripcion="Cargá profesionales desde Configuración para definir sus horarios." />
        </CuerpoPagina>
      </>
    );
  }

  // Parámetros inválidos → primer profesional activo, hoy y 30 minutos (design §4).
  const q = await searchParams;
  const ahora = new Date();
  const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const profesional = profesionales.find((p) => p.id === texto(q.profesional)) ?? profesionales[0]!;
  const fecha = esFechaValida(texto(q.fecha)) ? texto(q.fecha) : hoy(ahora);
  const duracionPedida = Number(texto(q.duracion));
  const duracion = esquemaConsultaDisponibilidad.shape.duracion.safeParse(duracionPedida).success ? duracionPedida : DURACION_PREDETERMINADA;
  const parametros: Parametros = { profesional: profesional.id, fecha, duracion };

  const [franjas, bloqueos, prestaciones, disponibilidad] = await Promise.all([
    franjasDelProfesional(profesional.id),
    bloqueosDelProfesional(profesional.id, ahora),
    prestacionesActivas(),
    consultarDisponibilidad({ profesionalId: profesional.id, fecha, duracion }),
  ]);
  const editaHorarios = puede(usuario.rol, "horarios.editar");
  const editaBloqueos = puede(usuario.rol, "bloqueos.editar");

  return (
    <>
      <EncabezadoPagina
        titulo="Horarios"
        descripcion={editaHorarios ? "Franjas de atención, bloqueos y disponibilidad por profesional." : "Consulta de franjas, bloqueos y disponibilidad por profesional."}
        acciones={
          <SelectorProfesional
            parametros={parametros}
            opciones={profesionales.map((p) => ({ valor: p.id, etiqueta: p.nombre, meta: p.especialidad ?? undefined }))}
          />
        }
      />
      <CuerpoPagina>
        <div className="grid g-21">
          <div className="stack" style={{ gap: 24 }}>
            <Tarjeta titulo={`Horario semanal · ${profesional.nombre}`} sinPadding>
              <HorarioSemanal profesionalId={profesional.id} franjas={franjas} editable={editaHorarios} />
            </Tarjeta>
            <Tarjeta titulo="Bloqueos" acciones={editaBloqueos ? <DialogoBloqueo profesionalId={profesional.id} /> : null} sinPadding>
              <ListaBloqueos profesionalId={profesional.id} bloqueos={bloqueos} editable={editaBloqueos} />
            </Tarjeta>
          </div>
          <Tarjeta titulo="Disponibilidad del día">
            <div className="stack" style={{ gap: 20 }}>
              <ControlesDisponibilidad parametros={parametros} prestaciones={prestaciones} />
              <p className="help num">
                {formatearFechaLarga(fecha)} · {duracion} minutos · inicios cada 5 minutos. No considera el sillón: se valida al crear el turno.
              </p>
              {disponibilidad.ok ? (
                <IniciosDisponibles grupos={disponibilidad.data.grupos} mensajeVacio={disponibilidad.data.mensajeVacio} />
              ) : (
                <EstadoVacio icono="alert-triangle" titulo={disponibilidad.error} />
              )}
            </div>
          </Tarjeta>
        </div>
      </CuerpoPagina>
    </>
  );
}
