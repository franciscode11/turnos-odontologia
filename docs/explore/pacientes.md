# Explore — C-02 Gestión de pacientes

La ficha depende de C-01 y usa SDD con gobernanza media. El alcance es alta, búsqueda paginada por apellido o DNI, edición y baja lógica desde `/pacientes`. El trabajo de aplicación queda en las cuatro rutas de la ficha. [Roadmap](../../CHANGES.md#c-02-gestion-pacientes)

## Qué se reutiliza

- Prisma ya tiene el modelo `Paciente`, el campo `activo` y la relación con turnos. La migración de C-01 ya impone DNI único entre pacientes activos mediante un índice parcial. [Modelo](../../prisma/schema.prisma#L65) · [Índice](../../prisma/migrations/20261125120000_inicial/migration.sql#L265)
- `/pacientes` ya usa `accesoPagina("pacientes.ver")`. La matriz permite consultar a los tres roles autenticados y reserva los cambios a `ADMIN` y `RECEPCION`. La pantalla actual es un marcador de C-01. [Ruta](../../src/app/(panel)/pacientes/page.tsx#L9) · [Permisos](../../src/server/auth/matriz.ts#L16)
- El panel y los componentes compartidos ya incluyen encabezado, tabla, diálogo, campos, botones y estado vacío. La revisión 3 del sistema visual está aprobada y el modo del proyecto es `system-only`. [Componentes](../../src/components/ui/index.ts) · [Sistema visual](../../design-system/README.md#L3)

## Reglas que debe cubrir la propuesta

| Reglas | Qué debe pasar |
| --- | --- |
| RN-PA-01 y RN-PA-02 | Normalizar el DNI a 7 u 8 dígitos. Los DNI con y sin puntos se comparan igual. Rechazar duplicados activos también al editar. |
| RN-PA-03 y RN-PA-04 | Pedir nombre, apellido, DNI, fecha de nacimiento y teléfono. Rechazar fechas futuras. Email, obra social y afiliado son opcionales. |
| RN-PA-05 | Dar de baja con `activo = false`, preservar el historial y excluir al paciente de nuevas reservas. |
| RN-PA-06 | Permitir consulta a `PROFESIONAL` y comprobar en el servidor el permiso para cada escritura. |

[Reglas de pacientes](../../knowledge-base/05_reglas_de_negocio.md#dominio-pacientes-rn-pa--c02) · [US-010 y US-011](../../knowledge-base/06_funcionalidades.md#épica-2-pacientes-c02--octavio-crescini)

## Puntos para revisar en Propose

- Incluir un escenario de edición que conserve el DNI propio y otro que choque con el DNI activo de otra persona. La misma protección del alta debe cubrir los cambios concurrentes mediante el índice existente.
- Precisar en la propuesta el tamaño y el orden de página como decisiones de interfaz. La ficha ya fija búsqueda parcial por apellido o por DNI y una espera de 250 ms.
- El teléfono se usa como dato de contacto. Los recordatorios quedan fuera del MVP según IN-01. [IN-01](../../knowledge-base/10_preguntas_abiertas.md#in-01--el-teléfono-del-paciente-se-usa-para-recordatorios)
- El Discovery incluye la gestión administrativa de pacientes en el MVP. La ficha clínica queda fuera del alcance de C-02. [Informe de Discovery](../discovery/informe-discovery.md#L626)

## Estado de partida

C-02 local se actualizó desde `main` en `e444973`. Se ejecutaron `npm install` y `npm test`. Vitest informó 151 tests aprobados en 15 archivos. Al iniciar Explore, OpenSpec tenía el proyecto configurado y no listaba un change activo de pacientes.
