import { describe, expect, it } from "vitest";
import { EstadoTurno } from "@/generated/prisma/enums";
import {
  ESTADOS_FINALES,
  ESTADOS_QUE_OCUPAN_AGENDA,
  ESTADOS_TURNO,
  ocupaAgenda,
} from "@/domain/shared/estados";

describe("estados del turno (RN-TU-04)", () => {
  it("RN-TU-04 error de negocio: un turno CANCELADO no ocupa agenda", () => {
    expect(ocupaAgenda("CANCELADO")).toBe(false);
  });

  it("RN-TU-04 feliz: un turno AUSENTE sigue ocupando agenda", () => {
    expect(ocupaAgenda("AUSENTE")).toBe(true);
    expect(ocupaAgenda("RESERVADO")).toBe(true);
    expect(ocupaAgenda("CONFIRMADO")).toBe(true);
    expect(ocupaAgenda("ATENDIDO")).toBe(true);
  });

  it("RN-TU-04 borde: la lista es exactamente todos los estados menos CANCELADO (igual que el EXCLUDE de la base)", () => {
    const esperados = ESTADOS_TURNO.filter((e) => e !== "CANCELADO");
    expect([...ESTADOS_QUE_OCUPAN_AGENDA].sort()).toEqual([...esperados].sort());
  });

  it("los estados del dominio coinciden con el enum del esquema de Prisma", () => {
    expect([...ESTADOS_TURNO].sort()).toEqual(Object.values(EstadoTurno).sort());
  });

  it("los estados finales son CANCELADO, ATENDIDO y AUSENTE", () => {
    expect([...ESTADOS_FINALES].sort()).toEqual(["ATENDIDO", "AUSENTE", "CANCELADO"]);
  });
});
