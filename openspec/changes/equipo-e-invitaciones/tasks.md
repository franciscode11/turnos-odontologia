# Tasks

## 1. Dominio de equipo (TDD)

- [ ] 1.1 Escribir `tests/equipo/invitacion.test.ts` (RN-EQ-02, RN-EQ-03) y después `src/domain/equipo/esquemas.ts`, `reglas.ts` y `mensajes.ts` hasta que pasen con `npm test`
- [ ] 1.2 Escribir `tests/equipo/reglas-usuario.test.ts` (RN-EQ-06, RN-EQ-07, cambio de rol, desactivar/reactivar, invitación pendiente) e implementar las reglas hasta verlo en verde
- [ ] 1.3 Escribir `tests/equipo/vencimiento.test.ts` (RN-EQ-04) y `tests/equipo/presentacion.test.ts` (estado visible, último ingreso en hora de Argentina) e implementar `presentacion.ts` hasta verlo en verde
- [ ] 1.4 Escribir `tests/equipo/activacion.test.ts` sobre la política de contraseña existente (RN-EQ-05) y verificar que pasa sin cambiar código compartido

## 2. Server Actions (TDD)

- [ ] 2.1 Definir tipos y puertos en `src/server/equipo/tipos.ts` y escribir `tests/equipo/acciones.test.ts` con dobles de repositorio y de Auth (permisos, invitar feliz, email en uso, sin profesional, compensación, reenviar, revocar, cambiar rol, desactivar, reactivar)
- [ ] 2.2 Implementar la fábrica `src/server/equipo/fabrica.ts` (requireRol ADMIN + Zod + dominio + conAcceso + revalidar) hasta que `tests/equipo/acciones.test.ts` pase
- [ ] 2.3 Implementar `supabase-admin.ts` (server-only, clave secreta), `origen.ts`, `repositorio.ts` (Prisma), `consultas.ts`, `instancia.ts` y `acciones.ts` ("use server") y verificar con `npm run typecheck`

## 3. Pantalla /equipo

- [ ] 3.1 Reemplazar `src/app/(panel)/equipo/page.tsx` con la tabla de la referencia (SinPermiso para otros roles, estado vacío) y verificar con `npm run lint` y `npm run build`
- [ ] 3.2 Agregar el diálogo Invitar y el diálogo de acciones por fila con confirmaciones y toasts, y verificar que lint no reporta controles nativos

## 4. Documentación y verificación

- [ ] 4.1 Completar "Configuración en Supabase" en `docs/explore/equipo-invitaciones.md` y agregar `NEXT_PUBLIC_SITE_URL` vacía a `.env.example` (si el entorno lo permite), verificando que el documento cubre URL, plantilla, registro público y P-06
- [ ] 4.2 Correr `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` sin `.env` y `openspec validate equipo-e-invitaciones --strict`, todo en verde

## Workflow follow-up

- `openspec archive equipo-e-invitaciones --yes` para sincronizar la spec.
- Marcar la ficha C-07 como `[x]` en `CHANGES.md` solo con todo en verde.
- Revisión humana del líder (governance CRITICO) antes del PR.
