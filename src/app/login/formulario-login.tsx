"use client";

import { useActionState } from "react";
import { Boton, Campo, Entrada, Icono } from "@/components/ui";
import { iniciarSesion, type EstadoLogin } from "@/server/auth/login";

export function FormularioLogin({ errorInicial }: { errorInicial?: string }) {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(iniciarSesion, { error: errorInicial });
  return (
    <form className="auth-form" action={accion} noValidate>
      <h1>Ingresá al consultorio</h1>
      <p className="lead">Usá el email con el que te invitaron.</p>
      <div className="stack-lg">
        {estado.error ? (
          <p className="err" role="alert">
            <Icono nombre="alert-triangle" />
            {estado.error}
          </p>
        ) : null}
        <Campo etiqueta="Email">
          {(p) => (
            <Entrada {...p} name="email" tipo="email" iconoInicial="mail" autoComplete="email" placeholder="nombre@consultorio.com" defaultValue={estado.email} />
          )}
        </Campo>
        <Campo etiqueta="Contraseña">
          {(p) => <Entrada {...p} name="contrasena" tipo="password" iconoInicial="lock" autoComplete="current-password" />}
        </Campo>
        <Boton type="submit" bloque cargando={enviando} iconoFinal="arrow-right" style={{ height: 40, marginTop: 4 }}>
          Ingresar
        </Boton>
      </div>
    </form>
  );
}
