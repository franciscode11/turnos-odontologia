# Tasks

## 1. Períodos en hora de Argentina

- [x] 1.1 Escribir `tests/estadisticas/periodos.test.ts` (semana ISO, mes, rango válido, rango invertido/largo/inexistente → mes actual, borde de medianoche, período anterior de semana, rango y mes) y verificar que falla en rojo
- [x] 1.2 Implementar `src/domain/estadisticas/periodos.ts` (D1, D4, D5) y verificar que `npx vitest run tests/estadisticas/periodos.test.ts` pasa

## 2. Indicadores y comparación

- [x] 2.1 Escribir `tests/estadisticas/indicadores.test.ts` con un test por escenario de RN-ST-02, RN-ST-03, RN-ST-04 y RN-ST-05 (incluidos 16,7 % de US-070 y "Sin datos") y verificar que falla
- [x] 2.2 Implementar `src/domain/estadisticas/indicadores.ts` y `formato.ts` y verificar que los tests de indicadores pasan
- [x] 2.3 Escribir `tests/estadisticas/comparacion.test.ts` (RN-ST-06: +8,3 %, -1,2 pts favorable, anterior sin datos) e implementar `comparacion.ts` hasta que pase

## 3. Desgloses y reporte

- [x] 3.1 Escribir `tests/estadisticas/desgloses.test.ts` (turnos por día, motivos normalizados, por prestación, por profesional, profesional sin datos, filtro inexistente) e implementar `desgloses.ts` y `reporte.ts` hasta que pase

## 4. Consulta de solo lectura

- [x] 4.1 Escribir `tests/estadisticas/consulta.test.ts` con repositorio falso (RN-ST-01: ADMIN ok, RECEPCION/PROFESIONAL "Sin permisos" sin leer, sin sesión "No autenticado") e implementar `src/server/estadisticas/consulta.ts` hasta que pase
- [x] 4.2 Implementar `src/server/estadisticas/repositorio.ts` (solo `findMany` con `select` mínimo) e `instancia.ts`, y verificar con `npm run typecheck`

## 5. Pantalla /estadisticas

- [x] 5.1 Reemplazar el placeholder de `src/app/(panel)/estadisticas/page.tsx` por la pantalla (SinPermiso para roles no ADMIN, período desde `searchParams`) y verificar con `npm run typecheck` y `npm run lint`
- [x] 5.2 Crear `_componentes/` (filtros, indicadores, turnos por día, barras, tabla por profesional) según `design-system/screens/estadisticas.html` usando solo `src/components/ui`, y verificar con `npm run lint`
- [x] 5.3 Crear `loading.tsx` y el estado vacío, y verificar que `npm run build` compila sin `.env`

## 6. Verificación integral

- [x] 6.1 Correr `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` y `openspec validate estadisticas-del-consultorio --strict`, todo en verde

## Workflow follow-up

- Archivar con `openspec archive estadisticas-del-consultorio --yes`.
- Marcar la ficha C-08 como `[x]` en `CHANGES.md` solo si todo quedó verde.
- Pedirle al líder que confirme D4 (período anterior del mes).
