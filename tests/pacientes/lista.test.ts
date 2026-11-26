import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ListaPacientes } from "@/app/(panel)/pacientes/lista-pacientes";
import { ProveedorToast } from "@/components/ui";

vi.mock("@/server/pacientes/acciones", () => ({
  buscarPacientes: vi.fn(),
  crearPaciente: vi.fn(),
  editarPaciente: vi.fn(),
  darDeBajaPaciente: vi.fn(),
}));

const paciente = {
  id: "00000000-0000-4000-8000-000000000001",
  nombre: "Paciente",
  apellido: "Ejemplo",
  dni: "30123456",
  fechaNacimiento: "1990-03-12",
  telefono: "0000000000",
  email: null,
  obraSocial: null,
  numeroAfiliado: null,
  avatar: null,
};

function mostrar(puedeEditar: boolean, pacientes = [paciente]) {
  return renderToStaticMarkup(createElement(
    ProveedorToast,
    null,
    createElement(ListaPacientes, {
      puedeEditar, inicial: { ok: true, data: { pacientes, pagina: 1, paginas: 1 } },
    }),
  ));
}

describe("listado de pacientes", () => {
  it("permite consultar a PROFESIONAL y oculta todas las acciones de escritura", () => {
    const pantalla = mostrar(false);
    expect(pantalla).toContain("30123456");
    expect(pantalla).toContain("Buscar por apellido o DNI");
    expect(pantalla).not.toMatch(/Nuevo paciente|Editar paciente|Dar de baja/);
  });

  it("ofrece alta, edición y baja al rol con permiso de escritura", () => {
    const pantalla = mostrar(true);
    expect(pantalla).toContain("Nuevo paciente");
    expect(pantalla).toContain("Editar paciente");
    expect(pantalla).toContain("Dar de baja");
    expect(pantalla).not.toContain("¿Dar de baja a");
  });

  it("muestra un estado vacío si no hay pacientes activos", () => {
    expect(mostrar(false, [])).toContain("No hay pacientes activos");
  });
});
