import { describe, expect, it } from "vitest";
import { agruparMotivos, normalizarMotivo, turnosPorDia, turnosPorPrestacion } from "@/domain/estadisticas/desgloses";
import { formatearPorcentaje, SIN_DATOS } from "@/domain/estadisticas/formato";
import { periodoMes, periodoSemana } from "@/domain/estadisticas/periodos";
import { armarReporte, resolverProfesional, type DatosEstadisticas, type ProfesionalEstadistica } from "@/domain/estadisticas/reporte";
import { CONSULTA, CORTEZ, DE_CONINCK, LIMPIEZA, franja, turno, varios } from "./fabricas";

const SEMANA = periodoSemana("2026-11-26");
const NOVIEMBRE = periodoMes("2026-11-26");

const PROFESIONALES: ProfesionalEstadistica[] = [
  { id: CORTEZ, nombre: "Dr. Joaquín Cortez", especialidad: "Odontología general", avatar: "avatar-09-anteojos-chomba-verde.webp", activo: true },
  { id: DE_CONINCK, nombre: "Dr. Lautaro de Coninck", especialidad: "Endodoncia", avatar: "avatar-14-camisa-azul-petroleo.webp", activo: true },
];
const PRESTACIONES = [
  { id: CONSULTA, nombre: "Consulta" },
  { id: LIMPIEZA, nombre: "Limpieza" },
];

function datos(parcial: Partial<DatosEstadisticas>): DatosEstadisticas {
  return { turnos: [], franjas: [], bloqueos: [], profesionales: PROFESIONALES, prestaciones: PRESTACIONES, ...parcial };
}

describe("turnos por día (RN-ST-02, RN-GL-03)", () => {
  it("RN-ST-02 el lunes 23/11 con 3 atendidos y 1 ausente", () => {
    const dias = turnosPorDia([...varios(3, "ATENDIDO"), ...varios(1, "AUSENTE")], SEMANA);
    expect(dias[0]).toEqual({ fecha: "2026-11-23", atendidos: 3, ausentes: 1 });
  });

  it("RN-ST-02 error: reservados y cancelados no se grafican", () => {
    const dias = turnosPorDia([...varios(2, "RESERVADO", "2026-11-24"), ...varios(1, "CANCELADO", "2026-11-24")], SEMANA);
    expect(dias[1]).toEqual({ fecha: "2026-11-24", atendidos: 0, ausentes: 0 });
  });

  it("RN-GL-03 borde: un día por fecha del período, también el domingo sin turnos; 23:30 de Argentina cae en su día", () => {
    const dias = turnosPorDia([turno("2026-11-28", "23:30", 30, "ATENDIDO")], SEMANA);
    expect(dias.map((d) => d.fecha)).toEqual(["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]);
    expect(dias[5]).toEqual({ fecha: "2026-11-28", atendidos: 1, ausentes: 0 });
    expect(dias[6]).toEqual({ fecha: "2026-11-29", atendidos: 0, ausentes: 0 });
  });
});

describe("motivos de cancelación (RN-ST-05)", () => {
  it("RN-ST-05 motivos escritos de distinta forma se agrupan por texto normalizado", () => {
    const turnos = [
      turno("2026-11-23", "09:00", 30, "CANCELADO", { motivoCancelacion: "Paciente avisó" }),
      turno("2026-11-23", "10:00", 30, "CANCELADO", { motivoCancelacion: "  paciente   AVISO " }),
      turno("2026-11-24", "10:00", 30, "CANCELADO", { motivoCancelacion: "Enfermedad" }),
    ];
    expect(agruparMotivos(turnos, SEMANA)).toEqual([
      { motivo: "Paciente avisó", cantidad: 2 },
      { motivo: "Enfermedad", cantidad: 1 },
    ]);
    expect(normalizarMotivo("  Paciente   AVISÓ ")).toBe("paciente aviso");
  });

  it("RN-ST-05 error: turnos no cancelados o fuera del período no aportan motivos; vacío → Sin motivo", () => {
    const turnos = [
      turno("2026-11-23", "09:00", 30, "ATENDIDO", { motivoCancelacion: "No debería contar" }),
      turno("2026-11-30", "09:00", 30, "CANCELADO", { motivoCancelacion: "Fuera del período" }),
      turno("2026-11-24", "09:00", 30, "CANCELADO", { motivoCancelacion: "   " }),
    ];
    expect(agruparMotivos(turnos, SEMANA)).toEqual([{ motivo: "Sin motivo", cantidad: 1 }]);
  });

  it("RN-ST-05 borde: sin turnos → sin motivos y cancelaciones Sin datos", () => {
    const r = armarReporte(datos({}), SEMANA, null);
    expect(r.motivos).toEqual([]);
    expect(formatearPorcentaje(r.actual.cancelaciones)).toBe(SIN_DATOS);
  });
});

describe("desglose por profesional y por prestación (RN-ST-02 a RN-ST-05)", () => {
  it("RN-ST-02 RN-ST-05 Dr. Joaquín Cortez con 4 turnos (3 Consulta, 1 Limpieza) y 1 cancelado", () => {
    const turnos = [
      turno("2026-11-02", "09:00", 30, "ATENDIDO"),
      turno("2026-11-03", "09:00", 30, "ATENDIDO"),
      turno("2026-11-04", "09:00", 30, "CANCELADO"),
      turno("2026-11-05", "09:00", 30, "AUSENTE", { prestacionId: LIMPIEZA }),
    ];
    const r = armarReporte(datos({ turnos, franjas: [franja(1, "09:00", "12:00")] }), NOVIEMBRE, null);
    const fila = r.profesionales.find((p) => p.profesional.id === CORTEZ)!;
    expect(fila.indicadores.turnosDados).toBe(4);
    expect(formatearPorcentaje(fila.indicadores.cancelaciones)).toBe("25,0%");
    expect(fila.prestacionMasDada).toBe("Consulta");
    expect(turnosPorPrestacion(turnos, NOVIEMBRE, PRESTACIONES)).toEqual([
      { prestacionId: CONSULTA, nombre: "Consulta", cantidad: 3 },
      { prestacionId: LIMPIEZA, nombre: "Limpieza", cantidad: 1 },
    ]);
  });

  it("RN-ST-03 RN-ST-04 RN-ST-05 borde: profesional activo sin turnos ni franjas → 0 turnos y Sin datos", () => {
    const r = armarReporte(datos({ turnos: varios(2, "ATENDIDO") }), SEMANA, null);
    const fila = r.profesionales.find((p) => p.profesional.id === DE_CONINCK)!;
    expect(fila.indicadores.turnosDados).toBe(0);
    expect(fila.indicadores.ocupacion).toBeNull();
    expect(fila.indicadores.ausentismo).toBeNull();
    expect(fila.indicadores.cancelaciones).toBeNull();
    expect(fila.prestacionMasDada).toBeNull();
  });

  it("RN-ST-02 error: filtrar por un profesional inexistente muestra a todos; uno válido limita todos los indicadores", () => {
    const turnos = [...varios(3, "ATENDIDO"), ...varios(2, "AUSENTE", "2026-11-24", { profesionalId: DE_CONINCK })];
    expect(resolverProfesional("no-existe", PROFESIONALES)).toBeNull();
    expect(resolverProfesional(["a", "b"], PROFESIONALES)).toBeNull();
    const todos = armarReporte(datos({ turnos }), SEMANA, resolverProfesional("no-existe", PROFESIONALES));
    expect(todos.actual.turnosDados).toBe(5);
    expect(todos.profesionales).toHaveLength(2);
    const uno = armarReporte(datos({ turnos }), SEMANA, resolverProfesional(DE_CONINCK, PROFESIONALES));
    expect(uno.profesionalId).toBe(DE_CONINCK);
    expect(uno.actual.turnosDados).toBe(2);
    expect(formatearPorcentaje(uno.actual.ausentismo)).toBe("100,0%");
    expect(uno.profesionales.map((p) => p.profesional.id)).toEqual([DE_CONINCK]);
  });

  it("RN-ST-02 un profesional inactivo aparece solo si tuvo turnos en el período; empate de prestación → alfabético", () => {
    const inactivo: ProfesionalEstadistica = { id: "prof-inactivo", nombre: "Dra. Ficticia Inactiva", especialidad: null, avatar: null, activo: false };
    const turnos = [turno("2026-11-23", "09:00", 30, "ATENDIDO", { profesionalId: inactivo.id, prestacionId: LIMPIEZA }), turno("2026-11-23", "10:00", 30, "ATENDIDO", { profesionalId: inactivo.id })];
    const con = armarReporte(datos({ turnos, profesionales: [...PROFESIONALES, inactivo] }), SEMANA, null);
    expect(con.profesionales.find((p) => p.profesional.id === inactivo.id)?.prestacionMasDada).toBe("Consulta");
    const sin = armarReporte(datos({ profesionales: [...PROFESIONALES, inactivo] }), SEMANA, null);
    expect(sin.profesionales.some((p) => p.profesional.id === inactivo.id)).toBe(false);
  });
});

describe("reporte completo", () => {
  it("RN-ST-02 RN-ST-06 borde: período sin turnos marca el estado vacío y compara con el anterior", () => {
    const r = armarReporte(datos({ turnos: varios(3, "ATENDIDO", "2026-11-16") }), SEMANA, null);
    expect(r.sinTurnos).toBe(true);
    expect(r.anterior.turnosDados).toBe(3);
    expect(r.periodoAnterior).toEqual({ tipo: "semana", desde: "2026-11-16", hasta: "2026-11-22" });
    expect(r.variaciones.turnosDados?.valor).toBe(-100);
    expect(r.etiqueta).toBe("Semana del 23/11/2026 al 29/11/2026");
    expect(r.comparadoCon).toBe("la semana anterior");
  });
});
