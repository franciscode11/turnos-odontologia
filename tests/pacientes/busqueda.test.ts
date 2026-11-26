import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { programarBusqueda } from "@/app/(panel)/pacientes/busqueda";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe("búsqueda de pacientes en pantalla", () => {
  it("espera 250 ms y cancela un filtro que se reemplazó antes de consultar", async () => {
    const anterior = vi.fn(async () => "anterior");
    const actual = vi.fn(async () => "actual");
    const recibir = vi.fn();
    const cancelar = programarBusqueda(anterior, recibir, vi.fn());
    await vi.advanceTimersByTimeAsync(100);
    cancelar();
    programarBusqueda(actual, recibir, vi.fn());
    await vi.advanceTimersByTimeAsync(249);
    expect(anterior).not.toHaveBeenCalled();
    expect(actual).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(recibir).toHaveBeenCalledExactlyOnceWith("actual");
  });

  it("descarta una respuesta que llega después de cambiar de filtro", async () => {
    let completarAnterior!: (valor: string) => void;
    const anterior = new Promise<string>((resolve) => { completarAnterior = resolve; });
    const recibir = vi.fn();
    const cancelar = programarBusqueda(() => anterior, recibir, vi.fn(), 0);
    await vi.advanceTimersByTimeAsync(0);
    cancelar();
    programarBusqueda(async () => "vigente", recibir, vi.fn(), 0);
    await vi.advanceTimersByTimeAsync(0);
    completarAnterior("obsoleto");
    await Promise.resolve();
    expect(recibir).toHaveBeenCalledExactlyOnceWith("vigente");
  });

  it("devuelve un fallo del filtro vigente para que la interfaz permita recuperarse", async () => {
    const alFallar = vi.fn();
    const recibir = vi.fn();
    programarBusqueda(async () => { throw new Error("error de prueba"); }, recibir, alFallar);
    await vi.advanceTimersByTimeAsync(250);
    expect(alFallar).toHaveBeenCalledOnce();
    expect(recibir).not.toHaveBeenCalled();
  });
});
