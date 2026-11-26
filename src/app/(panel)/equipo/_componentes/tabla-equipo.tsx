import {
  Avatar,
  Etiqueta,
  Icono,
  Tabla,
  TablaCelda,
  TablaCeldaEncabezado,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TablaVacia,
  type NombreIcono,
} from "@/components/ui";
import { ETIQUETA_ESTADO_VISIBLE, type EstadoVisible } from "@/domain/equipo/presentacion";
import { ETIQUETA_ROL } from "@/server/auth/matriz";
import { DialogoAcciones } from "./dialogo-acciones";
import type { FilaEquipo, ProfesionalVinculo } from "./tipos";

/** Clases e íconos de estado del design system (BadgeEstado solo cubre estados de turno). */
const ESTILO_ESTADO: Record<EstadoVisible, { clase: string; icono: NombreIcono }> = {
  ACTIVO: { clase: "st-atendido", icono: "circle-check" },
  PENDIENTE: { clase: "st-reservado", icono: "circle-dashed" },
  VENCIDA: { clase: "st-ausente", icono: "alert-triangle" },
  INACTIVO: { clase: "st-cancelado", icono: "circle-x" },
};

type Props = { filas: FilaEquipo[]; profesionales: ProfesionalVinculo[] };

/** Tabla de personas de /equipo (design-system/screens/equipo.html). */
export function TablaEquipo({ filas, profesionales }: Props) {
  return (
    <Tabla titulo="Personas del equipo">
      <TablaEncabezado>
        <TablaFila>
          <TablaCeldaEncabezado>Persona</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Rol</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Estado</TablaCeldaEncabezado>
          <TablaCeldaEncabezado>Último ingreso</TablaCeldaEncabezado>
          <TablaCeldaEncabezado style={{ width: 48 }}>
            <span className="sr-only">Acciones</span>
          </TablaCeldaEncabezado>
        </TablaFila>
      </TablaEncabezado>
      <TablaCuerpo>
        {filas.length === 0 ? (
          <TablaVacia columnas={5} icono="users" titulo="Todavía no hay nadie en el equipo" descripcion="Invitá a la primera persona con el botón Invitar." />
        ) : (
          filas.map((fila) => {
            const estilo = ESTILO_ESTADO[fila.estadoVisible];
            const invitacion = fila.estado === "INVITADO";
            return (
              <TablaFila key={fila.id}>
                <TablaCelda>
                  <div className="cell-person">
                    <Avatar avatar={invitacion ? null : fila.avatar} iconoSinFoto={invitacion ? "mail" : "user"} />
                    <div>
                      <b>{fila.titulo}</b>
                      <span>{fila.detalle}</span>
                    </div>
                  </div>
                </TablaCelda>
                <TablaCelda>
                  <Etiqueta>{ETIQUETA_ROL[fila.rol]}</Etiqueta>
                </TablaCelda>
                <TablaCelda>
                  <span className={`badge ${estilo.clase}`}>
                    <Icono nombre={estilo.icono} />
                    {ETIQUETA_ESTADO_VISIBLE[fila.estadoVisible]}
                  </span>
                </TablaCelda>
                <TablaCelda apagada>{fila.ultimoIngreso}</TablaCelda>
                <TablaCelda>
                  <DialogoAcciones fila={fila} profesionales={profesionales} />
                </TablaCelda>
              </TablaFila>
            );
          })
        )}
      </TablaCuerpo>
    </Tabla>
  );
}
