import { describe, expect, it } from "vitest";
import type { Rol } from "@/generated/prisma/enums";
import { crearControlDeAcceso, type UsuarioSesion } from "@/server/auth/acceso";
import { PERMISOS } from "@/server/auth/matriz";
import { ROLES_ESTADISTICAS, crearConsultaEstadisticas, type RepositorioEstadisticas } from "@/server/estadisticas/consulta";
import { periodoMes } from "@/domain/estadisticas/periodos";
import type { DatosEstadisticas } from "@/domain/estadisticas/reporte";
import { CONSULTA, CORTEZ, varios } from "./fabricas";

const NOVIEMBRE = periodoMes("2026-11-26");

function usuario(rol: Rol): UsuarioSesion {
  const nombres: Record<Rol, string> = { ADMIN: "francisco.valles", RECEPCION: "octavio.crescini", PROFESIONAL: "joaquin.cortez" };
  return { id: `u-${rol}`, email: `${nombres[rol]}@example.com`, nombre: null, rol, profesionalId: null, avatar: null };
}

function repoFalso(datos: DatosEstadisticas) {
  const registro = { lecturas: 0, rangos: [] as { inicio: Date; fin: Date }[] };
  const repo: RepositorioEstadisticas = {
    async leerDatos(rango) {
      registro.lecturas += 1;
      registro.rangos.push(rango);
      return datos;
    },
  };
  return { repo, registro };
}

const DATOS: DatosEstadisticas = {
  turnos: [...varios(10, "ATENDIDO", "2026-11-02"), ...varios(2, "AUSENTE", "2026-11-10")],
  franjas: [],
  bloqueos: [],
  profesionales: [{ id: CORTEZ, nombre: "Dr. Joaquín Cortez", especialidad: "Odontología general", avatar: null, activo: true }],
  prestaciones: [{ id: CONSULTA, nombre: "Consulta" }],
};

function consultaComo(sesion: UsuarioSesion | null) {
  const { repo, registro } = repoFalso(DATOS);
  const { requireRol } = crearControlDeAcceso(async () => sesion);
  return { consulta: crearConsultaEstadisticas({ requireRol, repo }), registro };
}

describe("acceso exclusivo del ADMIN (RN-ST-01)", () => {
  it("RN-ST-01 el ADMIN consulta noviembre y recibe los indicadores; se lee del inicio de octubre al fin de noviembre", async () => {
    const { consulta, registro } = consultaComo(usuario("ADMIN"));
    const r = await consulta.consultar(NOVIEMBRE, undefined);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.reporte.actual.turnosDados).toBe(12);
    expect(r.data.reporte.actual.ausentismo).toBeCloseTo(2 / 12, 10);
    expect(r.data.profesionales).toHaveLength(1);
    expect(registro.lecturas).toBe(1);
    expect(registro.rangos[0]!.inicio.toISOString()).toBe("2026-10-01T03:00:00.000Z");
    expect(registro.rangos[0]!.fin.toISOString()).toBe("2026-12-01T03:00:00.000Z");
  });

  it("RN-ST-01 error: RECEPCION y PROFESIONAL reciben Sin permisos y no se leen turnos", async () => {
    for (const rol of ["RECEPCION", "PROFESIONAL"] as const) {
      const { consulta, registro } = consultaComo(usuario(rol));
      expect(await consulta.consultar(NOVIEMBRE, undefined)).toEqual({ ok: false, error: "Sin permisos" });
      expect(registro.lecturas).toBe(0);
    }
  });

  it("RN-ST-01 borde: sin sesión → No autenticado sin leer datos", async () => {
    const { consulta, registro } = consultaComo(null);
    expect(await consulta.consultar(NOVIEMBRE, undefined)).toEqual({ ok: false, error: "No autenticado" });
    expect(registro.lecturas).toBe(0);
  });

  it("RN-ST-01 los roles de la consulta coinciden con la matriz (estadisticas.ver)", () => {
    expect([...ROLES_ESTADISTICAS]).toEqual([...PERMISOS["estadisticas.ver"]]);
  });
});
