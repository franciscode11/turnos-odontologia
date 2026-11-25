# Visión y Objetivos

> Fuentes: `docs/discovery/checklist-discovery.md` (puntos 1–3, 5, 6), `docs/discovery/informe-discovery.md` (secciones C y D), `docs/restricciones-equipo.md`.

## Propósito del sistema

**Agenda de turnos odontológicos que nunca se superpone y deja registro de todo lo que pasa con cada turno.**

Los consultorios odontológicos argentinos chicos y medianos organizan la agenda con papel, planillas o turneros genéricos. Eso produce turnos superpuestos (mismo profesional o mismo sillón), horarios mal aprovechados y ninguna trazabilidad de quién cambió un turno ni por qué. El Discovery relevó 20 sistemas: solo 4 tienen comprobada la prevención de solapamientos y **ninguno garantiza a la vez el bloqueo por profesional y por sillón** (informe, C.2 y C.3.1). Ese vacío define el diferencial del producto.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| ADMIN | Configurar el consultorio: profesionales, prestaciones con duración, sillones, horarios de atención y bloqueos. | Dar de alta a los usuarios del sistema; tener las mismas capacidades operativas que recepción. |
| RECEPCION | Dar turnos sin superposiciones en pocos pasos. | Registrar y buscar pacientes; confirmar y cancelar turnos con motivo. |
| PROFESIONAL | Ver su agenda del día. | Marcar sus turnos como atendido o ausente. |
| Paciente | — (no usa el sistema en el MVP) | Recibe turnos dados por el consultorio. |

## Alcance v1.0 (MVP — entrega 26/11/2026 12:00)

1. Acceso con usuarios y roles `ADMIN`, `RECEPCION`, `PROFESIONAL` (alta por el administrador, sin registro público).
2. Gestión de pacientes: alta, búsqueda, edición y baja lógica, con datos ficticios.
3. Catálogo: profesionales, prestaciones con duración y sillones/boxes.
4. Horarios de atención y bloqueos por profesional, con cálculo de disponibilidad.
5. Crear turno evitando solapamientos por profesional y por sillón, garantizado también en la base de datos.
6. Confirmar, cancelar (motivo obligatorio, libera el horario) y marcar atendido/ausente, con historial de cambios de estado.
7. Listado de turnos del día (solo lectura) y detalle del turno.

## Fuera de alcance

Decisión del líder: **se construye solo lo que exige la consigna; nada que agregue complejidad sin aportar a la evaluación.** Quedan para etapas posteriores (motivo de cada una en el informe, D.3):

- Reserva online del paciente y portal público.
- WhatsApp, recordatorios y notificaciones de cualquier tipo.
- Lista de espera.
- Ficha clínica, odontograma, periodontograma e imágenes.
- Presupuestos, caja, cobros y Mercado Pago.
- Facturación electrónica ARCA.
- Obras sociales y prepagas (más allá de guardar el nombre y n.º de afiliado como dato del paciente).
- Liquidaciones a profesionales y reportes avanzados.
- Multi-sucursal (el MVP modela un único consultorio) y API pública.
- Sobreturnos de cualquier tipo, ni siquiera con permiso de ADMIN.
- Reprogramar un turno como operación propia: se cancela y se crea uno nuevo.

## Métricas de éxito

| Métrica | Meta |
|---|---|
| Turnos superpuestos (mismo profesional o mismo sillón, ambos ocupando agenda) | 0, garantizado por la restricción de exclusión de la base de datos. |
| Cambios de estado sin registro en el historial | 0. |
| Escenarios por change con test automatizado | ≥ 3 (feliz, error de negocio, borde) en cada uno de los 6 changes. |
| `npm install && npm test` sin credenciales | Pasa en un clon limpio. |
| CI en `main` | Verde (lint + typecheck + tests). |
| Datos reales de personas en repo, seeds, tests o capturas | 0. |
