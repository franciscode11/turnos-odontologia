# Explore: C-03 catalogo-consultorio

- **Fecha:** 2026-11-25
- **Responsable:** joaquin-cortez (Joaquín Cortez Badaloni, legajo 51948)
- **Rama:** `C-03-catalogo` (al día con `main` en `11ec340`, con la base técnica C-01 mergeada)
- **Modo:** SDD (ciclo OPSX). Governance: BAJO.
- **Fuentes leídas:** ficha C-03 de `CHANGES.md`, `knowledge-base/03` (matriz de permisos y rutas), `04` (§Profesional, §Prestacion, §Sillon), `05` (§RN-CA), `06` (§Épica 3, US-020), `07` (§Flujo 2), `08`, `09` (DD de baja lógica, SU-04), `10`, `prisma/schema.prisma`, la migración inicial y el código de la base (`src/server/auth`, `src/server/resultado.ts`, `src/server/db.ts`, `src/components/ui`, `src/domain/shared`).

## 1. Qué dice el roadmap de mi change

- **Resultado:** el ADMIN crea, edita y desactiva profesionales, prestaciones y sillones en `/configuracion/*`; una prestación de 7 minutos se rechaza y una de 240 se acepta; una matrícula repetida se rechaza; los demás roles solo consultan; los tests pasan.
- **Depende de:** solo C-01 (ya está en `main`). Ningún otro change depende de mí, pero C-04 y C-05 van a leer profesionales, prestaciones y sillones **activos**.
- **Zona:** `src/app/(panel)/configuracion/{profesionales,prestaciones,sillones}/`, `src/domain/catalogo/`, `src/server/catalogo/`, `tests/catalogo/`.
- **Scope:** dominio (duración, unicidad de matrícula y de nombre de sillón), Server Actions de ABM y desactivación solo ADMIN, tres pantallas con tabla, diálogo de alta y edición y switch de activo, tests (feliz, 7 min, 240 min, matrícula duplicada, permisos).

## 2. Qué ya existe y hay que reutilizar

| Pieza | Dónde | Uso en C-03 |
|---|---|---|
| Modelos `Profesional`, `Prestacion`, `Sillon` | `prisma/schema.prisma` | Ya tienen `activo` (default `true`), `matricula @unique`, `Sillon.nombre @unique`. `Prestacion.precioReferencia` es `Decimal(12,2)?`. `Profesional` también tiene `especialidad?` y `avatar?`. **No se toca el esquema.** |
| CHECK de duración | migración inicial (`duracion_minutos BETWEEN 10 AND 240 AND % 5 = 0`) | Red de seguridad en la base; el dominio valida antes con mensaje claro. |
| Índices únicos | `profesional_matricula_key`, `sillon_nombre_key` | Si dos altas compiten, la base rechaza la segunda (error Prisma `P2002`): hay que traducirlo al mismo mensaje del dominio. |
| Matriz de permisos | `src/server/auth/matriz.ts` | Ya existen `profesionales.ver/editar`, `prestaciones.ver/editar`, `sillones.ver/editar` (editar = solo ADMIN, ver = todos). |
| `requireRol` / `requirePermiso` | `src/server/auth/index.ts` | Paso 2 del Flujo 2 en cada Server Action. `crearControlDeAcceso` permite testear sin base. |
| `accesoPagina(permiso)` | `src/server/auth/pagina.ts` | En cada página: sin permiso de ver → `<SinPermiso />`. |
| `Resultado`, `exito`, `fallo`, `conAcceso` | `src/server/resultado.ts` | Formato de respuesta de toda Server Action. |
| `prisma` | `src/server/db.ts` | Único cliente. |
| Componentes | `src/components/ui` (`Tabla`, `Dialogo`, `FormField`, `Entrada`, `EntradaNumero`, `Interruptor`, `Boton`, `BadgeEstado`, `EncabezadoPagina`, `EstadoVacio`, `Toast`…) | Únicos permitidos; ESLint rechaza `<input>`, `<select>`, `<textarea>`, `<button>` crudos. |
| Páginas placeholder | `src/app/(panel)/configuracion/{profesionales,prestaciones,sillones}/page.tsx` | Las reemplazo. El menú lateral ya las enlaza. |

## 3. Reglas de negocio que aplican

- **RN-CA-01:** la matrícula del profesional es única.
- **RN-CA-02:** la duración de una prestación es múltiplo de 5 entre 10 y 240, ambos incluidos.
- **RN-CA-03:** el nombre del sillón/box es único.
- **RN-CA-04:** se desactivan, no se borran (los turnos históricos siguen mostrando el dato).
- **RN-CA-05:** un elemento inactivo no se ofrece para turnos nuevos; los turnos ya creados no cambian. (Para C-03 alcanza con exponer el campo `activo`; el filtro lo aplican C-04/C-05.)
- **RN-CA-06:** solo `ADMIN` crea, edita o desactiva; los demás roles consultan.
- **SU-04:** la duración del turno la fija la prestación y no cambia si después se edita la prestación → editar la duración no toca turnos existentes.

## 4. Huecos y dudas para decidir antes de proponer

1. **Comparación de matrícula y de nombre de sillón:** la KB dice "única", pero no si `MP-1234` y `mp-1234 ` (mayúsculas o espacios) son la misma. El índice de la base distingue mayúsculas. Propuesta: recortar espacios al guardar y comparar sin distinguir mayúsculas en el dominio. **A confirmar con el líder.**
2. **¿La unicidad incluye a los inactivos?** El índice único de la base cubre todas las filas, así que una matrícula de un profesional desactivado no se puede reutilizar. Se asume así (lo impone el esquema).
3. **Reactivar:** la ficha pide un "switch de activo", así que se puede volver a activar. Se asume que sí.
4. **Precio de referencia:** opcional; la KB no fija límites. ¿Se rechaza un precio negativo? No está definido → pregunta abierta.
5. **Nombre de prestación:** la KB no exige que sea único → no se valida.
6. **Avatar del profesional y vínculo con `Usuario`:** fuera de alcance (el vínculo es de C-07). El avatar no se edita en este change.
7. **Borrado físico:** no existe ninguna acción de borrar (RN-CA-04).
