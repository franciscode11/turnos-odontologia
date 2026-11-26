# Proposal

## Why

No hay registro público (RN-AU-01, DD-15): hoy solo existe el ADMIN del seed y nadie más del consultorio puede entrar. Falta la pantalla Equipo para que el ADMIN invite por email con un rol, administre invitaciones pendientes, cambie roles y desactive o reactive personas sin dejar nunca al consultorio sin un ADMIN activo (US-060, Flujo 6).

## What Changes

- Reglas puras de equipo: validación de invitación (email libre, rol, profesional vinculado libre si el rol es PROFESIONAL), estado de la invitación (vencida a los 7 días desde `invitadoEn`), cambio de rol, desactivación y reactivación con la regla del último ADMIN activo y la prohibición de desactivarse a sí mismo.
- Server Actions solo para ADMIN: `invitarMiembro` (Supabase Auth `inviteUserByEmail` desde el servidor con la clave secreta + fila `Usuario` en `INVITADO`, con compensación si falla), `reenviarInvitacion`, `revocarInvitacion`, `cambiarRol`, `desactivarUsuario`, `reactivarUsuario`.
- Pantalla `/equipo` según `design-system/screens/equipo.html`: tabla de personas con avatar, rol, estado y último ingreso; diálogo "Invitar"; acciones por fila con confirmación para desactivar y revocar; toasts y estado vacío. Otros roles ven "Sin permisos".
- La activación (`/activar-cuenta`, RN-EQ-05) ya existe desde C-01 y no cambia; se cubre con tests de la política de contraseña.
- Documentación de la configuración de Supabase que hace el líder (URL, plantilla "Invite user", registro público, límite de emails P-06).

## Capabilities

### New Capabilities
- `equipo-e-invitaciones`: alta de miembros por invitación, ciclo de vida de la invitación (pendiente, vencida, reenviada, revocada) y administración de roles y estado de los usuarios del consultorio.

### Modified Capabilities
<!-- Ninguna: `autenticacion` ya define la activación de la cuenta invitada y no cambia. -->

## Impact

- Código nuevo: `src/domain/equipo/`, `src/server/equipo/`, `src/app/(panel)/equipo/`, `tests/equipo/`.
- Dependencias existentes: `@supabase/supabase-js` (API admin, solo servidor), Prisma (`Usuario`, `Profesional`), `src/server/auth`, `src/components/ui`.
- Variables: `SUPABASE_SECRET_KEY` (ya documentada, solo servidor) y la opcional `NEXT_PUBLIC_SITE_URL` para armar el enlace; sin ella se deduce del request.
- Sin cambios de esquema ni migraciones. Configuración manual en el dashboard de Supabase (ver `docs/explore/equipo-invitaciones.md`).
