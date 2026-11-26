import Link from "next/link";
import { Avatar, BadgeEstado, EstadoVacio } from "@/components/ui";
import { horaLocal } from "@/domain/shared/fechas";
import type { TurnoAgenda } from "./datos";

/** Vista Lista: todos los turnos del día, los cancelados tachados con su estado. */
export function ListaDia({ turnos }: { turnos: TurnoAgenda[] }) {
  if (turnos.length === 0) return <EstadoVacio icono="calendar-off" titulo="No hay turnos para este día" />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Hora</th><th>Paciente</th><th>Profesional</th><th>Prestación</th><th>Sillón</th><th>Estado</th></tr>
        </thead>
        <tbody className="num">
          {turnos.map((t) => (
            <tr key={t.id} className={t.estado === "CANCELADO" ? "is-cancel" : undefined}>
              <td className="time strong">{horaLocal(t.inicio)}</td>
              <td>
                <div className="cell-person">
                  <Avatar avatar={t.paciente.avatar} />
                  <div><b><Link href={`/turnos/${t.id}`}>{t.paciente.nombre} {t.paciente.apellido}</Link></b></div>
                </div>
              </td>
              <td className="muted">{t.profesional}</td>
              <td className="muted">{t.prestacion}</td>
              <td className="muted">{t.sillon}</td>
              <td><BadgeEstado estado={t.estado} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
