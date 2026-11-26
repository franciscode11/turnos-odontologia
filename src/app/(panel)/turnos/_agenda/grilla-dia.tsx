import Link from "next/link";
import { Avatar, BadgeEstado } from "@/components/ui";
import { ocupaAgenda } from "@/domain/shared/estados";
import { fechaLocal, horaLocal, minutosDelDia } from "@/domain/shared/fechas";
import type { ColumnaAgenda } from "./datos";

const ALTO_HORA = 88; // design system: 88 px por hora

function minutosLocales(instante: Date, fecha: string): number {
  // Un instante de otro día (bloqueo que empieza antes o termina después) se recorta al día.
  const dia = fechaLocal(instante);
  if (dia < fecha) return 0;
  if (dia > fecha) return 24 * 60;
  return minutosDelDia(horaLocal(instante));
}

function limites(columnas: ColumnaAgenda[], fecha: string) {
  const minutos: number[] = [];
  for (const c of columnas) {
    for (const f of c.franjas) minutos.push(minutosDelDia(f.horaDesde), minutosDelDia(f.horaHasta));
    for (const t of c.turnos) minutos.push(minutosLocales(t.inicio, fecha), minutosLocales(t.fin, fecha));
  }
  if (minutos.length === 0) return { desde: 8, hasta: 18 };
  return { desde: Math.floor(Math.min(...minutos) / 60), hasta: Math.min(24, Math.ceil(Math.max(...minutos) / 60)) };
}

/** Vista Día: una columna por profesional, 88 px por hora (design-system/screens/panel-turnos.html). */
export function GrillaDia({ columnas, fecha, ahora }: { columnas: ColumnaAgenda[]; fecha: string; ahora: Date }) {
  const { desde, hasta } = limites(columnas, fecha);
  const y = (min: number) => ((min - desde * 60) / 60) * ALTO_HORA;
  const alto = (hasta - desde) * ALTO_HORA;
  const minutoAhora = fechaLocal(ahora) === fecha ? minutosDelDia(horaLocal(ahora)) : null;
  const mostrarAhora = minutoAhora !== null && minutoAhora >= desde * 60 && minutoAhora <= hasta * 60;

  return (
    <div className="agenda" style={{ ["--cols" as string]: Math.max(columnas.length, 1) }} aria-label="Agenda del día por profesional">
      <div className="ag-h" />
      {columnas.map((c) => (
        <div className="ag-h" key={c.id} title={c.nombre}>
          <Avatar avatar={c.avatar} tamano="lg" />
          <div>
            <b>{c.nombre}</b>
            <span>{c.especialidad ?? "Profesional"}</span>
          </div>
          <span className="ag-cuenta num" title="Turnos que ocupan agenda">{c.turnos.filter((t) => ocupaAgenda(t.estado)).length}</span>
        </div>
      ))}
      <div className="ag-times">
        {Array.from({ length: hasta - desde }, (_, i) => (
          <div className="ag-t" key={i}>{String(desde + i).padStart(2, "0")}:00</div>
        ))}
      </div>
      {columnas.map((c) => {
        // Franjas fuera de atención (rayadas): el complemento de las franjas del día.
        const franjas = c.franjas
          .map((f) => [minutosDelDia(f.horaDesde), minutosDelDia(f.horaHasta)] as const)
          .sort((a, b) => a[0] - b[0]);
        const fuera: [number, number][] = [];
        let cursor = desde * 60;
        for (const [a, b] of franjas) {
          if (a > cursor) fuera.push([cursor, a]);
          cursor = Math.max(cursor, b);
        }
        if (cursor < hasta * 60) fuera.push([cursor, hasta * 60]);

        return (
          <div className="ag-col" key={c.id} style={{ height: alto }}>
            {fuera.map(([a, b]) => (
              <div className="ag-off" key={`off-${a}`} style={{ top: y(a), height: y(b) - y(a) }} />
            ))}
            {c.bloqueos.map((bl) => {
              const a = Math.max(minutosLocales(bl.desde, fecha), desde * 60);
              const b = Math.min(minutosLocales(bl.hasta, fecha), hasta * 60);
              if (b <= a) return null;
              return (
                <div className="appt a-block" key={`bl-${bl.desde.toISOString()}`} style={{ top: y(a) + 2, height: y(b) - y(a) - 4 }}>
                  <b>{bl.motivo}</b>
                  <span className="a-meta">{horaLocal(bl.desde)}-{horaLocal(bl.hasta)}, Bloqueo</span>
                </div>
              );
            })}
            {c.turnos
              .filter((t) => ocupaAgenda(t.estado)) // los cancelados liberan el horario (RN-TU-04)
              .map((t) => {
                const a = minutosLocales(t.inicio, fecha);
                const b = minutosLocales(t.fin, fecha);
                const altoTurno = y(b) - y(a) - 4;
                return (
                  <Link key={t.id} href={`/turnos/${t.id}`} className={`appt a-${t.estado.toLowerCase()}`} style={{ top: y(a) + 2, height: altoTurno }}>
                    <BadgeEstado estado={t.estado} soloIcono />
                    <span className="a-hora num">{horaLocal(t.inicio)} – {horaLocal(t.fin)}</span>
                    <b>{t.paciente.nombre} {t.paciente.apellido}</b>
                    {altoTurno > 50 ? <span className="a-meta">{t.prestacion} · {t.sillon}</span> : null}
                  </Link>
                );
              })}
            {mostrarAhora && minutoAhora !== null ? (
              <div className="now" style={{ top: y(minutoAhora) }} aria-label={`Ahora, ${horaLocal(ahora)}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
