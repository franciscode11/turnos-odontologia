# Turnos Odontología — Base de Conocimiento

Base de conocimiento generada por `kb-creator` (modo import) a partir del Discovery (`docs/discovery/`), las restricciones del equipo (`docs/restricciones-equipo.md`), el plan del líder y las guías de los integrantes (`equipo/`). Fecha: 2026-11-25.

**Es la fuente de verdad del proyecto.** Si una guía o un prompt dice otra cosa, gana la knowledge base. Si algo no está, se pregunta al líder; no se inventa. Solo el líder la modifica.

## Índice de Archivos

| Archivo | Contenido |
|---|---|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Problema, objetivos por rol, alcance del MVP, fuera de alcance, métricas |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack, arquitectura general, integraciones, acciones del servidor por módulo |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Roles, matriz de permisos, rutas públicas y del panel |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades, ERD, restricciones de exclusión, seed ficticio |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas RN-XX-NN por dominio y trazabilidad con el Discovery |
| [06_funcionalidades.md](06_funcionalidades.md) | Historias de usuario por change con escenarios mínimos |
| [07_flujos_principales.md](07_flujos_principales.md) | Login, patrón de acción, crear turno, disponibilidad, estados, flujo del equipo |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones, carpetas por módulo, seguridad, variables de entorno, CI |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | 16 decisiones (DD) y 6 supuestos (SU) |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | 5 inconsistencias, preguntas priorizadas y puntos "No evidenciado" |

## Quick Start para Desarrolladores

1. Entender el dominio → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. Entender los datos → [04](04_modelo_de_datos.md)
3. Entender las reglas → [05](05_reglas_de_negocio.md) (citá los códigos RN en tu spec y tus tests)
4. Entender la arquitectura → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
5. Implementar → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md)

| Change | Responsable | Leer sí o sí |
|---|---|---|
| C01 Base técnica | Francisco (líder) | 02, 03, 04, 08 |
| C02 Pacientes | Octavio | RN-PA, US-010/011 |
| C03 Catálogo | Joaquín C. | RN-CA, US-020 |
| C04 Horarios y disponibilidad | Lautaro | RN-HO, US-030/031, flujo 4 |
| C05 Crear turno | Joaquín E. | RN-TU, US-040, flujo 3, IN-02 |
| C06 Estados del turno | Ulises | RN-ES, US-050, flujo 5 |
| C07 Equipo e invitaciones | Francisco (líder) | RN-EQ, US-060, flujo 6 |
| C08 Estadísticas | Francisco (líder) | RN-ST, US-070 |

## Resumen Ejecutivo

Agenda de turnos para consultorios odontológicos argentinos, cargada solo por el consultorio, con tres roles controlados en el servidor. Su diferencial, respaldado por el Discovery, es que **nunca permite turnos superpuestos por profesional ni por sillón** (validado en el dominio y garantizado por la base de datos) y que **todo cambio de estado queda en un historial**, con cancelación siempre motivada. El MVP son 8 changes: una base técnica secuencial, 5 módulos en paralelo (uno por integrante) y 2 del líder (equipo con invitaciones y estadísticas para el dueño).
