import { forwardRef, type InputHTMLAttributes } from "react";

export type CampoOcultoProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children">;

/**
 * Campo oculto (hidden): registra un valor en el formulario (por ejemplo el id del turno)
 * sin usar un `<input>` crudo en los módulos. Funciona con `register` de react-hook-form:
 *   <CampoOculto {...form.register("turnoId")} />
 */
export const CampoOculto = forwardRef<HTMLInputElement, CampoOcultoProps>(function CampoOculto(props, ref) {
  return <input ref={ref} type="hidden" {...props} />;
});
