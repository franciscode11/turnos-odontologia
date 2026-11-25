# Discovery — checklist de 11 puntos

> Resultado estructurado de `discovery-research` (Active Stack). Fecha: 2026-11-25. Aprobado por el líder del equipo el 2026-11-25.
> Fuentes: 20 notas de competidores en [`sources/`](sources/) y el informe comparativo [`informe-discovery.md`](informe-discovery.md). Restricciones del equipo: [`../restricciones-equipo.md`](../restricciones-equipo.md).

## 1. Problema que resuelve

Los consultorios odontológicos argentinos chicos y medianos organizan la agenda con papel, planillas o turneros genéricos. Eso produce turnos superpuestos (mismo profesional o mismo sillón), horarios mal aprovechados y ninguna trazabilidad de quién cambió un turno ni por qué.

## 2. Usuarios y roles

| Rol | Verbo principal |
|---|---|
| **ADMIN** | Configura el consultorio (profesionales, prestaciones, sillones, horarios) y los usuarios. |
| **RECEPCION** | Da, cancela y reprograma turnos; gestiona pacientes. |
| **PROFESIONAL** | Consulta su agenda y marca la asistencia. |

El paciente **no** usa el sistema en el MVP: los turnos los carga el consultorio.

## 3. Casos de uso principales

1. Como recepción, quiero registrar y buscar pacientes para darles turno rápido.
2. Como admin, quiero cargar profesionales, prestaciones con su duración y sillones.
3. Como admin, quiero definir horarios de atención y bloqueos para que solo se ofrezcan horarios reales.
4. Como recepción, quiero crear un turno sin que se superponga con otro del mismo profesional o sillón.
5. Como recepción o profesional, quiero cancelar un turno con motivo o marcarlo atendido o ausente, y que quede en el historial.

## 4. Competidores y soluciones existentes

Se relevaron **20 sistemas** en tres regiones (detalle, puntuación y fuentes en el informe):

- **Argentina:** Bilog, Odonthia, DentalSoft, DentalTec, DentalCore, Odonto.ar, OdontoClinIA (ClinIA), Órbita.
- **Latinoamérica:** Dentalink, AgendaPro, Reservo (operan en Argentina), Doctocliq, Dentidesk, Clinicorp.
- **Internacional:** Doctoralia (opera en Argentina), Clinic Cloud, Dentally, Curve Dental, Dentrix Ascend, Open Dental.

## 5. Funcionalidades necesarias (MVP)

1. Acceso con usuarios y roles ADMIN / RECEPCION / PROFESIONAL.
2. Gestión de pacientes (alta, búsqueda, edición).
3. Catálogo: profesionales, prestaciones con duración, sillones/boxes.
4. Horarios de atención y bloqueos, con cálculo de disponibilidad.
5. Crear turno evitando solapamientos por profesional y por sillón.
6. Cancelar turno con motivo y estados de asistencia (confirmado, atendido, ausente), con historial.

## 6. Funcionalidades opcionales (etapas posteriores)

Reserva online del paciente, WhatsApp, recordatorios, lista de espera, ficha clínica, odontograma, periodontograma, imágenes, presupuestos, caja y cobros, Mercado Pago, facturación ARCA, obras sociales y prepagas, liquidaciones, reportes avanzados, multi-sucursal y API pública.

**Criterio del equipo:** se construye solo lo que exige la consigna; nada que agregue complejidad sin aportar a la evaluación.

## 7. Reglas de negocio

1. **Sin sobreturnos:** no puede haber dos turnos que ocupen agenda superpuestos para el mismo profesional ni para el mismo sillón. Se valida en el código y lo garantiza también la base de datos.
2. Los intervalos son semiabiertos `[inicio, fin)`: un turno que empieza justo cuando termina otro es válido.
3. La duración del turno la define la prestación elegida.
4. Solo se puede dar turno dentro del horario de atención del profesional y fuera de los bloqueos.
5. Se puede cancelar en cualquier momento con **motivo obligatorio**; cancelar libera el horario.
6. Los turnos cancelados no ocupan agenda.
7. Todo cambio de estado de un turno queda en el historial con usuario y fecha.
8. Cada rol tiene permisos definidos, controlados en el servidor (no solo en la interfaz).

## 8. Integraciones

Ninguna integración externa en el MVP. Solo Supabase (base de datos PostgreSQL, autenticación y almacenamiento de archivos).

## 9. Restricciones

- Entrega el jueves 26/11/2026 a las 12:00; 6 personas trabajando en paralelo, cada una con su change.
- Stack: Next.js + TypeScript, Prisma, Supabase, Vitest, Tailwind (ver `docs/restricciones-equipo.md`).
- Solo datos ficticios; ningún secreto en el repositorio.
- Un único sistema de componentes de interfaz compartido por todo el equipo.

## 10. Riesgos

| Riesgo | Tipo | Mitigación |
|---|---|---|
| Conflictos de merge entre 5 ramas paralelas | Equipo | Carpetas por módulo, archivos compartidos solo los edita el líder, PRs chicos. |
| Pisar la base de datos compartida | Técnico | Solo el líder migra; los integrantes usan un rol de Postgres sin permisos de DDL. |
| Datos inventados por la IA en el informe | Calidad | Verificación personal de 5 fuentes y corrección con Ajustar. |
| Datos de salud sensibles | Legal | Datos ficticios, control de acceso por rol en el servidor, trazabilidad. |
| Falta de tiempo | Plazo | MVP mínimo, changes independientes, nada fuera de la consigna. |

## 11. Preguntas abiertas

- Todo lo que el informe marca como **"No evidenciado"** (por ejemplo, la adecuación declarada de los competidores a la Ley 26.529 y los precios no publicados).
- ¿Conviene permitir sobreturnos con permiso de ADMIN en una etapa futura?
- ¿Cuándo incorporar la reserva online del paciente y los recordatorios?
