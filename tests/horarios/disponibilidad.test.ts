import { afterEach, describe, expect, it } from "vitest";
import { aInstante, formatearHora } from "@/domain/shared/fechas";
import type { EstadoTurno } from "@/domain/shared/estados";
import {
  calcularDisponibilidad,
  calcularDisponibilidadPorFranja,
  mensajeSinDisponibilidad,
  type BloqueoOcupacion,
  type FranjaHoraria,
  type TurnoOcupacion,
} from "@/domain/horarios/disponibilidad";
import { MENSAJES } from "@/domain/horarios/constantes";

// Fechas fijas: lunes 30/11/2026 y martes 01/12/2026. Pacientes ficticios.
const LUNES = "2026-11-30";
const MARTES = "2026-12-01";

const franja = (diaSemana: number, horaDesde: string, horaHasta: string): FranjaHoraria => ({ diaSemana, horaDesde, horaHasta });
const bloqueo = (fd: string, hd: string, fh: string, hh: string): BloqueoOcupacion => ({ desde: aInstante(fd, hd), hasta: aInstante(fh, hh) });
const turno = (fecha: string, desde: string, hasta: string, estado: EstadoTurno): TurnoOcupacion => ({
  inicio: aInstante(fecha, desde),
  fin: aInstante(fecha, hasta),
  estado,
});
const horas = (inicios: Date[]) => inicios.map(formatearHora);

/** Inicios esperados "HH:mm" de desde a hasta (inclusive) cada 5 minutos. */
function cada5(desde: string, hasta: string): string[] {
  const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  const lista: string[] = [];
  for (let m = aMin(desde); m <= aMin(hasta); m += 5) lista.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return lista;
}

const LUNES_9_A_12 = [franja(1, "09:00", "12:00")];

describe("inicios dentro de una franja (RN-HO-04, RN-HO-05)", () => {
  it("RN-HO-04 RN-HO-05 Lunes sin turnos ni bloqueos: 31 inicios de 09:00 a 11:30", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 30));
    expect(inicios).toHaveLength(31);
    expect(inicios).toEqual(cada5("09:00", "11:30"));
  });

  it("RN-HO-04 Duración que ocupa la franja entera: 180 minutos ofrece solo 09:00", () => {
    expect(horas(calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 180))).toEqual(["09:00"]);
  });

  it("RN-HO-04 Duración mayor que la franja: 240 minutos no ofrece nada y avisa", () => {
    const inicios = calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 240);
    expect(inicios).toEqual([]);
    expect(mensajeSinDisponibilidad(LUNES_9_A_12, LUNES, inicios)).toBe("No hay horarios disponibles para esa duración");
  });

  it("RN-HO-04 RN-HO-05 Dos franjas en el mismo día: 60 minutos ofrece 09:00-11:00 y 15:00-17:00", () => {
    const franjas = [franja(1, "15:00", "18:00"), franja(1, "09:00", "12:00")];
    const inicios = horas(calcularDisponibilidad(franjas, [], [], LUNES, 60));
    expect(inicios).toEqual([...cada5("09:00", "11:00"), ...cada5("15:00", "17:00")]);
    expect(inicios.some((h) => h > "11:00" && h < "15:00")).toBe(false);
    expect(calcularDisponibilidadPorFranja(franjas, [], [], LUNES, 60).map((g) => g.etiqueta)).toEqual(["09:00 - 12:00", "15:00 - 18:00"]);
  });

  it("RN-HO-04 D11 Turno que cruzaría dos franjas contiguas: no ofrece 11:45, sí 11:30 y 12:00", () => {
    const franjas = [franja(1, "09:00", "12:00"), franja(1, "12:00", "14:00")];
    const inicios = horas(calcularDisponibilidad(franjas, [], [], LUNES, 30));
    expect(inicios).not.toContain("11:45");
    expect(inicios).toContain("11:30");
    expect(inicios).toContain("12:00");
    expect(new Set(inicios).size).toBe(inicios.length);
  });
});

describe("los bloqueos restan disponibilidad (RN-HO-04, RN-TU-01)", () => {
  it("RN-HO-04 RN-TU-01 Bloqueo de 10:00 a 11:00: nada entre 09:35 y 10:55; sí 09:30 y 11:00", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [bloqueo(LUNES, "10:00", LUNES, "11:00")], [], LUNES, 30));
    expect(inicios.filter((h) => h >= "09:35" && h <= "10:55")).toEqual([]);
    expect(inicios).toContain("09:30");
    expect(inicios).toContain("11:00");
  });

  it("RN-HO-04 Bloqueo de todo el día: 30/11 00:00 al 01/12 00:00 no deja inicios y avisa", () => {
    const franjas = [franja(1, "09:00", "13:00")];
    const inicios = calcularDisponibilidad(franjas, [bloqueo(LUNES, "00:00", MARTES, "00:00")], [], LUNES, 30);
    expect(inicios).toEqual([]);
    expect(mensajeSinDisponibilidad(franjas, LUNES, inicios)).toBe(MENSAJES.sinHorarios);
  });

  it("RN-HO-04 RN-TU-01 Bloqueo que empieza el día anterior: 29/11 20:00 al 30/11 10:00 deja el primer inicio a las 10:00", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [bloqueo("2026-11-29", "20:00", LUNES, "10:00")], [], LUNES, 30));
    expect(inicios[0]).toBe("10:00");
  });

  it("RN-GL-03 RN-TU-01 Bloqueo que termina a la medianoche: 30/11 20:00 al 01/12 00:00 no bloquea el 01/12", () => {
    const martes = [franja(2, "00:00", "02:00")];
    const inicios = horas(calcularDisponibilidad(martes, [bloqueo(LUNES, "20:00", MARTES, "00:00")], [], MARTES, 30));
    expect(inicios[0]).toBe("00:00");
  });
});

describe("solo los turnos que ocupan agenda restan (RN-HO-04, RN-TU-04)", () => {
  it("RN-HO-04 RN-TU-01 RN-TU-04 Turno reservado: 10:00-10:30 de Tomás Ferreyra saca 09:35-10:25", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [turno(LUNES, "10:00", "10:30", "RESERVADO")], LUNES, 30));
    expect(inicios.filter((h) => h >= "09:35" && h <= "10:25")).toEqual([]);
    expect(inicios).toContain("09:30");
    expect(inicios).toContain("10:30");
  });

  it("RN-TU-04 Turno cancelado no resta: con un turno CANCELADO de Sofía Benítez siguen los 31 inicios", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [turno(LUNES, "10:00", "10:30", "CANCELADO")], LUNES, 30));
    expect(inicios).toHaveLength(31);
    expect(inicios).toContain("10:00");
  });

  it("RN-TU-04 Turno ausente sigue restando: AUSENTE 09:00-09:30 deja el primer inicio a las 09:30", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [turno(LUNES, "09:00", "09:30", "AUSENTE")], LUNES, 30));
    expect(inicios[0]).toBe("09:30");
  });

  it("RN-TU-04: CONFIRMADO y ATENDIDO también ocupan agenda", () => {
    for (const estado of ["CONFIRMADO", "ATENDIDO"] as const) {
      const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [turno(LUNES, "09:00", "09:30", estado)], LUNES, 30));
      expect(inicios[0]).toBe("09:30");
    }
  });

  it("IN-05 Sillón ocupado por otro profesional: la consulta solo recibe turnos del profesional y ofrece 10:00", () => {
    // El turno del Dr. Joaquín Echenagorria en el Sillón 1 no forma parte de la agenda del Dr. Joaquín Cortez.
    const turnosDeCortez: TurnoOcupacion[] = [];
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], turnosDeCortez, LUNES, 30));
    expect(inicios).toContain("10:00");
  });
});

describe("día de la semana según la fecha del consultorio (RN-GL-03)", () => {
  const TZ_ORIGINAL = process.env.TZ;
  afterEach(() => {
    process.env.TZ = TZ_ORIGINAL;
  });

  it("RN-HO-04 Profesional que no atiende ese día: el martes 01/12/2026 no hay inicios y se avisa", () => {
    const inicios = calcularDisponibilidad(LUNES_9_A_12, [], [], MARTES, 30);
    expect(inicios).toEqual([]);
    expect(mensajeSinDisponibilidad(LUNES_9_A_12, MARTES, inicios)).toBe("El profesional no atiende ese día");
  });

  it("RN-HO-04 Turnos de otro día no afectan: un CONFIRMADO el martes no resta al lunes", () => {
    const inicios = horas(calcularDisponibilidad(LUNES_9_A_12, [], [turno(MARTES, "09:00", "09:30", "CONFIRMADO")], LUNES, 30));
    expect(inicios).toEqual(cada5("09:00", "11:30"));
  });

  it.each(["UTC", "Europe/Madrid"])("RN-GL-03 Servidor en otra zona horaria (%s): el primer inicio es 2026-11-30T12:00:00Z y se muestra 09:00", (zona) => {
    process.env.TZ = zona;
    const inicios = calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 30);
    expect(inicios[0]?.toISOString()).toBe("2026-11-30T12:00:00.000Z");
    expect(formatearHora(inicios[0] as Date)).toBe("09:00");
    expect(inicios).toHaveLength(31);
  });

  it("borde: con inicios disponibles no hay mensaje de vacío y una duración no positiva no ofrece nada", () => {
    const inicios = calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 30);
    expect(mensajeSinDisponibilidad(LUNES_9_A_12, LUNES, inicios)).toBeNull();
    expect(calcularDisponibilidad(LUNES_9_A_12, [], [], LUNES, 0)).toEqual([]);
  });
});
