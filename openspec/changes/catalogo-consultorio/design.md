# Design

## Context

C-01 dejó los modelos `Profesional`, `Prestacion` y `Sillon` con `activo`, los índices únicos de matrícula y de nombre de sillón y el `CHECK` de duración en la base. También dejó la matriz de permisos (`profesionales.editar`, `prestaciones.editar` y `sillones.editar` = solo `ADMIN`; `*.ver` = todos), `requireRol`, `accesoPagina`, `conAcceso`/`Resultado` y los componentes de `src/components/ui`. Los tests corren sin base de datos (`vitest`, entorno `node`). Ver proposal.md §Why.

## Goals / Non-Goals

**Goals:**
- Que cada escenario de la spec tenga un test que corra sin base ni Supabase.
- Seguir el Flujo 2 de `knowledge-base/07` en cada acción: sesión → rol → Zod → carga → regla de dominio → escritura → `revalidatePath`.

**Non-Goals:**
- Paginación o búsqueda en los listados (el consultorio tiene pocos registros).
- Optimistic UI.

## Decisions

### D1. Reglas como funciones puras en `src/domain/catalogo/`
- `validarDuracion(minutos)`: devuelve el error de RN-CA-02 o `null`.
- `validarMatriculaUnica(matricula, existente)` y `validarNombreSillonUnico(nombre, existente)`: reciben el registro que ya tiene ese valor (o `null`) y el `id` que se está editando, y devuelven el mensaje de error o `null`. Así la regla "repetida salvo que sea la propia" se testea sin base.
- Esquemas Zod (`esquemaProfesional`, `esquemaPrestacion`, `esquemaSillon`) en `src/domain/catalogo/esquemas.ts`, compartidos por el formulario y la acción. La duración del esquema usa `validarDuracion` para que el mensaje sea uno solo.
- *Alternativa descartada:* validar solo con el `CHECK` y el índice único de la base. Daría mensajes genéricos de Prisma y no se podría testear sin base.

### D2. Acciones con dependencias inyectables
`src/server/catalogo/acciones-*.ts` exporta una fábrica `crearAccionesPrestaciones({ requireRol, repositorio })` (igual que `crearControlDeAcceso` de C-01) y un archivo `"use server"` que la instancia con `requireRol` real y un repositorio Prisma. Los tests inyectan un usuario falso y un repositorio en memoria para comprobar "Sin permisos", "No autenticado" y que no se escribe nada.
- *Alternativa descartada:* mockear `@/server/db` con `vi.mock`. Es más frágil y acopla los tests a Prisma.

### D3. Carrera en la unicidad
El dominio valida antes de escribir. Si dos altas compiten, el índice único de la base rechaza la segunda con `P2002`: la acción lo traduce al mismo mensaje de RN-CA-01 o RN-CA-03.

### D4. Baja lógica con una sola acción
`cambiarActivo(id, activo)` por entidad, que sirve para desactivar y para reactivar (el interruptor de la tabla). No hay acción de borrado.

### D5. Pantallas
Cada `page.tsx` es un Server Component: `accesoPagina("<entidad>.ver")`, lee el listado con Prisma ordenado por nombre y pasa `puedeEditar = puede(rol, "<entidad>.editar")` a un componente cliente con `Tabla`, `Dialogo` de alta y edición (react-hook-form + `FormField` + el esquema Zod de D1), `Interruptor` de activo y `Toast` con el resultado. Si `puedeEditar` es falso no se muestran botones ni interruptores; igual el servidor vuelve a verificar el rol. Solo componentes de `@/components/ui`.

## Risks / Trade-offs

- [Matrícula con distintas mayúsculas (`MP-1234` vs `mp-1234`)] → el esquema Zod la normaliza (recorte de espacios y mayúsculas) antes de guardarla, así el índice único de la base también la protege. El nombre del sillón se guarda tal cual se escribió, pero la búsqueda del existente usa `mode: "insensitive"`. Si dos altas con distintas mayúsculas compiten al mismo tiempo, la base no lo detecta: se acepta porque el catálogo lo carga un solo ADMIN.
- [El precio de referencia es `Decimal`] → se convierte a `number` solo para mostrarlo; se guarda como string decimal para no perder precisión.
- [Un componente de UI que falte en `src/components/ui`] → se frena y se le pide al líder; no se crean componentes propios.

### D6. Permiso de edición en la pantalla
La pantalla decide qué mostrar con `puede(rol, "<entidad>.editar")` de la matriz de C-01. El escenario de solo lectura se testea sobre esa función para los tres roles y las tres secciones, sin renderizar la pantalla.
