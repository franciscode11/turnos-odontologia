import { useId, type ReactNode } from "react";
import { cn } from "./cn";
import { Icono } from "./icono";

export type CampoProps = {
  etiqueta: ReactNode;
  /** id del control; si falta se genera uno. */
  id?: string;
  ayuda?: ReactNode;
  error?: string;
  obligatorio?: boolean;
  opcional?: boolean;
  /** Acción a la derecha de la etiqueta (por ejemplo un enlace). */
  accionEtiqueta?: ReactNode;
  className?: string;
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string; required?: boolean }) => ReactNode;
};

/**
 * Envoltorio de todo control de formulario: etiqueta, ayuda y error accesibles.
 * Con react-hook-form usá FormField, que lo arma solo.
 */
export function Campo({ etiqueta, id, ayuda, error, obligatorio, opcional, accionEtiqueta, className, children }: CampoProps) {
  const generado = useId();
  const idControl = id ?? generado;
  const idAyuda = ayuda ? `${idControl}-ayuda` : undefined;
  const idError = error ? `${idControl}-error` : undefined;
  const describedBy = [idError, idAyuda].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("field", className)}>
      <label className="label" htmlFor={idControl}>
        {etiqueta}
        {obligatorio ? <span className="req" aria-hidden="true">*</span> : null}
        {opcional ? <span className="opt">Opcional</span> : null}
        {accionEtiqueta}
      </label>
      {children({ id: idControl, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, required: obligatorio || undefined })}
      {error ? (
        <p className="err" id={idError} role="alert">
          <Icono nombre="alert-triangle" />
          {error}
        </p>
      ) : null}
      {ayuda && !error ? <p className="help" id={idAyuda}>{ayuda}</p> : null}
    </div>
  );
}
