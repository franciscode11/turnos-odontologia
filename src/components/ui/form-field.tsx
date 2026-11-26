"use client";

import type { ReactNode } from "react";
import { Controller, type Control, type ControllerRenderProps, type FieldPath, type FieldValues } from "react-hook-form";
import { Campo } from "./campo";

/** Props accesibles que FormField le pasa al control (además de `campo`). */
export type PropsControlFormulario = {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
};

export type FormFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  control: Control<T>;
  name: N;
  etiqueta: ReactNode;
  ayuda?: ReactNode;
  obligatorio?: boolean;
  opcional?: boolean;
  accionEtiqueta?: ReactNode;
  disabled?: boolean;
  className?: string;
  /**
   * Dibuja el control. `control` trae id y aria-* (spread directo) y `campo` trae
   * value, onChange, onBlur, name, ref y disabled de react-hook-form.
   */
  children: (props: { control: PropsControlFormulario; campo: ControllerRenderProps<T, N> }) => ReactNode;
};

/**
 * Conecta react-hook-form + el error del esquema Zod con `Campo` y cualquier control de este sistema.
 *
 * - El mensaje de error sale del esquema (`z.string().min(1, "Ingresá el teléfono")`).
 * - Al enviar con errores, react-hook-form enfoca el primer campo inválido (`shouldFocusError`,
 *   activo por defecto): por eso cada control reenvía `ref` a su elemento enfocable.
 * - `obligatorio` marca la etiqueta y usa `aria-required` (no `required`), para que el navegador
 *   no muestre su propia validación encima de la del esquema. Usá `<form noValidate>`.
 *
 * Ejemplo:
 *
 *   const esquema = z.object({
 *     telefono: z.string().trim().min(1, "Ingresá el teléfono"),
 *     prestacion: z.string().min(1, "Elegí una prestación"),
 *   });
 *   type Datos = z.infer<typeof esquema>;
 *
 *   const form = useForm<Datos>({ resolver: zodResolver(esquema), defaultValues: { telefono: "", prestacion: "" } });
 *
 *   <form noValidate onSubmit={form.handleSubmit(guardar)}>
 *     <FormField control={form.control} name="telefono" etiqueta="Teléfono" obligatorio>
 *       {({ control, campo }) => <Entrada tipo="tel" {...control} {...campo} />}
 *     </FormField>
 *     <FormField control={form.control} name="prestacion" etiqueta="Prestación" obligatorio>
 *       {({ control, campo }) => (
 *         <Selector {...control} ref={campo.ref} name={campo.name} valor={campo.value} alCambiar={campo.onChange} onBlur={campo.onBlur} opciones={PRESTACIONES} />
 *       )}
 *     </FormField>
 *     <Boton type="submit" cargando={form.formState.isSubmitting}>Guardar</Boton>
 *   </form>
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control, name, etiqueta, ayuda, obligatorio, opcional, accionEtiqueta, disabled, className, children,
}: FormFieldProps<T, N>) {
  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Campo
          etiqueta={etiqueta}
          ayuda={ayuda}
          error={fieldState.error?.message}
          obligatorio={obligatorio}
          opcional={opcional}
          accionEtiqueta={accionEtiqueta}
          className={className}
        >
          {({ id, "aria-invalid": invalido, "aria-describedby": describedBy }) =>
            children({
              control: { id, "aria-invalid": invalido, "aria-describedby": describedBy, "aria-required": obligatorio ? true : undefined },
              campo: field,
            })
          }
        </Campo>
      )}
    />
  );
}
