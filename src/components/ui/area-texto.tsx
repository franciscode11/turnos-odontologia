"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export type AreaTextoProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Área de texto (textarea) con el estilo de los controles; crece en alto con `rows` o con el usuario. */
export const AreaTexto = forwardRef<HTMLTextAreaElement, AreaTextoProps>(function AreaTexto({ className, ...resto }, ref) {
  return <textarea ref={ref} className={cn("control", className)} {...resto} />;
});
