# Preguntas Abiertas

> Fuentes: comparación entre las guías de los integrantes, el plan del líder y el checklist de Discovery; puntos "No evidenciado" del informe (A.2, C.3 y anexo de inconsistencias).

## Inconsistencias detectadas

### IN-01 — El teléfono del paciente "se usa para recordatorios"
**Documento A dice** (guía del C02): teléfono obligatorio porque "se usa para recordatorios".
**Documento B dice** (checklist punto 6, informe D.3): recordatorios fuera del MVP.
**Impacto**: el agente del C02 podría proponer recordatorios.
**Resolución propuesta**: teléfono obligatorio como dato de contacto, sin recordatorios (RN-PA-03). La spec del C02 no debe incluir notificaciones.

### IN-02 — Validar el horario de atención al crear un turno sin depender del C04
**Documento A dice** (checklist regla 4): solo se da turno dentro del horario y fuera de bloqueos.
**Documento B dice** (guías): el C05 depende solo del C01; horarios y bloqueos son del C04, en paralelo.
**Impacto**: el C05 no puede importar código del C04 sin bloquearse.
**Resolución propuesta**: el C01 deja en `src/domain/shared/` la función `seSuperponen` y la constante de estados, y el seed carga franjas ficticias. El C05 valida RN-TU-08 leyendo `HorarioAtencion` y `Bloqueo` con su propia función en `src/domain/turnos/crear-*`. El C04 hace la pantalla de carga y el cálculo de disponibilidad.

### IN-03 — Estado inicial del turno
**Documento A dice** (checklist punto 5): estados de asistencia "confirmado, atendido, ausente".
**Documento B dice** (guía del C06): transiciones desde "reservado".
**Impacto**: menor; nombres de estado distintos entre specs.
**Resolución propuesta**: `RESERVADO` es el estado inicial; lista completa en DD-09.

### IN-04 — Contenido de `ESTADOS_QUE_OCUPAN_AGENDA`
**Documento A dice** (plan del líder): crear la constante y la restricción "cuando el estado ocupa agenda".
**Documento B dice**: ningún documento define qué estados ocupan agenda, salvo que cancelado no.
**Impacto**: C04, C05 y la restricción de la base podrían usar definiciones distintas.
**Resolución propuesta**: todos menos `CANCELADO` (DD-09); la restricción usa `WHERE estado <> 'CANCELADO'`.

### IN-05 — Disponibilidad por profesional vs. ocupación del sillón
**Documento A dice** (guía del C04): la disponibilidad descuenta bloqueos y turnos del profesional.
**Documento B dice** (guía del C05): el turno también se rechaza si el sillón está ocupado.
**Impacto**: un inicio ofrecido como disponible puede fallar al crear el turno por el sillón.
**Resolución propuesta**: aceptado en el MVP; la creación muestra "El sillón ya está ocupado en ese horario". Ver pregunta P-04.

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|---|---|---|---|
| Alta | ¿El seed debe cargar franjas de atención para que C05 pueda probarse sin esperar al C04? (propuesta: sí, IN-02) | C01 | Líder |
| Alta | Resultado de las 5 verificaciones de fuentes de la sección E del informe (Órbita, AgendaPro, Odonthia, DENTIDESK, Bilog): hoy están "Pendiente". | Informe final | Integrantes (Tarea 0) |
| Media | ¿La disponibilidad debe ofrecerse en pasos de 5 o de 15 minutos? (SU-03) | C04 | Lautaro + líder |
| Media | P-04: ¿la disponibilidad debería filtrar también por sillón libre? (IN-05) | C04 / C05 | Líder |
| Media | P-06: el envío de emails de Supabase en el plan gratuito tiene un límite bajo por hora. ¿Alcanza para la demo o configuramos un SMTP propio? | C07 | Líder |
| Baja | ¿Conviene permitir sobreturnos con permiso de ADMIN en una etapa futura? (hoy: no, DD-04) | Etapa posterior | Líder |
| Baja | ¿Cuándo incorporar reserva online del paciente y recordatorios? | Etapa posterior | Líder |
| Baja | ¿Qué requisitos de la Ley 26.529 (historia clínica) y la Ley 25.326 (datos personales) aplicarían si el sistema usara datos reales? El MVP usa solo datos ficticios. | Etapa posterior | Equipo |

## Puntos "No evidenciado" del Discovery que siguen abiertos

Estos datos no tienen respaldo en fuentes públicas. Solo una demo o la verificación de la sección E pueden resolverlos; mientras tanto **no se usan como hechos** en el proyecto ni en el video.

| Tema | Sistemas | Cómo resolverlo |
|---|---|---|
| Prevención de solapamientos | No evidenciado en 14 de 20, entre ellos Bilog, Dentalink, DentalTec, DentalCore, Odonto.ar, OdontoClinIA y Doctoralia. DentalSoft y Órbita solo la afirman (AC). | Demo de Bilog y Dentalink (informe D.1); verificación E.1 (Órbita). |
| Bloqueos de agenda explícitos | Dentalink y Dentrix Ascend no los documentan. | Demo de Dentalink. |
| Trazabilidad de cambios en turnos | Ningún proveedor argentino la tiene comprobada (solo AC). | Demo de Bilog. |
| Adecuación a la Ley 26.529 | Solo Odonthia y AgendaPro la declaran (AC); el resto no la menciona. Dentalink rige su privacidad por ley chilena. | Consulta a proveedores; fuera del alcance del MVP. |
| Precios | No publican montos: Bilog, Dentalink, Reservo, OdontoClinIA, Órbita, DentalTec. DentalCore publica valores inconsistentes. | Contacto comercial; no afecta al MVP. |
| Lista de espera | Ningún proveedor argentino la evidencia. | Etapa posterior. |
| Exportación de datos | Comprobada solo en Odonthia y parcialmente en Dentalink. | Etapa posterior. |
| WhatsApp en Odonto.ar | Atribuido por un competidor, no en el sitio oficial. | No se usa. |
| Solapamiento en Dentally | Un hilo de comunidad reporta una reserva online solapada; resolución no leída. | Se cita solo como indicio. |
| Gesden | Sitio oficial no accesible durante el relevamiento; descartado. | No se usa. |
