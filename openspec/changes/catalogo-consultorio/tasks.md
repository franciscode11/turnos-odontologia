# Tasks

## 1. Dominio (TDD: test rojo → implementación → verde)

- [ ] 1.1 Test y función `validarDuracion`: 30 y 240 se aceptan, 7, 5 y 245 se rechazan con el mensaje de RN-CA-02, 10 se acepta (`tests/catalogo/duracion.test.ts` en verde)
- [ ] 1.2 Test y funciones `validarMatriculaUnica` y `validarNombreSillonUnico`: repetida en alta, repetida en edición, propia en edición, inactivo y repetida con otras mayúsculas (`tests/catalogo/unicidad.test.ts` en verde)
- [ ] 1.3 Test y esquemas Zod de profesional, prestación y sillón: obligatorios, recorte de espacios, matrícula en mayúsculas, precio negativo rechazado y opcionales (`tests/catalogo/esquemas.test.ts` en verde)
- [ ] 1.4 Test de permisos de consulta y edición del catálogo para los tres roles (`tests/catalogo/permisos.test.ts` en verde)

## 2. Acciones del servidor (Flujo 2)

- [ ] 2.1 Test y fábrica de acciones de prestaciones (crear, editar, cambiarActivo) con repositorio en memoria: feliz, 7 minutos, 240 minutos, "Sin permisos" para RECEPCION y "No autenticado" sin sesión, sin escritura cuando falla (`tests/catalogo/acciones-prestaciones.test.ts` en verde)
- [ ] 2.2 Test y fábrica de acciones de profesionales: matrícula duplicada en alta y edición, edición de la propia matrícula, desactivar sin borrar (`tests/catalogo/acciones-profesionales.test.ts` en verde)
- [ ] 2.3 Test y fábrica de acciones de sillones: nombre repetido, reactivar, "Sin permisos" para PROFESIONAL al desactivar (`tests/catalogo/acciones-sillones.test.ts` en verde)
- [ ] 2.4 Repositorios Prisma, traducción de `P2002` al mensaje de dominio y archivos `"use server"` que instancian las fábricas con `requireRol` real y `revalidatePath` (`npm run typecheck` en verde)

## 3. Pantallas (solo `@/components/ui`)

- [ ] 3.1 `/configuracion/prestaciones`: tabla, diálogo de alta y edición, interruptor de activo; solo lectura sin permiso de editar (`npm run lint` y `npm run build` en verde)
- [ ] 3.2 `/configuracion/profesionales`: ídem (`npm run lint` y `npm run build` en verde)
- [ ] 3.3 `/configuracion/sillones`: ídem (`npm run lint` y `npm run build` en verde)

## 4. Verificación

- [ ] 4.1 `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` en verde, y `git diff --stat main` muestra cambios solo en la Zona de C-03, `openspec/changes/catalogo-consultorio/`, `docs/explore/` y `docs/evidencias/`

## Workflow follow-up

- VERIFY: tabla escenario → test → resultado.
- ARCHIVE: sincronizar `openspec/specs/catalogo-consultorio/` y mover el change a `archive/` sin tocar `CHANGES.md`.
- PR contra `main` con reviewer `franciscode11`.
