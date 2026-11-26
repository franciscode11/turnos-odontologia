# Design

## Context

Ver `proposal.md` (Why) y `docs/explore/equipo-invitaciones.md`. Restricciones que definen el enfoque:

- `Usuario.id` es el id del usuario de Supabase Auth, así que la fila se crea después de invitar.
- `email` y `profesionalId` son únicos en la tabla; un CHECK exige `profesionalId` si y solo si el rol es `PROFESIONAL`.
- `leerSesion` (C-01) ya rechaza a usuarios `INVITADO` e `INACTIVO`: cambiar el estado en la tabla alcanza para cortar el acceso.
- La activación (`/activar-cuenta`, `activarCuenta`) ya existe y no se toca.
- Los tests no tienen base ni Supabase: toda dependencia externa se inyecta.
- Governance CRITICO: nada se mergea sin revisión del líder.

## Goals / Non-Goals

**Goals:**
- Reglas de equipo como funciones puras en `src/domain/equipo/` con un test por escenario.
- Acciones con el patrón de `src/server/horarios/`: fábrica con dependencias inyectadas + archivo `"use server"` que la conecta con `requireRol`, Prisma, el cliente admin de Supabase y `revalidatePath("/equipo")`.
- La clave secreta solo en un módulo `server-only`.

**Non-Goals:**
- Cambiar el login para registrar `ultimoIngreso` (fuera de la Zona; pedido al líder).
- Bloquear al usuario desactivado en Supabase Auth (`ban_duration`): la tabla ya corta el acceso.
- Componentes nuevos de UI (`Menu`, badge de estado de usuario): se piden al líder.
- Editar nombre o avatar de otros usuarios.

## Decisions

### D1. Orden de la invitación con compensación
`inviteUserByEmail(email, { redirectTo: <origen>/activar-cuenta/verificar })` primero (devuelve el id), después `usuario.create` con `estado INVITADO`, `rol`, `profesionalId`, `invitadoPorId`, `invitadoEn = ahora`. Si el create falla, `auth.admin.deleteUser(id)` y se devuelve el error (traduciendo `P2002` a email o profesional en uso). *Alternativa:* crear la fila con un id provisorio y actualizarlo; descartada porque `id` es PK referenciada y obliga a dos escrituras.

### D2. Puerto de autenticación (`ServicioAuthAdmin`)
Interfaz con `invitar(email, redirectTo) → { ok, id } | { ok: false, motivo: "ya-confirmado" | "error" }` y `eliminar(id) → { ok } (no existe = ok)`. La implementación real (`supabase-admin.ts`, `server-only`) crea el cliente con `createClient(url, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })` al primer uso, así el build no necesita la variable. Los tests usan un doble en memoria. *Alternativa:* llamar a Supabase directo desde la acción; descartada porque impide testear la compensación.

### D3. Origen del enlace
`NEXT_PUBLIC_SITE_URL` si está definida (sin barra final); si no, `x-forwarded-proto` + `x-forwarded-host` (o `host`) de `headers()`. Se inyecta a la fábrica como `origen(): Promise<string>`. La URL no es secreta, por eso puede ser `NEXT_PUBLIC_`.

### D4. Reglas puras
`src/domain/equipo/`:
- `esquemas.ts`: Zod de invitación (`email` normalizado, `rol`, `profesionalId` opcional; si el rol no es PROFESIONAL se descarta), cambio de rol y id de usuario. El mismo esquema usa el formulario.
- `reglas.ts`: `validarInvitacion`, `validarCambioRol`, `validarDesactivacion`, `validarReactivacion`, `validarInvitacionPendiente`, `estadoInvitacion` / `estaVencida` (7 días exactos = vencida) y `adminsActivosRestantes`. Devuelven `null` o `{ mensaje, campo? }`.
- `presentacion.ts`: `estadoVisible` (Activo / Invitación pendiente / vencida / Inactivo), `formatearUltimoIngreso` ("Hoy, HH:mm", "Ayer, HH:mm", "dd/mm/aaaa", "Nunca") y orden de la tabla, sobre `src/domain/shared/fechas.ts`.
- `mensajes.ts`: textos de error en español.

### D5. Datos que necesitan las reglas
El repositorio expone `buscarPorEmail`, `buscarPorId`, `contarAdminsActivos`, `buscarProfesional(id) → { id, usuarioId } | null` y las escrituras (`crearInvitado`, `renovarInvitacion`, `cambiarRol`, `cambiarEstado`, `eliminar`). La regla del último ADMIN se evalúa con el conteo leído en la misma acción. *Riesgo de carrera* entre dos ADMIN que se desactivan a la vez: ver Riesgos.

### D6. Reenvío
Se vuelve a llamar a `inviteUserByEmail`; si el id devuelto coincide, se actualizan `invitadoEn = ahora` e `invitadoPorId = admin actual`. Si Supabase responde que el email ya está registrado (el invitado abrió el enlace), se devuelve el mensaje de D4 sin cambios.

### D7. Revocación
Solo `INVITADO`: `eliminar` en Auth (no existe = ok) y después borrar la fila. Si falla el borrado de la fila, queda una fila sin usuario de Auth que se puede volver a revocar.

### D8. Pantalla
Server Component `page.tsx` con `accesoPagina("equipo.gestionar")` → `SinPermiso` o carga de miembros y profesionales activos sin usuario. Componente cliente `tabla-equipo.tsx` con `Tabla`, `CeldaPersona`/`Avatar iconoSinFoto="mail"`, `Etiqueta`, badge con clases del design system, y un `Dialogo` de acciones por fila (no hay `Menu` en el sistema de componentes) con modos menú → cambiar rol → confirmar desactivar/revocar. `dialogo-invitar.tsx` con `FormField`, `Entrada`, `GrupoRadio` y `Selector` (profesional visible solo si el rol es PROFESIONAL). Toasts con `useToast`.

## UI Mockups

- Design system revision: 3
- Decision: no (project policy)
- Mockups: no aplica; referencia aprobada `design-system/screens/equipo.html`.
- Approval: no aplica (project policy).
- Preview: no aplica.
- Visual verify: manual (2026-11-26): comparar `/equipo` con `design-system/screens/equipo.html` en 390x844 y 1440x900.

## Risks / Trade-offs

- [El enlace de Supabase vence antes de 7 días (máx. 24 h)] → la tabla marca vencida a los 7 días (RN-EQ-04) y se documenta subir *Email OTP Expiration* al máximo; queda como pregunta al líder.
- [Límite de emails del SMTP integrado, P-06] → el error de envío se informa sin crear filas; se documenta configurar SMTP propio.
- [Carrera entre dos ADMIN que se quitan el rol o se desactivan a la vez] → baja probabilidad en un consultorio; además nadie puede desactivarse a sí mismo, así que siempre queda quien hizo la acción.
- [Fallo de la compensación (deleteUser también falla)] → se registra en consola del servidor y el error indica revisar Supabase; el reintento de invitar avisa "ya registrado".
- [`ultimoIngreso` no se actualiza en el login] → se muestra lo que haya; pedido al líder.

## Migration Plan

Sin migraciones. Deploy: cargar `SUPABASE_SECRET_KEY` (y opcional `NEXT_PUBLIC_SITE_URL`) en Vercel y hacer la configuración de Supabase de `docs/explore/equipo-invitaciones.md`. Rollback: revertir el merge; las filas `INVITADO` creadas se pueden revocar desde el dashboard de Supabase y la tabla.

## Open Questions

- ¿Se acepta que el enlace real venza a las 24 h y que los 7 días sean el indicador de la tabla? No cambia la implementación.
- P-06: ¿SMTP propio para la demo? Es configuración, no código.
