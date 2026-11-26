# Tasks

> Criterio de aceptación visual: `design-system/screens/` y `design-system/components.html` (Revision 3). Orden pensado para mergear rápido lo que desbloquea al equipo (grupos 1 a 7) y completar el catálogo después (grupo 8).

## 1. Scaffold y calidad

- [x] 1.1 Crear el proyecto Next.js 16 (App Router, `src/`, TypeScript 5.9 estricto, Tailwind 4, ESLint 10) con versiones exactas y `package-lock.json`. Verificación: `npm run build` termina sin errores.
- [x] 1.2 Agregar scripts `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`) y `test` (Vitest 5), `engines.node >= 20.9`, y sumar `src/generated/` a `.gitignore`. Verificación: `npm run lint && npm run typecheck && npm test` pasan en el proyecto vacío.
- [x] 1.3 Regla de ESLint que prohíbe `<input>`, `<select>`, `<textarea>` y `<button>` nativos fuera de `src/components/ui/**`. Verificación: un archivo de prueba temporal en `src/app/` con `<input>` hace fallar `npm run lint` y uno en `src/components/ui/` no (se borran después).
- [ ] 1.4 Workflow `.github/workflows/ci.yml` (Node 24, `npm ci`, lint, typecheck, test, sin secretos). Verificación: corre en verde en el PR.

## 2. Dominio compartido (TDD)

- [x] 2.1 Tests y luego `src/domain/shared/intervalos.ts` con `seSuperponen` para `[inicio, fin)`. Verificación: tests de `tests/shared/intervalos.test.ts` para cruce, contacto exacto y contención (RN-TU-01) en verde.
- [x] 2.2 Tests y luego `src/domain/shared/estados.ts` (`ESTADOS_QUE_OCUPAN_AGENDA`, `ESTADOS_FINALES`, `ocupaAgenda`). Verificación: tests de cancelado, ausente y lista igual a "todos menos CANCELADO" (RN-TU-04) en verde.
- [x] 2.3 Tests y luego `src/domain/shared/fechas.ts` (`aInstante`, `formatearFecha`, `formatearHora`, `rangoDelDia`) con `Intl` y zona `America/Argentina/Buenos_Aires`. Verificación: tests de 09:00, 22:30, servidor en otra zona y rango del 25/11/2026 (RN-GL-03) en verde con `TZ=UTC` y `TZ=Europe/Madrid`.

## 3. Datos

- [x] 3.1 `prisma.config.ts` y `prisma/schema.prisma` con los 9 modelos, enums y campo `avatar` de la KB 04 (tablas en `snake_case`, índices de la KB). Verificación: `npx prisma validate` y `npx prisma generate` pasan sin `.env`.
- [x] 3.2 Migración inicial con `--create-only` más el SQL manual: `btree_gist`, `EXCLUDE` por profesional y por sillón, `CHECK` de intervalos, motivo y duración, índice único parcial de DNI activo y `REVOKE` para `anon` y `authenticated`. Verificación: revisión del SQL contra la spec `integridad-de-agenda`.
- [x] 3.3 `src/server/db.ts` con un único cliente y `@prisma/adapter-pg`. Verificación: `npm run typecheck` pasa y no hay otra instancia de `PrismaClient` en el código.
- [x] 3.4 `scripts/verificar-restricciones.sql`: inserta casos de la spec dentro de una transacción con `ROLLBACK` (superposición por profesional y por sillón, contiguos, cancelado, fin < inicio, cancelación sin motivo, DNI activo repetido) e informa cuáles fallan como se espera. Verificación: archivo revisado; se ejecuta en 9.2.
- [x] 3.5 `prisma/seed.ts` idempotente: 6 usuarios del equipo en Supabase Auth con `SEED_PASSWORD` y sus filas `Usuario` (DD-17), 3 profesionales, 3 prestaciones, 3 sillones, franjas lunes a viernes, 5 pacientes inventados con avatar y turnos de ejemplo con historial en el día de ejecución y el siguiente. Verificación: `npm run typecheck`; se ejecuta en 9.1.
- [x] 3.6 `.env.example` con todas las variables de la KB 08 y valores vacíos. Verificación: no contiene ningún valor y `git status` no muestra `.env`.

## 4. Autenticación y autorización

- [x] 4.1 Clientes de Supabase (`src/server/auth/supabase.ts` y navegador con publishable key) y `src/proxy.ts` que protege todo salvo `/login`, `/activar-cuenta` y estáticos, verificando con `getClaims()`. Verificación: sin sesión, `/turnos` y `/` redirigen a `/login` en `npm run dev`.
- [x] 4.2 Tests y luego `src/server/auth/matriz.ts` (matriz de 03 y secciones del menú por rol) y la decisión pura de permiso. Verificación: tests por rol para Equipo, Estadísticas y crear turno (RN-AU-02, RN-AU-03) en verde.
- [x] 4.3 `obtenerUsuarioActual()` y `requireRol(roles)` con errores `NoAutenticado` / `SinPermisos`, y `src/server/resultado.ts`. Verificación: tests con dependencias simuladas para sin sesión, usuario inactivo, rol no permitido y rol permitido (RN-AU-03, RN-AU-05) en verde.
- [x] 4.4 Página `/login` (diseño de `screens/login.html`) con acción de servidor, mensaje genérico de error, bloqueo de no activos y redirección si ya hay sesión; cierre de sesión en el menú del usuario. Verificación: escenarios de la spec `autenticacion` probados en 9.3.
- [x] 4.5 Página `/activar-cuenta` (diseño de `screens/activar-cuenta.html`): verifica el token de invitación, nombre y contraseña con Zod (10 caracteres y un número) y pasa el usuario a `ACTIVO`. Verificación: test del esquema de contraseña en verde; enlace inválido muestra el mensaje de la spec.

## 5. Sistema de componentes (primera tanda)

- [x] 5.1 Tokens de `design-system/tokens.css` en `src/app/globals.css` con `@theme`, Geist con `geist/font`, `src/config/brand.ts` y avatares en `public/avatars/`. Verificación: `/dev/componentes` muestra Geist y los colores del design system.
- [x] 5.2 Botones, Card, Badge de estado, Avatar (con ícono si falta o falla la imagen), Tooltip, Skeleton, estado vacío y Toast (4 s / 6 s, pausa con mouse o foco). Verificación: comparación visual con `components.html`.
- [x] 5.3 `FormField` (react-hook-form + Zod) y controles: texto, email, teléfono, búsqueda con limpiar, número con stepper, contraseña con mostrar/ocultar, área de texto, checkbox, radio. Verificación: formulario de ejemplo en el catálogo muestra error, deshabilitado y foco con teclado.
- [x] 5.4 Select con grupos y múltiple, Combobox con sugerencias, Dialog, Table. Verificación: navegación con teclado (flechas, Enter, Escape) en el catálogo.
- [x] 5.5 Pickers propios de fecha, hora y fecha-hora. Verificación: se elige 25/11/2026 09:30 solo con teclado y el valor queda en hora de Argentina.
- [x] 5.6 Página `/dev/componentes` con todo lo anterior y sus estados. Verificación: se ve sin scroll horizontal a 390 px y a 1440 px.

## 6. Layout del panel y carpetas por módulo

- [x] 6.1 `src/app/(panel)/layout.tsx` con el sidebar del design system (colapsable, ítem activo, usuario con avatar, cierre de sesión) filtrado por la matriz. Verificación: el menú de cada rol coincide con la spec `autorizacion-por-rol`.
- [x] 6.2 Placeholders con estado vacío y verificación de rol en `/pacientes`, `/configuracion/{profesionales,prestaciones,sillones,horarios}`, `/turnos/nuevo`, `/turnos/[id]`, `/equipo` y `/estadisticas`; `/` redirige a `/turnos`. Verificación: `RECEPCION` en `/equipo` ve el aviso de sin permisos.
- [x] 6.3 Carpetas con `.gitkeep` en `src/domain`, `src/server` y `tests` para `pacientes`, `catalogo`, `horarios`, `turnos`, `equipo` y `estadisticas`. Verificación: `git ls-files` las muestra.

## 7. Agenda del día

- [x] 7.1 `/turnos` (Server Component) con vistas Día y Lista, navegación anterior/hoy/siguiente, `?fecha=` con respaldo a hoy, cancelados fuera de la grilla y `loading.tsx`. Verificación: con el seed se ven los turnos ordenados por profesional; `?fecha=2026-13-45` muestra hoy.

## 8. Sistema de componentes (segunda tanda)

- [x] 8.1 Controles restantes: `range`, `color`, `file` (dropzone), `month`, `week`, `url` y `hidden`, agregados al catálogo. Verificación: aparecen en `/dev/componentes` con sus estados.

## 9. Verificación integral

- [x] 9.1 El líder completa su `.env`, corre `npx prisma migrate deploy` y `npx prisma db seed`. Verificación: Supabase muestra las 9 tablas y 6 usuarios; Advisors → Security sin alertas críticas; `npx prisma migrate diff` sin diferencias.
- [x] 9.2 Correr `scripts/verificar-restricciones.sql` en Supabase. Verificación: todos los casos dan el resultado esperado; salida guardada en `docs/evidencias/c01-restricciones.md`.
- [ ] 9.3 (Parcial: login de los 6 usuarios verificado por la API de Supabase, credenciales inválidas en pantalla, redirección sin sesión y menú por rol cubiertos por tests; falta la prueba en pantalla con la contraseña real, la hace el líder.) Probar en `npm run dev` login de un usuario por rol, credenciales inválidas, menú por rol, cierre de sesión, `/turnos` y `/dev/componentes`. Verificación: capturas mobile y desktop en `docs/evidencias/c01/`.
- [x] 9.4 Clon limpio: `npm ci && npm test` sin `.env`. Verificación: todos los tests en verde.
- [x] 9.5 README con requisitos, instalación, variables, tests, cómo levantar la app y estructura de carpetas. Verificación: los enlaces y comandos del README funcionan.

## Workflow follow-up

- verify → archive del change y sincronización de specs en `openspec/specs/`.
- PR de `C-01-base-tecnica` a `main`, CI verde, merge.
- Check de CI obligatorio en `main`; actualizar las ramas C-02 a C-08 con `main`; repartir el `.env` por privado; avisar al equipo que siguen con apply.
