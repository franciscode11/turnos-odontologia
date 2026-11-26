# Explore: C-07 equipo-e-invitaciones

- **Fecha:** 2026-11-26
- **Responsable:** francisco-valles (líder)
- **Modo:** SDD (ciclo OPSX). Governance: CRITICO (auth e invitaciones): todo queda para revisión humana antes del merge.
- **Fuentes leídas:** ficha C-07 de `CHANGES.md`, `knowledge-base/03` (matriz y rutas), `04` (§Usuario), `05` (§RN-AU, §RN-EQ), `06` (US-060), `07` (§Flujo 2, §Flujo 6), `08` (§Seguridad, §Variables de entorno), `09` (DD-15), `10` (P-06), `prisma/schema.prisma`, `src/server/auth/*`, `src/server/resultado.ts`, `src/app/activar-cuenta/*`, `src/components/ui/*`, `design-system/screens/equipo.html` y los módulos ya mergeados (`src/server/catalogo/`, `src/server/horarios/`).

## 1. Qué pide la ficha

- **Resultado:** el ADMIN invita por email con un rol desde `/equipo`; el invitado activa su cuenta en `/activar-cuenta` y entra a la agenda; invitar como Profesional sin profesional vinculado se rechaza; no se puede desactivar al último ADMIN.
- **Zona:** `src/app/(panel)/equipo/`, `src/app/activar-cuenta/`, `src/domain/equipo/`, `src/server/equipo/`, `tests/equipo/`.
- **Acciones:** `invitarMiembro`, `reenviarInvitacion`, `revocarInvitacion`, `cambiarRol`, `desactivarUsuario` (más `reactivarUsuario`, pedida por el líder) y `activarCuenta`.

## 2. Qué ya existe (C-01) y se reutiliza sin modificar

| Pieza | Dónde | Uso |
|---|---|---|
| Modelo `Usuario` | `prisma/schema.prisma` | `id` = id de Supabase Auth, `email @unique`, `rol`, `estado` (INVITADO/ACTIVO/INACTIVO), `invitadoPorId`, `invitadoEn`, `ultimoIngreso`, `profesionalId @unique`, `avatar`. CHECK rol PROFESIONAL ⇔ profesionalId. |
| Activación | `src/server/auth/activacion.ts`, `src/app/activar-cuenta/` | Ya verifica `token_hash&type=invite`, pide nombre y contraseña (RN-EQ-05, `esquemaActivacion`) y pasa a ACTIVO. **`activarCuenta` ya está hecha**: C-07 no la reescribe; agrega tests de la política con el código RN correcto. |
| Control de acceso | `src/server/auth` | `requireRol(["ADMIN"])`, `accesoPagina("equipo.gestionar")` (solo ADMIN). `leerSesion` ya expulsa a INVITADO/INACTIVO (RN-AU-05): desactivar en la tabla alcanza para cortar el acceso. |
| Resultado | `src/server/resultado.ts` | `Resultado`, `exito`, `fallo`, `conAcceso`. |
| UI | `src/components/ui` | `Tabla`, `CeldaPersona`, `Avatar` (con `iconoSinFoto="mail"`), `Dialogo`, `FormField`, `GrupoRadio`, `Selector`, `Entrada`, `Boton`, `Etiqueta`, `useToast`, `TablaVacia`. |
| Fechas | `src/domain/shared/fechas.ts` | `fechaLocal`, `formatearHora`, `sumarDias` en hora de Argentina. |

## 3. Reglas que aplican

- **RN-AU-01:** sin registro público; el resto entra por invitación del ADMIN.
- **RN-AU-02:** un único rol por usuario.
- **RN-AU-05:** solo ACTIVO opera.
- **RN-EQ-01:** solo ADMIN invita, reenvía, revoca, cambia roles y desactiva.
- **RN-EQ-02:** email + rol; el email no puede pertenecer a un ACTIVO o INVITADO.
- **RN-EQ-03:** rol PROFESIONAL exige profesional vinculado sin otro usuario.
- **RN-EQ-04:** la invitación vence a los 7 días; vencida, solo sirve reenviarla.
- **RN-EQ-05:** al activar, nombre + contraseña (10 caracteres y un número) → ACTIVO.
- **RN-EQ-06:** siempre al menos un ADMIN activo (no se desactiva ni se le cambia el rol al último).
- **RN-EQ-07:** desactivar no borra.

## 4. Huecos y decisiones tomadas (para revisión del líder)

1. **Orden invitar → fila.** El Flujo 6 dice "crea el Usuario y llama a `inviteUserByEmail`", pero `Usuario.id` es el id de Auth, que solo existe después de invitar. Orden: (1) `inviteUserByEmail`, (2) crear la fila `INVITADO`; si (2) falla, se compensa borrando el usuario de Auth.
2. **Email de un usuario INACTIVO.** RN-EQ-02 solo prohíbe ACTIVO/INVITADO, pero `email` es único en la tabla: no se puede crear otra fila. Se rechaza con un mensaje que indica reactivarlo desde la tabla (consecuencia del esquema, no regla nueva).
3. **Vencimiento de 7 días vs. Supabase.** El enlace de Supabase vence según *Email OTP Expiration* (máximo 86 400 s = 24 h). El sistema calcula "vencida" a los 7 días desde `invitadoEn` (RN-EQ-04) para mostrarlo y ofrecer reenviar, pero el enlace real puede vencer antes. **Pregunta para el líder** (ver §6).
4. **Reenviar.** `inviteUserByEmail` sobre un usuario de Auth todavía sin confirmar vuelve a mandar el email con el mismo id; se actualiza `invitadoEn` e `invitadoPorId`. Si la persona ya abrió el enlace (Auth confirmado) Supabase rechaza el reenvío: se informa que complete la activación o que se revoque y se vuelva a invitar.
5. **Revocar.** Solo invitaciones (estado INVITADO). Borra primero el usuario de Auth (un "no existe" se toma como ya borrado) y después la fila. Un INVITADO no puede tener turnos ni historial, así que borrar no rompe RN-EQ-07.
6. **Desactivar / reactivar.** Desactivar solo aplica a ACTIVO (a un INVITADO se lo revoca); nadie se desactiva a sí mismo; nunca el último ADMIN activo. Reactivar solo aplica a INACTIVO.
7. **Cambiar rol.** Si el nuevo rol es PROFESIONAL exige profesional libre; si deja de ser PROFESIONAL se limpia `profesionalId` (CHECK del esquema). No se puede sacar ADMIN al último ADMIN activo.
8. **Menú de acciones por fila.** El sistema de componentes no tiene `DropdownMenu`: el botón "Opciones" (ícono `dots`) abre un `Dialogo` con las acciones, y las destructivas piden confirmación dentro del mismo diálogo. **Pedido al líder:** sumar un `Menu` al sistema de componentes.
9. **Badge de estado de usuario.** `BadgeEstado` solo acepta estados de turno. Se usan las clases del design system (`badge st-atendido`, `st-reservado`, `st-ausente`, `st-cancelado`) con `Icono`. **Pedido al líder:** un `BadgeEstadoUsuario` en `src/components/ui`.

## 5. Hallazgos fuera de la Zona (no se tocan; se informan)

- `ultimoIngreso` solo se escribe al activar la cuenta; el login (`src/server/auth/login.ts`) no lo actualiza, así que "Último ingreso" queda desactualizado. Pedido al líder: actualizarlo en el login.
- `tests/shared/contrasena.test.ts` cita RN-EQ-04 para la política de contraseña; la regla correcta es RN-EQ-05.
- `src/app/activar-cuenta/page.tsx` dice "La invitación vence en 7 días", que no coincide con el vencimiento real del enlace de Supabase (§4.3).

## 6. Preguntas abiertas

- **P-06 (Media):** ¿alcanza el SMTP integrado de Supabase para la demo o configuramos uno propio? Ver la sección siguiente.
- **Vencimiento:** ¿aceptamos que el enlace venza a las 24 h (máximo de Supabase) y que la regla de 7 días quede como indicador en la tabla, o se ajusta RN-EQ-04?

## Configuración en Supabase

Pasos que el líder tiene que hacer en el dashboard del proyecto (no se pueden versionar):

1. **Authentication → URL Configuration**
   - **Site URL:** la URL pública de Vercel (por ejemplo `https://<proyecto>.vercel.app`). Es la que usa `{{ .SiteURL }}` en las plantillas.
   - **Redirect URLs:** agregar `https://<proyecto>.vercel.app/activar-cuenta/verificar`, `http://localhost:3000/activar-cuenta/verificar` y, si se usan previews, `https://*-<equipo>.vercel.app/activar-cuenta/verificar`. La acción manda `redirectTo = <origen>/activar-cuenta/verificar`; si no está en la lista, Supabase usa la Site URL.
2. **Authentication → Emails → Templates → "Invite user"**: cambiar el enlace del cuerpo por
   ```html
   <a href="{{ .SiteURL }}/activar-cuenta/verificar?token_hash={{ .TokenHash }}&type=invite">Activar mi cuenta</a>
   ```
   (sin `{{ .ConfirmationURL }}`: la ruta `/activar-cuenta/verificar` hace `verifyOtp` con el `token_hash`). Asunto sugerido: "Te invitaron al consultorio".
3. **Authentication → Sign In / Providers → Email**: dejar Email habilitado y **desactivar "Allow new users to sign up"** (RN-AU-01). Las invitaciones del admin siguen funcionando con la clave secreta.
4. **Authentication → Emails → SMTP / Rate Limits (P-06):** con el SMTP integrado el límite de emails es muy bajo (unos pocos por hora) y solo entrega a direcciones del equipo de la organización de Supabase. Para la demo alcanza invitando de a una a cuentas del equipo; para invitar a cualquier email, configurar un SMTP propio (Resend, Brevo, etc.) y subir el límite en **Rate Limits**.
5. **Authentication → Emails → Email OTP Expiration:** subirlo al máximo (86 400 s) para que el enlace dure lo más posible (ver §4.3).
6. **Variables de entorno en Vercel:** `SUPABASE_SECRET_KEY` (solo servidor, nunca `NEXT_PUBLIC_`) y, opcional, `NEXT_PUBLIC_SITE_URL` con la URL pública. Si no está, el origen del enlace se deduce del request (`x-forwarded-host` / `host`).
