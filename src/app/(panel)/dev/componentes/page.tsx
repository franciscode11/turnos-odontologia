import type { Metadata } from "next";
import { BadgeEstado, CuerpoPagina, EncabezadoPagina, Icono, Tabla, TablaCelda, TablaCeldaEncabezado, TablaCuerpo, TablaEncabezado, TablaFila } from "@/components/ui";
import { ESTADOS_TURNO } from "@/domain/shared/estados";
import {
  ProveedoresCatalogo, SeccionArchivos, SeccionBotones, SeccionContenedores, SeccionDialogo, SeccionFechas,
  SeccionFormulario, SeccionNumeros, SeccionReaccion, SeccionSeleccion, SeccionTexto, SeccionToasts,
} from "./secciones";

export const metadata: Metadata = { title: "Componentes" };

const COLORES = [
  ["Acento", "accent-600", "--color-accent-600"],
  ["Acento tenue", "accent-50", "--color-accent-50"],
  ["Texto", "text", "--color-text"],
  ["Texto secundario", "text-muted", "--color-text-muted"],
  ["Borde", "border", "--color-border"],
  ["Superficie", "muted", "--color-muted"],
  ["Sidebar", "bg-subtle", "--color-bg-subtle"],
] as const;

const MOVIMIENTO = [
  ["Presionar botón", "120 ms", "scale 0,97, ease-out"],
  ["Hover de color", "150 ms", "ease, solo en mouse"],
  ["Tooltip", "125 ms", "aparece a los 400 ms; los siguientes, al instante"],
  ["Select, calendario, menú", "160 / 110 ms", "scale 0,96 desde el disparador"],
  ["Diálogo", "220 / 150 ms", "scale 0,96 centrado, fondo 180 ms"],
  ["Toast", "240 / 160 ms", "sube 12 px; se puede interrumpir"],
  ["Ítem activo del menú", "200 ms", "el fondo se desliza, ease-out"],
  ["Colapsar sidebar", "220 ms", "ease-in-out"],
  ["Entrada del login", "450 ms", "blur 8 px a 0, una vez por sesión"],
  ["Foco con teclado", "0 ms", "anillo inmediato"],
] as const;

const REACCION = [
  ["Respuesta visual a un clic", "Inmediata (estado presionado en el mismo cuadro)"],
  ["Mostrar \"Guardando\"", "Solo si tarda más de 150 ms"],
  ["Tiempo mínimo del spinner", "400 ms, para que no parpadee"],
  ["Búsqueda mientras se escribe", "Espera 250 ms sin teclear"],
  ["Toast de éxito", "4 s; se pausa con el mouse encima o con el foco"],
  ["Toast de error", "6 s, con botón para cerrar"],
  ["Movimiento reducido", "Sin escalas ni desplazamientos; solo fundidos de 120 ms"],
] as const;

/** Catálogo del sistema de componentes (spec sistema-de-componentes): cada componente con sus estados. */
export default function PaginaComponentes() {
  return (
    <ProveedoresCatalogo>
      <EncabezadoPagina
        titulo="Componentes"
        descripcion={<>Revision 3. Se implementan una sola vez en <span className="mono">src/components/ui</span>.</>}
        acciones={<div className="notice"><Icono nombre="alert-triangle" />Nombre y logo provisionales</div>}
      />
      <CuerpoPagina>
        <section className="section">
          <h2 className="section-title">Color</h2>
          <p className="section-desc">Neutros zinc y un único acento. Los colores de estado aparecen solo en badges y avisos, siempre con ícono y texto.</p>
          <div className="swatch-row">
            {COLORES.map(([nombre, token, variable]) => (
              <div key={token} className="tok">
                <i style={{ background: `var(${variable})` }} />
                {nombre}
                <code>{token}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Tipografía</h2>
          <p className="section-desc">Geist para toda la interfaz y Geist Mono para DNI, matrículas y códigos.</p>
          <div className="cat-block">
            <div className="type-row"><code>xl 28/600</code><span className="text-[length:var(--text-xl)] font-semibold tracking-[-0.025em]">Ingresá al consultorio</span></div>
            <div className="type-row"><code>lg 20/600</code><span className="text-[length:var(--text-lg)] font-semibold tracking-[-0.02em]">Agenda del miércoles</span></div>
            <div className="type-row"><code>md 16/600</code><span className="text-[length:var(--text-md)] font-semibold">Cancelar turno</span></div>
            <div className="type-row"><code>base 14/400</code><span>El profesional ya tiene un turno en ese horario.</span></div>
            <div className="type-row"><code>sm 13/400</code><span className="muted text-[length:var(--text-sm)]">10:30-11:30, Extracción, Sillón 1</span></div>
            <div className="type-row"><code>mono 13</code><span className="mono">DNI 31.482.907 · MP 4471</span></div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Movimiento y tiempos de reacción</h2>
          <p className="section-desc">Todo se anima con transform y opacity, en menos de 300 ms y con curva de salida fuerte. Lo que se usa cientos de veces por día no se anima.</p>
          <div className="grid g-2">
            <Tabla titulo="Tiempos de animación" className="motion-table">
              <TablaEncabezado>
                <tr><TablaCeldaEncabezado>Interacción</TablaCeldaEncabezado><TablaCeldaEncabezado>Duración</TablaCeldaEncabezado><TablaCeldaEncabezado>Cómo</TablaCeldaEncabezado></tr>
              </TablaEncabezado>
              <TablaCuerpo>
                {MOVIMIENTO.map(([que, cuanto, como]) => (
                  <TablaFila key={que}><TablaCelda destacada>{que}</TablaCelda><TablaCelda>{cuanto}</TablaCelda><TablaCelda apagada>{como}</TablaCelda></TablaFila>
                ))}
              </TablaCuerpo>
            </Tabla>
            <Tabla titulo="Reglas de reacción" className="motion-table">
              <TablaEncabezado>
                <tr><TablaCeldaEncabezado>Regla de reacción</TablaCeldaEncabezado><TablaCeldaEncabezado>Valor</TablaCeldaEncabezado></tr>
              </TablaEncabezado>
              <TablaCuerpo>
                {REACCION.map(([regla, valor]) => (
                  <TablaFila key={regla}><TablaCelda destacada>{regla}</TablaCelda><TablaCelda>{valor}</TablaCelda></TablaFila>
                ))}
              </TablaCuerpo>
            </Tabla>
          </div>
          <SeccionReaccion />
        </section>

        <SeccionBotones />

        <section className="section">
          <h2 className="section-title">Estados del turno</h2>
          <p className="section-desc">Fondo tenue, ícono y texto del mismo tono. Nunca solo color.</p>
          <div className="row">
            {ESTADOS_TURNO.map((e) => <BadgeEstado key={e} estado={e} />)}
          </div>
          <div className="row mt-3">
            {ESTADOS_TURNO.map((e) => <BadgeEstado key={e} estado={e} tamano="lg" />)}
          </div>
        </section>

        <SeccionToasts />
        <SeccionTexto />
        <SeccionNumeros />
        <SeccionFechas />
        <SeccionSeleccion />
        <SeccionArchivos />
        <SeccionContenedores />
        <SeccionDialogo />
        <SeccionFormulario />
      </CuerpoPagina>
    </ProveedoresCatalogo>
  );
}
