"use client";

import { useActionState, useState } from "react";
import { Boton, Campo, Entrada, Icono } from "@/components/ui";
import { reglasContrasena } from "@/domain/shared/contrasena";
import { activarCuenta, type EstadoActivacion } from "@/server/auth/activacion";

export function FormularioActivacion({ email }: { email: string }) {
  const [estado, accion, enviando] = useActionState<EstadoActivacion, FormData>(activarCuenta, {});
  const [contrasena, setContrasena] = useState("");
  const reglas = reglasContrasena(contrasena);
  return (
    <form action={accion} noValidate className="stack-lg">
      {estado.error ? (
        <p className="err" role="alert"><Icono nombre="alert-triangle" />{estado.error}</p>
      ) : null}
      <Campo etiqueta="Nombre y apellido" error={estado.campos?.nombre} obligatorio>
        {(p) => <Entrada {...p} name="nombre" autoComplete="name" />}
      </Campo>
      <Campo etiqueta="Email">
        {(p) => <Entrada {...p} name="email" tipo="email" value={email} disabled readOnly />}
      </Campo>
      <Campo etiqueta="Contraseña" error={estado.campos?.contrasena} obligatorio>
        {(p) => (
          <div>
            <Entrada {...p} name="contrasena" tipo="password" autoComplete="new-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            <ul className="rules" aria-live="polite">
              <li className={reglas.largo ? "ok" : undefined}><Icono nombre={reglas.largo ? "check" : "circle-dashed"} tamano="sm" />Al menos 10 caracteres</li>
              <li className={reglas.numero ? "ok" : undefined}><Icono nombre={reglas.numero ? "check" : "circle-dashed"} tamano="sm" />Un número</li>
            </ul>
          </div>
        )}
      </Campo>
      <Boton type="submit" bloque cargando={enviando} iconoFinal="arrow-right" style={{ height: 40 }}>
        Activar cuenta
      </Boton>
    </form>
  );
}
