# Informe de Discovery: sistemas de gestión de turnos y agenda odontológica

**Trabajo Global · Desarrollo de Software**

UTN · Facultad Regional Mendoza · Comisión 3K09

**Integrantes**

- Francisco Diego Valles Adad (líder)
- Octavio Crescini
- Joaquín Cortez Badaloni
- Lautaro de Coninck
- Joaquín Echenagorria
- Ulises Iván Lucato Flores

**Fecha:** 25 de noviembre de 2026 (verificación de fuentes: 25 y 26 de noviembre de 2026)

<div style="page-break-after: always"></div>

## Resumen ejecutivo

**Qué se investigó.** 20 sistemas de gestión de turnos y agenda odontológica: 8 de proveedores argentinos, 6 latinoamericanos, 5 referentes internacionales y Doctoralia, que opera en el país. Cada dato tiene su URL y su fecha de consulta, y se distingue lo comprobado (C) de lo que el proveedor solo afirma (AC). Lo que no tiene respaldo público figura como «No evidenciado».

**Principales hallazgos.**

- La agenda básica es estándar, pero la **prevención de turnos superpuestos casi no está demostrada**: solo 4 de 20 sistemas la comprueban, solo 2 con bloqueo real, y ninguno garantiza a la vez el profesional y el sillón. El resto la resuelve como alerta que se puede aceptar o no la documenta.
- La **trazabilidad de cambios en los turnos** está comprobada en 5 sistemas, pero en ningún proveedor argentino (solo como afirmación comercial).
- La **agenda por sillón** aparece comprobada en 6 de 20 sistemas y, entre los argentinos, solo en Odonthia.
- En la matriz ponderada lideran Odonthia (3,29), Dentalink (2,73) y Open Dental (2,69). Muchos puntajes son bajos por falta de evidencia pública, no necesariamente por falta de funciones.
- La verificación humana de 5 fuentes confirmó 3 y encontró 2 parciales (Odonthia y DENTIDESK). Los ajustes se aplicaron en el informe.

**MVP recomendado.** Seis funciones imprescindibles: acceso con roles sin registro público, gestión de pacientes, catálogo (profesionales, prestaciones con duración y sillones), horarios y bloqueos con disponibilidad, creación de turnos sin superposiciones por profesional y por sillón garantizada también en la base de datos, y cancelación con motivo y estados de asistencia con historial. Los diferenciadores son la garantía doble contra superposiciones, la trazabilidad completa del turno, el sillón como recurso de primera clase y las reglas de negocio testeadas. Reserva online, WhatsApp, ficha clínica, cobros, facturación y obras sociales quedan para etapas posteriores.

<div style="page-break-after: always"></div>

- **Proyecto**: Sistema de gestión de turnos y agenda de pacientes para consultorios odontológicos (mercado argentino). Trabajo Global de Desarrollo de Software, UTN FRM.
- **Fecha del informe y de consulta de todas las fuentes**: 2026-11-25
- **Insumos**: 20 notas de relevamiento en `docs/discovery/sources/*.md` y `docs/restricciones-equipo.md`. Este informe no incorpora datos externos a esas notas.

## 0. Metodología y alcance

**Regiones relevadas.** Se investigaron 20 sistemas distribuidos en tres regiones: Argentina (8 sistemas de proveedores argentinos), Latinoamérica (6 productos de Chile, Perú, Brasil y un proveedor multinacional sin país declarado) e Internacional (5 referentes de EE.UU., Reino Unido y España, más Doctoralia, de origen español pero con operación argentina, que se ubica entre los sistemas que operan en el país).

**Tipos de fuente utilizados.** Sitios oficiales y páginas de producto; páginas de precios; centros de ayuda y documentación pública (docs.bilog.com.ar, odonthia.com/docs, ayuda.softwaredentalink.com, intercom.help/reservo, ayuda.agendapro.com, help.dentally.com, learn.dentrixascend.com, manual de Open Dental); demos públicas (odonto.ar/demo); documentos comerciales (catálogo funcional en PDF de ClinIA); términos, contratos y políticas de privacidad; fichas de App Store; un canal oficial de YouTube enlazado (DENTIDESK); y, de forma marginal, prensa y foros de comunidad.

**Clasificación de la evidencia.** Cada criterio de la consigna se clasificó en las notas como **Comprobado (C)** (verificable en documentación funcional, demo, contrato, tarifa publicada o ficha de tienda), **Afirmación comercial (AC)** (declarado por el proveedor en material de marketing sin documentación verificable) o **No evidenciado** (sin evidencia pública). Este informe respeta esa clasificación: cuando una nota dice "No evidenciado" o "(no publicado)", el informe dice "No evidenciado". Ninguna celda se completó por deducción.

**Limitaciones encontradas** (tomadas de las "Notas del investigador"):

- **Capterra, GetApp y G2 devolvieron HTTP 403** (Dentalink, Doctoralia, Clinic Cloud, Curve Dental, Dentally, Dentrix Ascend, Open Dental, AgendaPro). No se evadió el bloqueo, por lo que no hay reseñas independientes verificadas de esos sitios. La calificación de Clinic Cloud (4/5, 22 opiniones) proviene solo de un extracto del buscador.
- **Sitios renderizados con JavaScript**: las páginas comerciales de Reservo (`reservo.cl/ar/` y la vertical dental) solo expusieron título y meta descripción; la evidencia de Reservo proviene de su centro de ayuda. La ficha de Google Play de Bilog solo devolvió el título, y la de AgendaPro llegó truncada.
- **Centros de ayuda ausentes o caídos**: DENTIDESK (Freshdesk con HTTP 404), DentalSoft, DentalTec, Odonto.ar y Doctocliq no tienen documentación funcional pública. En esos casos casi todo es AC.
- **Documentos no legibles por la herramienta**: el catálogo PDF de ClinIA se convirtió localmente a texto. Las respuestas de las FAQ de Odonto.ar no pudieron extraerse.
- **Fuentes de competidores**: el blog de Odonthia atribuye funciones a Bilog y Odonto.ar. Esas atribuciones **no** se usaron como evidencia.
- **Cifras de adopción autodeclaradas** en casi todos los proveedores (clínicas, usuarios, turnos por mes). Se informan como AC.

**Candidatos descartados o incluidos solo como referencia:**

| Candidato | Tratamiento | Motivo |
|---|---|---|
| Gesden (Infomed, España) | Descartado | El investigador de la región internacional intentó acceder el 2026-11-25: gesden.com corresponde a un sitio no relacionado (Coproma) e infomed.es y gesden.es rechazaron la conexión. Los únicos datos disponibles provenían de blogs de competidores (Pabau), que no cumplen la regla de fuentes oficiales. |
| Clinicorp | Incluido solo como referencia regional | Sitio solo en portugués; las rutas `/es`, `/es-ar` y `/ar` devuelven 404. No opera en Argentina según lo evidenciado (nota clinicorp). |
| Doctocliq | Incluido sin operación argentina | Argentina no figura en el selector de país ni en las adaptaciones fiscales (nota doctocliq). |
| DENTIDESK | Incluido sin operación argentina | Sin mención de Argentina en el sitio. Mercados citados: Chile, República Dominicana y un testimonio de Cabo Verde (nota dentidesk). |
| Clinic Cloud | Incluido como referente internacional | Orientado a España (Verifactu, TicketBAI, REMPe), sin mención de Argentina (nota clinic-cloud). |
| OdontoClinIA | Incluido con salvedad | ClinIA es una plataforma de salud general con línea dental específica (nota odontoclinia). |
| Doctoralia | Incluido con salvedad | Agenda y marketplace generalista, sin funciones odontológicas evidenciadas (nota doctoralia). |

---

## A. Tabla comparativa

### A.1 Tabla principal (ordenada por relevancia para Argentina)

Criterio de orden:

1. **Filas 1–12**: operan en Argentina con funciones o condiciones locales evidenciadas (proveedor argentino, sitio `/ar`, módulo argentino, precios en ARS, ARCA, Mercado Pago u obras sociales). Dentro del grupo se ordenaron por foco odontológico y volumen de evidencia comprobada.
2. **Filas 13–15**: productos latinoamericanos sin operación argentina evidenciada.
3. **Filas 16–20**: referentes internacionales (benchmarks).

| # | Sistema | Proveedor | País | Segmento | Modalidad | Opera en AR | URL oficial | Fecha de consulta |
|---|---|---|---|---|---|---|---|---|
| 1 | Bilog | Bilog (en App Store: "Bilog Soluciones Informáticas"; razón social no publicada en el sitio) | Argentina | Consultorios y clínicas odontológicas; obras sociales y gerenciadoras; universidades (AC) | Web + app móvil iOS/Android (C); desktop (AC) | Sí (proveedor argentino) | https://bilog.com.ar/ | 2026-11-25 |
| 2 | Odonthia | Odonthia, "Desarrollado por Genera Impacto" | Argentina | Odontólogos y consultorios de Argentina; LATAM en USD (AC) | SaaS web, sin apps en tiendas (C) | Sí (proveedor argentino) | https://odonthia.com/ | 2026-11-25 |
| 3 | Dentalink | Engenis SpA (marca Healthatom) | Chile | Consultorios unipersonales a redes multisede (C) | SaaS en la nube (AC) | Sí: sitio `/ar` y "Módulo exclusivo para Argentina" (C). Soporte telefónico sin número argentino | https://www.softwaredentalink.com/ar | 2026-11-25 |
| 4 | Reservo | Reservo (razón social no publicada) | Chile | Consultorios, policonsultorios, clínicas y centros dentales; multiespecialidad (AC) | SaaS web (AC) | Sí: colección "Argentina" en el centro de ayuda (ARCA, Mercado Pago, odontograma) (C) | https://reservo.cl/ar/ | 2026-11-25 |
| 5 | AgendaPro | AgendaPro Inc. | No indicado (selector LATAM y España) | Odontólogos independientes y clínicas de 2 a 30 profesionales; producto multirrubro (C) | SaaS + apps iOS/Android (AC) | Sí: precios en ARS (para cuentas nuevas; **Ajustar**, verificación E.2), Mercado Pago en AR y teléfono argentino (C) | https://agendapro.com/ar/dental/software-odontologico | 2026-11-25 |
| 6 | DentalSoft | DentalSoft (razón social no publicada; oficinas en La Plata y Rosario) | Argentina | Consultorios, clínicas y profesionales independientes (AC) | SaaS en la nube (AC) | Sí (proveedor argentino) | https://dentalsoft.com.ar/ | 2026-11-25 |
| 7 | OdontoClinIA (ClinIA) | EMPRINET 4.0 | Argentina | Consultorios, clínicas pymes, centros municipales, hospitales, cadenas (AC) | SaaS web con instancia por cliente + app de pacientes (AC) | Sí (proveedor argentino) | https://www.clinia.com.ar/odontologia | 2026-11-25 |
| 8 | Órbita (Chat + Gestión) | Órbita Global (La Plata) | Argentina | Clínicas y consultorios odontológicos (AC) | SaaS en AWS, con WhatsApp como canal (AC) | Sí (proveedor argentino) | https://hiorbita.com/ | 2026-11-25 |
| 9 | DentalTec | DentalTec (sitio desarrollado por Tándem Digital; razón social no publicada) | Argentina | Prestadores de obras sociales y entidades gremiales odontológicas (AC) | 100% web (AC) | Sí (proveedor argentino) | https://web.dentaltec.com.ar/ | 2026-11-25 |
| 10 | DentalCore | Alfredo Di Tullio (CUIT en pie de página), La Plata | Argentina | Odontólogos, consultorios y clínicas; Argentina y LATAM (AC) | SaaS web + app de escritorio Windows (AC) | Sí (proveedor argentino) | https://dentalcore.app/ | 2026-11-25 |
| 11 | Odonto.ar | Odonto.ar (sin razón social ni CUIT; Córdoba) | Argentina | Odontólogo individual a clínicas de hasta 10 personas (AC) | SaaS web (AC) | Sí (proveedor argentino) | https://odonto.ar/ | 2026-11-25 |
| 12 | Doctoralia (Agenda para especialistas) | Doctoralia Internet SL (grupo Docplanner) | España | Especialistas de la salud (generalista); odontólogos presentes en el directorio argentino (C) | SaaS + app iOS (C para la app) | Sí: portal argentino con precios en ARS (C) | https://pro.doctoralia.com/ar | 2026-11-25 |
| 13 | Doctocliq | Doctocliq (razón social no publicada) | Perú (sede no indicada en el sitio; teléfonos y horario de Perú) | Consultorios y clínicas dentales, médicas y estéticas (AC) | SaaS + app iOS (AC) | No evidenciado | https://www.doctocliq.com/ | 2026-11-25 |
| 14 | DENTIDESK | DENTIDESK (Providencia, Santiago) | Chile | Clínicas dentales, centros médicos, academia, sindicatos (AC) | Web + apps (AC) | No evidenciado | https://www.dentidesk.com/ | 2026-11-25 |
| 15 | Clinicorp | Clinicorp | Brasil | Clínicas odontológicas y de estética de Brasil, redes y franquicias (AC) | Nube + apps (AC) | No (solo Brasil y portugués) | https://www.clinicorp.com/ | 2026-11-25 |
| 16 | Dentrix Ascend | Henry Schein One | EE.UU. | Consultorios de EE.UU., desde nuevos hasta DSO (AC) | SaaS 100% nube (AC) | No evidenciado | https://www.dentrixascend.com/ | 2026-11-25 |
| 17 | Dentally | Henry Schein One UK Ltd | Reino Unido | Consultorios y grupos de UK, AU, CA, IE, NZ (C) | SaaS en la nube (AC) | No evidenciado | https://dentally.com/ | 2026-11-25 |
| 18 | Open Dental | Open Dental Software | EE.UU. | Consultorios (principalmente EE.UU.), grupos, escuelas (C) | Híbrida: local Windows + nube opcional + apps (C) | Argentina no mencionada; comprable como "otros países", con soporte solo en inglés (C) | https://www.opendental.com/ | 2026-11-25 |
| 19 | Curve Dental | CD Newco, LLC | EE.UU. | Consultorios independientes, DSO y startups de EE.UU./Canadá (AC) | SaaS en AWS + app (AC) | No evidenciado | https://www.curvedental.com/ | 2026-11-25 |
| 20 | Clinic Cloud | Doctoralia España SL (grupo Docplanner) | España | Clínicas sanitarias multiespecialidad en España; dental vía plan Max (C) | SaaS en navegador (AC) | No evidenciado | https://clinic-cloud.com/ | 2026-11-25 |

### A.2 Tablas detalladas por criterio de la consigna

**Leyenda.**

- **(C)**: Comprobado.
- **(AC)**: Afirmación comercial.
- **No evidenciado**: sin evidencia pública en las fuentes consultadas.
- **"No (C)"**: el proveedor declara o documenta que la función no existe.
- **"por títulos"**: la evidencia es el título de un artículo del centro de ayuda, sin lectura detallada.

La numeración (#) coincide con la tabla A.1.

#### A.2.1 Agenda

| # | Sistema | Vista diaria/semanal | Múltiples profesionales | Sillones/boxes | Duración variable | Bloqueos | Sobreturnos | Prevención de solapamientos |
|---|---|---|---|---|---|---|---|---|
| 1 | Bilog | Sí (C): diaria, semanal, por profesional | Sí (C) | Mención de "consultorios" (AC) | "Estirar" turnos (AC); anular franja como recurso (C) | Sí (C): anular horario; feriados no cubiertos | Sí (C) | No evidenciado |
| 2 | Odonthia | Sí (C): día, semana, mes | Sí (C): columna por profesional | Sí (C): sillones por sede que evitan choques | Sí (C): sugerida desde tarifario | Sí (C): rangos, horarios parciales, feriados nacionales | Sí (C): forzado con advertencia | Sí (C): mismo profesional; entre profesionales solo si se configuran sillones (opcional, por sede). El aviso «Ese horario está ocupado» aparece al reprogramar un turno (**Ajustar** 2026-11-26) |
| 3 | Dentalink | Sí (C): diaria, semanal, global | Sí (C) | Sí (C): box sin costo / sillón con costo | Sí (C): por motivo de atención | No evidenciado | Sí (C): "sobreagendamiento" | No evidenciado |
| 4 | Reservo | Sí (C): día/semana y vista múltiple | Sí (C) | Sí (C): agendas por box | No evidenciado | Sí (C, por títulos): bloqueos y feriados | No evidenciado | No evidenciado |
| 5 | AgendaPro | No evidenciado | Sí (C): desde plan Básico | Por odontólogo, práctica y sillón (AC) | No evidenciado | Sí (C) | Sí (C): sobrecupo con alerta | Alerta, no bloqueo (C) |
| 6 | DentalSoft | Día, semana, mes (AC) | Sí (AC) | No evidenciado | No evidenciado | Feriados y horarios (AC) | Sí (AC) | "Detección automática de superposición" (AC) |
| 7 | OdontoClinIA | Día, semana, mes (AC) | Sí (AC) | Por sillón (AC) | Por práctica (AC) | Excepciones, licencias, feriados (AC) | Con tope por profesional (AC) | No evidenciado (en agenda) |
| 8 | Órbita | No evidenciado | Perfiles de profesional; agenda por profesional no detallada (AC) | Agenda por sillón (AC) | No evidenciado | Tutorial de bloqueo, sin detalle (AC) | No evidenciado | "No permite el choque" (AC) |
| 9 | DentalTec | No evidenciado | Sí (AC) | No evidenciado | Intervalos por odontólogo, no por prestación (AC) | No evidenciado | No evidenciado | No evidenciado |
| 10 | DentalCore | Día, 3 días, semana, mes (AC) | Sí (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 11 | Odonto.ar | Día, semana, mes (AC) | Agenda compartida (AC) | No evidenciado | Por motivo, 30/60 min, en reserva online (C, demo) | No evidenciado | No evidenciado | No evidenciado |
| 12 | Doctoralia | Diaria en la app (C); semanal no evidenciada | No evidenciado | No evidenciado (solo múltiples consultorios/direcciones) | Configurable (AC) | Solo días no laborables (AC) | No evidenciado | No evidenciado |
| 13 | Doctocliq | No evidenciado | Por doctor (AC) | Por consultorio (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 14 | DENTIDESK | No evidenciado | No evidenciado | No evidenciado | 15/30/40 min (AC; no se ve en los videos, verificado 2026-11-26) | Feriado cargado bloquea la agenda (C, video oficial; **Ajustar** 2026-11-26) | No evidenciado | No evidenciado |
| 15 | Clinicorp | No evidenciado | Sí (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 16 | Dentrix Ascend | No evidenciado | Sí (C) | Sí (C): operatories | Sí (C): patrones de tiempo | No evidenciado (explícitos) | Con advertencia de doble reserva (C) | Advertencia configurable, no bloqueo (C) |
| 17 | Dentally | Día (C); semanal no evidenciada | Sí (C) | Sí (C): campo "Room" | Sí (C) | "Sessions" por motivo (C); bloqueos explícitos no evidenciados | No evidenciado | No evidenciado; la comunidad reporta un solapamiento vía portal |
| 18 | Open Dental | Sí (C): día por sillón y semana | Sí (C) | Sí (C): operatories | Sí (C): patrón por procedimientos | Sí (C): blockouts | Configurable, "allow overlap" (C) | Configurable (C) |
| 19 | Curve Dental | No evidenciado | Por profesional (AC) | Por sillón (AC) | Incrementos configurables (AC) | Sí (AC) | No evidenciado | No evidenciado |
| 20 | Clinic Cloud | No evidenciado | Sí (C, tarifas por 1/3/5 agendas) | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |

#### A.2.2 Turnos digitales y automatización

| # | Sistema | Turnos online / enlace | WhatsApp / chatbot | Confirmación, cancelación, reprogramación | Lista de espera | Recordatorios automáticos | Seguimiento de ausentes / campañas | Google Calendar |
|---|---|---|---|---|---|---|---|---|
| 1 | Bilog | Sí (C: existe guía; detalle AC) | Recordatorios WhatsApp; IA iAngela (AC) | Estados Confirmado/Cancelado (C); reprogramar arrastrando (AC) | No evidenciado | WhatsApp/SMS/email (C: guía; automatización AC) | Encuestas (C); ausentismo (AC); campañas no evidenciadas | No evidenciado |
| 2 | Odonthia | Sí (C): con aprobación de solicitudes | Manual gratis, automático pago (C) | El paciente confirma o cancela por link; reprogramación por arrastre (C) | No evidenciado | Sí (C): plan Pro o créditos, plantilla sin link | Ausencias y pacientes a reactivar; campañas de email (C) | Sí (C): Google/Apple e iCal |
| 3 | Dentalink | Sí (C) | Notificaciones automáticas (C, servicio adicional pago); Contact Center IA (AC) | Botones confirmar/cancelar; reprogramación masiva (C) | No evidenciado | WhatsApp un día antes; email (C) | Mail marketing, encuestas, tareas (C, por títulos) | Unidireccional (C) |
| 4 | Reservo | Sí (C, por títulos) | Créditos WhatsApp; sin chatbot (C) | Parcial (C): cancelación por WhatsApp no documentada | No evidenciado | WhatsApp (C); email (AC) | Mailing, club de puntos (AC) | No evidenciado |
| 5 | AgendaPro | Sí (C): sitio, iframe, Google, marketplace | Recordatorios (C); agentes IA (AC) | Sí (C, por títulos) | No evidenciado | Sí (C): cupo de 50 por plan/profesional | Email marketing, campañas WhatsApp, CRM (C) | Sí (C) |
| 6 | DentalSoft | Solo plan Pro (AC) | Recordatorios + recepcionista IA (AC) | Portal del paciente (AC) | No evidenciado | Solo Pro; manual en Gestión (AC) | Reactivación en Pro (AC) | Sí (AC) |
| 7 | OdontoClinIA | Turnero web y app (AC) | Asistente IA (AC) | Por WhatsApp y portal (AC) | No evidenciado | WhatsApp y email (AC) | No evidenciado | No evidenciado |
| 8 | Órbita | Vía asistente WhatsApp; "turnero" (AC) | Asistente IA, API oficial de Meta (AC) | Agenda, confirma, reprograma (AC) | No evidenciado | Confirmaciones por plantilla; recordatorios no detallados (AC) | Servicio de marketing aparte (AC) | No evidenciado |
| 9 | DentalTec | No evidenciado | Recordatorios, sin chatbot (AC) | Solo confirmación por WhatsApp (AC) | No evidenciado | Sí (AC) | No evidenciado (solo métrica declarada) | No evidenciado |
| 10 | DentalCore | No evidenciado (solo confirmación por link) | Bandeja compartida; asistente "Sani" (AC) | Confirmación 48 h y cancelación por link (AC) | No evidenciado | 24 h por WhatsApp/SMS/email (AC) | No evidenciado | No evidenciado |
| 11 | Odonto.ar | Sí (C, demo pública) | No evidenciado | Reglas configurables (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 12 | Doctoralia | Sí (C en contrato; AC en landing) | WhatsApp en recordatorios (AC); chatbot no evidenciado | Desde el recordatorio (AC) | Aviso automático, plan VIP (AC) | Email + push / SMS según plan (AC) | Campañas SMS (AC) | No evidenciado (AR) |
| 13 | Doctocliq | Autoagendamiento (AC) | Recordatorios; Soyla IA como add-on (AC) | Confirmación vía IA (AC) | No evidenciado | WhatsApp y email (AC) | Campañas WhatsApp, add-on (AC) | No evidenciado |
| 14 | DENTIDESK | Botón en la web de la clínica (AC) | "Próximamente" (AC) | Email con confirmar/anular (AC) | No evidenciado | Email (AC) | Email para controles (AC) | No evidenciado |
| 15 | Clinicorp | Vía agentes IA (AC) | Agentes IA 24/7 (AC) | Por agentes IA (AC) | No evidenciado | WhatsApp (AC) | Alerta de retorno, follow-up (AC) | No evidenciado |
| 16 | Dentrix Ascend | Sí (C); Reserve with Google (AC) | Texto bidireccional (AC); WhatsApp no evidenciado | No evidenciado | No evidenciado | Sí (AC) | Recall con enlace de reserva (C) | No evidenciado |
| 17 | Dentally | Sí (C, tabla de precios: Essentials/Pro) | No evidenciado | Sí (C): estados y motivos de cancelación | "Short-notice filler" (AC) | Sí (C) | Recalls y reporte de efectividad (C) | No evidenciado |
| 18 | Open Dental | Web Sched (C, con costo) | SMS (EE.UU./CA); WhatsApp no evidenciado | Sí (C) | Lista ASAP + Web Sched ASAP (C) | eReminders (C) | Recall list, email masivo (C) | No evidenciado |
| 19 | Curve Dental | Sí (AC) | SMS bidireccional (AC); WhatsApp no evidenciado | No evidenciado | Smart Fill (AC) | SMS/email (AC) | Recall, reseñas (AC) | No evidenciado |
| 20 | Clinic Cloud | Vía Doctoralia (AC) | WhatsApp (C, ayuda); Noa Reception (AC) | Confirmaciones (AC) | No evidenciado | WhatsApp/SMS/email (C) | CRM de prospectos (AC) | No evidenciado |

#### A.2.3 Funcionalidad clínica

| # | Sistema | Ficha clínica / anamnesis | Odontograma | Periodontograma | Imágenes / radiografías | Presupuestos / planes | Firma digital |
|---|---|---|---|---|---|---|---|
| 1 | Bilog | Sí (C, guía); anamnesis no evidenciada | Sí (AC) | No evidenciado | Sí (AC); IA sobre RX (AC) | Sí (C) | QR/link, Ley 25.506 (AC) |
| 2 | Odonthia | Sí (C) | FDI con versiones (C) | Completo (C) | RX, fotos, 3D (C) | Por ítem con estados (C) | Por link con IP y hash (AC) |
| 3 | Dentalink | Sí (C, por títulos) | Por caras, FDI/ADA, versionado (C) | Con NIC, versionado (C) | Almacenamiento (C); IA (AC) | Sí (C, por títulos) | Sí (C, por títulos) |
| 4 | Reservo | Personalizable (AC) | Por pieza, ligado a presupuesto (C) | No evidenciado | No evidenciado | Desde el odontograma (C) | No evidenciado |
| 5 | AgendaPro | Ficha (C, desde Premium); anamnesis (AC) | Sí (AC) | No evidenciado | Sí (AC) | Sí (C, Premium) | Sí (AC) |
| 6 | DentalSoft | Sí (AC) | 18 estados, FDI (AC) | No evidenciado | Estudios y 3D (AC) | Desde catálogo con cobertura (AC) | Sí, tipo no especificado (AC) |
| 7 | OdontoClinIA | HC dental con CIE-10 (AC) | FDI versionado (AC) | No evidenciado | Adjuntos (AC); PACS en desarrollo | Plan con importe (AC) | Sí (AC) |
| 8 | Órbita | HC firmada (AC) | Sí, dictado por voz (AC) | Sí (AC) | Fotos por QR (AC) | Por pieza (AC) | "Historia firmada" (AC) |
| 9 | DentalTec | Documentos (AC); anamnesis no evidenciada | CIE-10 (AC) | No evidenciado | Adjuntas (AC) | No evidenciado | No evidenciado |
| 10 | DentalCore | Con anamnesis (AC) | FDI, carga por voz (AC) | Sí (AC) | Sí (AC); IA "Muy pronto" | Plan de tratamiento (AC); presupuesto no evidenciado | No evidenciado |
| 11 | Odonto.ar | HC (AC) | Interactivo (AC) | No evidenciado | Sí (AC) | Sí (AC) | No evidenciado |
| 12 | Doctoralia | Episodios clínicos, Plus/VIP (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado | No evidenciado |
| 13 | Doctocliq | Con anamnesis (AC) | Todos los planes (AC) | Todos los planes (AC) | Fotos y documentos (AC) | Solo mencionado en un testimonio (AC) | No evidenciado |
| 14 | DENTIDESK | Por especialidad (AC) | Múltiples notaciones (AC) | Ficha de periodoncia (AC) | Sí (AC) | Sí (AC) | No evidenciado |
| 15 | Clinicorp | Prontuário con anamnesis (AC) | No evidenciado | No evidenciado | Integraciones RX, IA (AC) | Mencionado (AC) | Sí (AC) |
| 16 | Dentrix Ascend | Charting con IA (AC) | Charting (AC) | "Voice perio" (AC) | En la nube con IA (AC) | Solo ortodoncia (AC) | Contratos de ortodoncia (AC) |
| 17 | Dentally | Historia médica (AC) | Sí (C) | Sí (C) | Vision con IA (AC) | Listados (AC) | No evidenciado |
| 18 | Open Dental | Formularios (C) | 3D (AC) | Completo (C) | Sí (C) | No evidenciado | No evidenciado |
| 19 | Curve Dental | Notas clínicas (AC) | Sí (AC) | Sí (AC) | Nativas (AC) | Sí (AC) | No evidenciado |
| 20 | Clinic Cloud | Con IA (AC) | Solo plan Max (AC) | Asignación por plan ambigua (AC) | No evidenciado | Desde plan Pro (AC) | Sí; certificada en Max (AC) |

#### A.2.4 Administración e integraciones

| # | Sistema | Caja / cobros / señas | Factura AFIP/ARCA | Mercado Pago | Obras sociales / prepagas | Liquidaciones a profesionales | Reportes | API pública | Sucursales |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Bilog | Caja y pagos (C); señas no evidenciadas | Genérica, sin nombrar ARCA (AC) | No evidenciado | Liquidación de OS (C, guía) | Sí (C) | Sí (C) | No (C, declarado) | Filtro por sucursal (AC) |
| 2 | Odonthia | Caja + seña (C) | No (C, declarado) | No evidenciado (solo para la suscripción) | Nomenclador por cobertura y copago; no liquida OS (C) | Comisiones (C) | Sí (C) | No evidenciado | Sedes (C) |
| 3 | Dentalink | Caja, cuotas (C, por títulos) | No evidenciado | No evidenciado | Módulo AR: alta, cobro, conciliación (C) | Sí (C, por títulos) | Sí (C, por títulos) | Complemento pago (AC) | Sí (C) |
| 4 | Reservo | Caja y venta desde la cita (C) | Sí (C): certificados y punto de venta | Sí (C, por título) | No evidenciado | Comisiones (AC) | Sí (AC) | No evidenciado | No evidenciado |
| 5 | AgendaPro | Caja, seña, links de pago (C) | No (C): "Próximamente" | Sí (C): Checkout Pro, comisión 2%/1% + IVA | No evidenciado | Comisiones (C) | Sí (C) | Sí (C): US$ 200/mes | Sí (C) |
| 6 | DentalSoft | Caja y señas (AC) | No evidenciado | Medio de cobro en Pro (AC) | Cobertura y liquidaciones (AC) | Por porcentaje (AC) | Sí (AC) | No evidenciado | Sí (AC) |
| 7 | OdontoClinIA | Multimoneda, arqueo (AC) | Sí (AC) | No evidenciado | OS, PUCO, PAMI, SUMAR (AC) | "En desarrollo" (AC) | Sí (AC) | No evidenciado | Sí (AC) |
| 8 | Órbita | Caja por sede (AC) | Desde el cobro, Libro IVA (AC) | Como medio de pago (AC) | Presentación por período y débitos (AC) | % por profesional y OS (AC) | Sí (AC) | No evidenciado | Sí (AC) |
| 9 | DentalTec | No evidenciado | Sí (AC) | No evidenciado | Validación en tiempo real, 15+ OS (AC) | A prestadores (AC) | PDF/Excel (AC) | No evidenciado | Jerarquía de entidades, no sucursales (AC) |
| 10 | DentalCore | Desde la agenda, multi caja (AC) | Factura C (AC) | Cobro a cuenta propia (AC) | 65 precargadas (AC) | Solo coberturas (AC) | Producción (AC) | No evidenciado (solo HL7 FHIR) | Cada sede como clínica aparte (AC) |
| 11 | Odonto.ar | Panel de finanzas (AC) | No evidenciado | No evidenciado (solo para la suscripción) | Parte OS/paciente (AC) | No evidenciado | Panel (AC) | No evidenciado | No evidenciado |
| 12 | Doctoralia | No evidenciado | No evidenciado | No evidenciado | Filtro en el directorio (C); gestión no evidenciada | No evidenciado | No evidenciado | No evidenciado | Múltiples direcciones (AC) |
| 13 | Doctocliq | Multimoneda (AC) | No evidenciado | No evidenciado | No evidenciado | Comisiones (AC) | Plan Avanzado (AC) | "API para citas" en add-on (AC) | Sedes adicionales (AC) |
| 14 | DENTIDESK | No evidenciado | No evidenciado | No evidenciado | No evidenciado (solo convenios) | Por producción (AC) | +20 reportes (AC) | No evidenciado | Sí (AC) |
| 15 | Clinicorp | Clinipay (AC) | No evidenciado | No evidenciado | No evidenciado | Comisiones (AC) | +50 (AC) | No evidenciado | Redes y franquicias (AC) |
| 16 | Dentrix Ascend | Cobranzas (AC); reporte exportable (C) | No evidenciado | No evidenciado | No evidenciado (seguros de EE.UU.) | No evidenciado | Dashboards (AC); exportación (C) | API Exchange (AC) | Sí (C) |
| 17 | Dentally | Pagos vía Portal (AC); facturas en la API (C) | No evidenciado | No evidenciado | No evidenciado (NHS) | Monthly Accounts (AC) | Sí (AC) | Sí (C): documentada | Sí (C) |
| 18 | Open Dental | Portal de pagos (C) | No evidenciado | No evidenciado | No evidenciado (seguros de EE.UU.) | No evidenciado | Sí (C) | Sí (C): REST + FHIR | Clinics (C) |
| 19 | Curve Dental | Curve Pay (AC) | No evidenciado | No evidenciado | No evidenciado (seguros de EE.UU.) | No evidenciado | Sí (AC) | No evidenciado | DSO (AC) |
| 20 | Clinic Cloud | Caja, bonos (AC) | No evidenciado | No evidenciado | No evidenciado | Desde Pro (AC) | Sí (AC) | No evidenciado | Sí (AC) |

#### A.2.5 Operación, seguridad y comercial

| # | Sistema | Roles y permisos | Auditoría / trazabilidad | Exportación de datos | Seguridad / respaldo | Normativa AR declarada | Soporte y capacitación | Prueba / plan gratuito | Precios publicados | Costos adicionales | Evidencia de adopción |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Bilog | Por perfil (AC) | "Trazabilidad de los movimientos" (AC) | No evidenciado | No evidenciado | Solo Ley 25.506 (AC) | Centro de ayuda (C); teléfono y email local | "Plan gratuito" mencionado, sin límites (C) | No evidenciado (Premium por usuario/mes, sin montos) | Configuración inicial sin costo (AC) | +1.500 clínicas (AC); App Store 3,4/5 con 17 calificaciones (C, verificado el 2026-11-26) |
| 2 | Odonthia | Titular, Profesional, Secretaría (C) | Registro de acciones sensibles (AC) | ZIP de planillas (C) | AWS São Paulo, backups diarios (AC) | Ley 26.529 (AC) | Docs públicas (C) | Gratis permanente sin límite de pacientes (C) | Pro $164.900 ARS/mes IVA incl.; US$ 97 (C) | Packs de créditos IA (C) | "4.948 registrados" (AC) |
| 3 | Dentalink | 3 tipos con permisos granulares (C) | Versionado del odontograma; sin log general (C, parcial) | Reportes Excel (C, parcial) | ISO 27001, AWS (AC) | No evidenciado (cita ley chilena y RGPD) | Centro de ayuda (C); sin teléfono argentino | No evidenciado (demo con ventas) | No evidenciado (cotización) | Contact Center IA USD 50 (promo); resto sin precio (C) | +15.000 clínicas (AC) |
| 4 | Reservo | Vista por usuario (C, parcial) | Por cita: quién creó, modificó o pagó (C) | No evidenciado | No evidenciado | No evidenciado | Centro de ayuda (C) | Solo demo (AC) | No evidenciado (plan único según tamaño) | Créditos WhatsApp, sin montos (C) | "500 clientes" en página antigua (AC) |
| 5 | AgendaPro | Colección "Usuarios" (C, parcial) | Historial de la reserva (C) | No evidenciado | AWS, respaldos (AC) | Leyes 25.326 y 26.529 (AC) | Centro de ayuda y academia (C) | 14 días (AC; conflicto con la página de planes) | Desde $9.900 ARS/mes IVA incl., cuentas nuevas; Básico/Premium con 2 profesionales y Pro IA con 5 (C; **Ajustar** 2026-11-25) | IA, WhatsApp, API, comisión MP (C) | 4.8 con +1.200 reseñas (AC) |
| 6 | DentalSoft | Configurables (AC) | Historial del odontograma y de caja (AC) | Backups y exportación (AC) | TLS, hash (AC) | Ley 25.326 y AAIP (AC) | WhatsApp y email (AC) | Gratis 3 meses, 50 turnos/mes (AC) | $30.000 / $60.000 por profesional/mes (C) | WhatsApp 0,026 USD/msj (C) | Google 5,0 con 11 reseñas (C) |
| 7 | OdontoClinIA | 16 tipos de usuario (AC) | Exportable (AC) | HC completa (AC) | Backups cada 10 min (AC) | Sello Ley 25.326; ReNaPDiS (AC) | 24/7 vs. L–V 8–16 (AC, inconsistente) | Sin prueba; demo de 45 min (AC) | No evidenciado (cotización) | $0 por usuario (AC) | +500 centros (AC) |
| 8 | Órbita | 5 perfiles + personalizados (AC) | Correcciones, aperturas, exportaciones (AC) | Excel (AC) | 2FA, AWS (AC) | No evidenciado | Academia (C, índice) | Turnero gratis 6 meses, promoción (AC) | No evidenciado ("a cotizar") | Dictado aparte, sin montos (C) | Clínicas nombradas (AC) |
| 9 | DentalTec | 10 roles (AC) | "Audit trail completo" (AC) | Reportes PDF/Excel (AC) | Respaldo, bcrypt (AC) | No evidenciado | 24/7 (AC) | "Probá gratis" sin condiciones (AC) | No evidenciado | WhatsApp desde USD 9 por 50 msj (C) | +2.000 profesionales; casos nombrados (AC) |
| 10 | DentalCore | Por rol (AC) | Inalterable, con IP y dispositivo (AC) | PDF y HL7 FHIR (AC) | AES-256, 2FA, restauraciones (AC) | Ley 25.326; ISO 27001 sin certificar (AC) | App, WhatsApp, videollamada (AC) | 7 días (AC) | USD 50/mes (2 usuarios); landing $75.000 ARS (C, inconsistente) | SMS USD 0,35; espacio extra (C) | No evidenciado |
| 11 | Odonto.ar | Por miembro (AC) | Solo odontograma (AC) | A pedido tras la baja (AC) | Supabase, cifrado (AC) | Ley 25.326 y AAIP (AC) | WhatsApp, formulario (AC) | 30 días (AC) | USD 29/49/99 cobrados en ARS (C) | No evidenciado | No evidenciado |
| 12 | Doctoralia | No evidenciado | No evidenciado | Mecanismo no evidenciado (AC: "propiedad de los datos") | AWS, RGPD (AC) | Ley 25.326 en el contrato (C) | Atención al cliente (AC) | "Versión gratuita" sin detalle (AC) | 25.000 / 35.000 / 55.000 ARS/mes, anual (C) | Web 4.000 ARS/mes; permanencia 12 meses (C) | 110.000 profesionales listados; App Store 3,4/5 con 34 valoraciones (C) |
| 13 | Doctocliq | Sí (AC) | No evidenciado | No evidenciado | Sin detalle (AC) | No evidenciado | Email, chat, webinars (AC) | Gratis permanente (30 pacientes/mes); prueba de 7 días (C) | USD 0/19/29/49 por doctor (C) | Add-ons sin precio (C) | +6.500 profesionales (AC) |
| 14 | DENTIDESK | Sí (AC) | No evidenciado | No evidenciado | No evidenciado | No evidenciado | Teléfono/email; FAQ con 404; YouTube (C, enlaces) | 15 días (AC) | No evidenciado | No evidenciado | 3 testimonios (AC) |
| 15 | Clinicorp | No evidenciado | No evidenciado | No evidenciado (solo importación) | Cifrado, backups (AC) | No evidenciado | L–V + asistentes virtuales (AC) | No evidenciado | R$ 149,90 / R$ 369,90 (C) | Implementación, migración (C) | +32 mil clínicas (AC) |
| 16 | Dentrix Ascend | "Role-based access" (AC) | Audit log exportable a CSV (C) | CSV, parcial (C) | SOC 2 (AC) | No evidenciado | Learning center (C); 24/7 (AC) | No evidenciado | Solo Starter: USD 199/mes el primer año (C) | Add-ons sin precio (C) | "80k+" usuarios (AC) |
| 17 | Dentally | Niveles, 2FA, restricción por IP (AC) | Auditorías de sesión (C) | Historial de tratamientos, parcial (C) | Cifrado, 2FA (AC) | No evidenciado | Chat/teléfono según plan (C) | No (C): solo trial limitado de notas IA | £134–£1.021 + VAT (C) | Integraciones custom solo en Pro (C) | Casos publicados (C) |
| 18 | Open Dental | Granulares (C) | Audit trail con verificación de integridad (C) | Base de datos documentada (C) | Permisos y auditoría (C); respaldo no evidenciado | No evidenciado | Solo en inglés (C) | Prueba sin vencimiento, 30 pacientes (C) | USD 89/mes "otros países" (C) | eServices, nube, profesional extra (C) | Alcance internacional (C) |
| 19 | Curve Dental | No evidenciado | Solo infraestructura (AC) | Excel "en cualquier momento" (AC) | AWS, HIPAA (AC) | No evidenciado | 24/7 desde EE.UU. (AC) | No evidenciado | No evidenciado | "None of the Extra Costs" (AC) | "4.000+ conversiones" (AC) |
| 20 | Clinic Cloud | No evidenciado | Mencionada (AC) | No evidenciado | RGPD, cifrado (AC) | No evidenciado | Centro de ayuda (C) | Sin tarjeta (AC) | 29 / 49 / 79 € + IVA (C) | Agenda +10 €; Noa Notes 20 € (C) | "+12.000 doctores" (AC); Capterra 4/5 solo por extracto |

#### A.2.6 Síntesis: fortalezas, limitaciones y diferenciales (según las notas)

| # | Sistema | Fortalezas | Limitaciones | Diferenciales evidentes |
|---|---|---|---|---|
| 1 | Bilog | Trayectoria, centro de ayuda público, app móvil, presentismo y sobreturnos documentados, liquidaciones (C) | Sin precios públicos ni API; ARCA, MP y Google Calendar no evidenciados (C) | Auditoría odontológica para obras sociales (AC) |
| 2 | Odonthia | Agenda muy completa y documentada; plan gratuito; periodontograma (C) | Sin ARCA ni liquidación de OS, sin recetas ni lista de espera (C) | Freemium sin límite + documentación pública detallada (C) |
| 3 | Dentalink | Profundidad clínica documentada; módulo de OS para Argentina; box/sillón (C) | Sin precios; sin ARCA; sin MP; marco legal chileno (C) | Odonto/perio versionados; conciliación con OS (C) |
| 4 | Reservo | ARCA + Mercado Pago documentados; box/profesional; trazabilidad (C) | Sitio comercial ilegible (JS); sin precios; sin perio ni OS (C) | Integración ARCA documentada paso a paso (C) |
| 5 | AgendaPro | Precios en ARS; MP y señas; reserva online fuerte; API pública (C) | Sin ARCA (próximamente) ni OS; odontograma solo declarado; generalista (C) | Marketplace + IA de captación (AC); precios en pesos (C) |
| 6 | DentalSoft | Precio público en pesos, WhatsApp/IA, Google Calendar (AC) | Sin documentación pública; ARCA, sillones, perio y lista de espera no evidenciados | Recepcionista IA + sitio web de la clínica (AC) |
| 7 | OdontoClinIA | Integraciones estatales y agenda rica (AC) | Sin precios ni prueba; liquidación a profesionales en desarrollo | ReNaPDiS + PAMI/SUMAR/PUCO (AC) |
| 8 | Órbita | IA de WhatsApp para recepción; ERP con OS y ARCA (AC) | Sin precios ni prueba; agenda poco descrita; sin documentación técnica | Asistente con triage clínico + agenda por sillón (AC) |
| 9 | DentalTec | Profundidad en OS y facturación gremial (AC) | Agenda poco descrita; sin precios ni documentación | Validación previa contra OS; circuito Círculo → Federación → CORA (AC) |
| 10 | DentalCore | Seguridad y exportabilidad descritas; ficha completa; precio único (AC) | Agenda sin detalle; producto nuevo sin adopción visible; inconsistencia de precios | HL7 FHIR, auditoría inalterable, asistente de voz (AC) |
| 11 | Odonto.ar | Precio público; reserva online con demo navegable (C) | Sin recordatorios, ARCA ni liquidaciones evidenciados; sin adopción visible | Reglas de reserva online por clínica (AC) |
| 12 | Doctoralia | Captación vía directorio; precios en ARS (C) | Sin funciones odontológicas, ARCA ni OS; contrato anual bajo ley española (C) | Marketplace + agenda (C) |
| 13 | Doctocliq | Plan gratuito; odonto + perio en todos los planes (AC) | Sin presencia argentina ni centro de ayuda; sin ARCA/MP/OS (C) | Freemium dental con IA en WhatsApp (AC) |
| 14 | DENTIDESK | Fichas por especialidad; versión académica (AC) | Sin presencia argentina, sin WhatsApp, sin precios; ayuda caída (C) | Foco en especialidades y en el sector académico (AC) |
| 15 | Clinicorp | Escala; fintech integrada; costos de implementación transparentes (C/AC) | Solo Brasil y portugués (C) | Clinipay + agentes IA (AC) |
| 16 | Dentrix Ascend | Documentación pública detallada; control de doble reserva (C) | Orientado a EE.UU.; sin precios mayoritarios; sin español (C) | Patrones de tiempo y advertencias de solapamiento configurables (C) |
| 17 | Dentally | Agenda con salas y sesiones, perio, API, usuarios ilimitados (C) | No disponible en Argentina ni en español (C) | Precio por sillón; "sessions" de agenda (C) |
| 18 | Open Dental | Manual público exhaustivo, API, precios transparentes, agenda configurable (C) | Ya no es open source; soporte solo en inglés; instalación Windows (C) | Base de datos documentada + API local (C) |
| 19 | Curve Dental | Suite en la nube; Smart Fill (AC) | Solo EE.UU./Canadá; sin precios ni API pública (C) | Relleno automático de huecos (AC) |
| 20 | Clinic Cloud | Precio de entrada bajo, IA, firma digital (AC) | Normativa fiscal española; sin uso en AR; odontograma solo en el plan más caro (C) | Integración con Doctoralia + IA "Noa" (AC) |

### A.3 Fuentes por sistema

La lista completa de fuentes de cada sistema, con su fecha de consulta, está en **Referencias completas**, al final del informe.

## B. Matriz de puntuación (0 a 5)

### B.1 Nota metodológica

**Construcción del puntaje.** Cada dimensión se descompone en subítems que corresponden a criterios de la consigna. Cada subítem recibe un valor de 0 a 5, el puntaje de la dimensión es el promedio de sus subítems (redondeado a un decimal) y el total es la suma ponderada de las dimensiones (0–5, dos decimales).

| Dimensión (peso) | Subítems |
|---|---|
| D1. Gestión de turnos y automatización (25 %) | vista día/semana; múltiples profesionales; sillones/boxes; duración variable; bloqueos; sobreturnos (como función controlada); prevención de solapamientos; recordatorios automáticos; lista de espera |
| D2. Funcionalidad odontológica clínica (20 %) | ficha/anamnesis; odontograma; periodontograma; imágenes; presupuestos/planes; firma digital |
| D3. Integraciones locales y WhatsApp (15 %) | WhatsApp/chatbot; Mercado Pago; obras sociales/prepagas; Google Calendar; API pública |
| D4. Administración, cobros y facturación (15 %) | caja/cobros/señas; factura AFIP/ARCA; liquidaciones a profesionales; reportes; sucursales |
| D5. Experiencia del paciente (10 %) | turnos online; confirmación/cancelación/reprogramación por el paciente; seguimiento de ausentes/campañas |
| D6. Seguridad, exportación y trazabilidad (10 %) | roles y permisos; auditoría/trazabilidad; exportación; seguridad/respaldo; normativa argentina declarada |
| D7. Precio y facilidad de adopción (5 %) | precios publicados; prueba/plan gratuito; soporte y capacitación; costos adicionales visibles |

**Escala de cada subítem:**

| Valor | Significado |
|---|---|
| 0 | No evidenciado, no ofrecido, declarado inexistente ("No (C)") o anunciado como "próximamente" o "en desarrollo". |
| 1 | Afirmación comercial parcial, ambigua o muy limitada, o evidencia comprobada que cubre solo una parte marginal del criterio. |
| 2 | Afirmación comercial clara. **Es el tope para cualquier subítem que solo tenga AC.** |
| 3 | Presente y comprobado en forma básica. Incluye la evidencia "por títulos" del centro de ayuda. |
| 4 | Comprobado y completo (por ejemplo, con configuración, variantes o reglas documentadas), o comprobado y local en su forma básica. |
| 5 | Comprobado, completo y local. Cuentan como "local": ARCA, Mercado Pago, obras sociales argentinas, precios en ARS (o cobrados en ARS) y feriados nacionales. |

**Tratamiento de "No evidenciado".** Un criterio "No evidenciado" puntúa 0 en ese subítem. **Esto penaliza la falta de evidencia pública, no necesariamente la ausencia de la función.** Un proveedor puede tener la función y no documentarla. Es una decisión deliberada: para un comprador argentino, lo que no se puede verificar antes de contratar es un riesgo.

**Sesgo asumido.** Los proveedores con centro de ayuda público (Odonthia, Dentalink, Open Dental, AgendaPro, Dentally) quedan favorecidos frente a los que solo publican landing pages (DentalSoft, Órbita, DentalTec, DentalCore). Por eso la matriz mide **"funcionalidad verificable públicamente"**, no calidad real del producto. Las demos de la sección D buscan corregir ese sesgo.

### B.2 Matriz ponderada (ordenada por total)

| Pos. | Sistema | D1 Turnos (25 %) | D2 Clínica (20 %) | D3 Integr. locales/WA (15 %) | D4 Admin./cobros (15 %) | D5 Paciente (10 %) | D6 Seguridad (10 %) | D7 Precio/adopción (5 %) | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Odonthia | 3.7 | 3.7 | 2.2 | 3.2 | 3.3 | 2.6 | 4.5 | **3.29** |
| 2 | Dentalink | 2.7 | 3.3 | 2.6 | 2.4 | 3.3 | 2.4 | 1.5 | **2.73** |
| 3 | Open Dental | 3.9 | 2.0 | 0.8 | 2.0 | 4.0 | 3.0 | 3.8 | **2.69** |
| 4 | AgendaPro | 2.0 | 2.0 | 3.0 | 2.8 | 3.7 | 2.0 | 3.8 | **2.53** |
| 5 | Dentally | 2.4 | 2.2 | 0.8 | 2.0 | 3.7 | 2.2 | 2.2 | **2.16** |
| 6 | Bilog | 2.1 | 2.0 | 1.2 | 2.8 | 3.0 | 1.0 | 2.5 | **2.05** |
| 7 | Reservo | 1.9 | 1.7 | 1.4 | 2.4 | 2.7 | 1.4 | 1.8 | **1.89** |
| 8 | Dentrix Ascend | 2.2 | 1.7 | 0.4 | 1.8 | 2.3 | 2.2 | 2.0 | **1.77** |
| 9 | DentalSoft | 1.3 | 1.7 | 1.6 | 1.6 | 2.0 | 2.0 | 3.2 | **1.71** |
| 10 | Órbita | 0.9 | 1.8 | 1.0 | 2.0 | 1.7 | 1.6 | 1.8 | **1.46** |
| 11 | OdontoClinIA | 1.6 | 1.5 | 0.8 | 1.6 | 1.3 | 2.0 | 1.2 | **1.45** |
| 12 | DentalCore | 0.7 | 1.5 | 1.2 | 1.6 | 0.7 | 2.0 | 3.0 | **1.31** |
| 13 | Doctocliq | 0.7 | 1.5 | 0.6 | 1.6 | 2.0 | 0.6 | 3.2 | **1.23** |
| 14 | Curve Dental | 1.3 | 1.7 | 0.0 | 1.2 | 1.3 | 1.0 | 0.8 | **1.11** |
| 15 | Clinic Cloud | 0.7 | 1.3 | 0.6 | 1.6 | 1.3 | 0.6 | 2.8 | **1.09** |
| 16 | Odonto.ar | 0.8 | 1.3 | 0.4 | 0.4 | 2.0 | 1.6 | 2.2 | **1.05** |
| 17 | Doctoralia | 1.3 | 0.3 | 0.4 | 0.4 | 2.7 | 1.2 | 3.0 | **1.04** |
| 18 | DENTIDESK | 0.7 | 1.7 | 0.0 | 1.2 | 2.0 | 0.4 | 1.0 | **0.98** |
| 19 | Clinicorp | 0.4 | 1.2 | 0.4 | 1.6 | 2.0 | 0.4 | 2.0 | **0.98** |
| 20 | DentalTec | 0.6 | 1.0 | 0.8 | 1.4 | 0.3 | 1.8 | 1.5 | **0.97** |

Ejemplo de cálculo (Odonthia): 3.7×0.25 + 3.7×0.20 + 2.2×0.15 + 3.2×0.15 + 3.3×0.10 + 2.6×0.10 + 4.5×0.05 = **3.29**.

**Lectura crítica.**

- Ningún sistema supera 3.3 sobre 5. El mercado tiene muchas funciones declaradas y poca evidencia verificable.
- Dos referentes internacionales sin operación argentina (Open Dental y Dentally) quedan en el top 5 solo por la calidad de su documentación pública, aunque puntúan casi 0 en integraciones locales.
- Varios proveedores argentinos con propuestas amplias (Órbita, DentalTec, DentalCore, OdontoClinIA) quedan abajo porque casi todo lo que ofrecen es AC.

### B.3 Justificación por sistema (una línea)

1. **Odonthia (3.29)**: agenda comprobada en docs (sillones que impiden choques, bloqueos con feriados nacionales, sobreturno con advertencia), periodontograma completo, plan gratuito y precios en ARS. Pierde puntos por no emitir facturas (No, C), no integrar MP y no liquidar OS.
2. **Dentalink (2.73)**: box/sillón, duración por motivo, WhatsApp con confirmar/cancelar y módulo argentino de OS, todo comprobado. Sin bloqueos ni prevención de solapamientos documentados, sin ARCA ni precios.
3. **Open Dental (2.69)**: la agenda más completa y comprobada (blockouts, overlap configurable, lista ASAP), con auditoría y API. Integraciones locales en 0: sin WhatsApp, MP, ARCA ni OS.
4. **AgendaPro (2.53)**: mejor puntaje en integraciones locales (MP comprobado con seña, API pública, Google Calendar) y precios en ARS. Clínica mayormente AC y facturación ARCA "próximamente".
5. **Dentally (2.16)**: salas, sesiones, perio, motivos de cancelación y auditoría de sesiones comprobados. Sin ninguna integración local.
6. **Bilog (2.05)**: presentismo, sobreturnos, bloqueos y liquidaciones (OS y profesionales) comprobados. Prevención de solapamientos no evidenciada, sin API (declarado), seguridad y exportación no evidenciadas y sin precios.
7. **Reservo (1.89)**: única factura ARCA comprobada del relevamiento, MP y trazabilidad por cita. Sin duración, sobreturnos, solapamientos, perio ni precios evidenciados.
8. **Dentrix Ascend (1.77)**: patrones de tiempo y advertencia configurable de doble reserva comprobados, y audit log exportable. Clínica solo AC y sin integraciones locales.
9. **DentalSoft (1.71)**: oferta amplia y precios en ARS publicados, pero casi todo AC (tope 2), incluida la "detección automática de superposición".
10. **Órbita (1.46)**: ERP con ARCA, OS y auditoría, y agenda por sillón "sin choques", todo AC. Sin vistas, duración ni precios evidenciados.
11. **OdontoClinIA (1.45)**: agenda rica e integraciones estatales, todo AC según catálogo comercial. Liquidaciones "en desarrollo" y sin precios.
12. **DentalCore (1.31)**: seguridad y exportación muy descritas (AC) y precio publicado. Agenda casi sin evidencia (sin sillones, bloqueos, sobreturnos ni reserva online).
13. **Doctocliq (1.23)**: plan gratuito y precios en USD comprobados. Funciones AC y sin presencia argentina.
14. **Curve Dental (1.11)**: suite completa declarada (AC). Sin precios, sin integraciones locales y solo EE.UU./Canadá.
15. **Clinic Cloud (1.09)**: WhatsApp y recordatorios comprobados y precios en EUR. Clínica dental marginal (plan Max) y orientación española.
16. **Odonto.ar (1.05)**: reserva online comprobada por demo y precios en ARS. Recordatorios, administración e integraciones mayormente no evidenciados.
17. **Doctoralia (1.04)**: reserva online y normativa argentina comprobadas por contrato, y precios en ARS. Prácticamente sin funcionalidad odontológica ni administrativa.
18. **DENTIDESK (0.98)**: fichas por especialidad (AC). Sin WhatsApp ("próximamente"), sin precios, sin operación argentina y con la ayuda caída.
19. **Clinicorp (0.98)**: precios en BRL y fintech propia. Sin localización argentina y agenda no descrita.
20. **DentalTec (0.97)**: fuerte en OS y facturación gremial (AC), pero agenda casi sin evidencia y sin turnos online.

### B.4 Anexo de trazabilidad del puntaje (valores por subítem)

Orden de los subítems:

- D1: vista, profesionales, sillones, duración, bloqueos, sobreturnos, solapamientos, recordatorios, lista de espera
- D2: ficha, odontograma, periodontograma, imágenes, presupuestos, firma
- D3: WhatsApp, Mercado Pago, obras sociales, Google Calendar, API
- D4: caja, ARCA, liquidaciones, reportes, sucursales
- D5: turnos online, confirmación/cancelación, seguimiento
- D6: roles, auditoría, exportación, seguridad, normativa
- D7: precio, prueba, soporte, costos

| Sistema | D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|---|---|---|---|---|---|---|---|
| Odonthia | 4-4-5-4-5-4-4-3-0 | 3-4-5-4-4-2 | 4-0-3-4-0 | 4-0-4-4-4 | 3-3-4 | 3-2-4-2-2 | 5-5-4-4 |
| Dentalink | 4-4-5-4-0-3-0-4-0 | 3-4-4-3-3-3 | 4-0-4-3-2 | 3-0-3-3-3 | 3-4-3 | 4-3-3-2-0 | 0-0-3-3 |
| Open Dental | 4-4-4-4-4-4-4-3-4 | 3-2-4-3-0-0 | 0-0-0-0-4 | 3-0-0-4-3 | 4-4-4 | 4-4-4-3-0 | 4-4-3-4 |
| AgendaPro | 0-3-2-0-3-4-3-3-0 | 3-2-0-2-3-2 | 3-5-0-3-4 | 4-0-3-3-4 | 4-3-4 | 3-3-0-2-2 | 5-2-4-4 |
| Dentally | 3-4-4-3-3-0-0-3-2 | 2-3-4-2-2-0 | 0-0-0-0-4 | 3-0-2-2-3 | 3-4-4 | 2-4-3-2-0 | 3-0-3-3 |
| Bilog | 4-4-1-1-3-3-0-3-0 | 3-2-0-2-3-2 | 2-0-4-0-0 | 3-1-4-4-2 | 3-3-3 | 2-2-0-0-1 | 0-3-5-2 |
| Reservo | 4-3-4-0-3-0-0-3-0 | 2-4-0-0-4-0 | 3-4-0-0-0 | 3-5-2-2-0 | 3-3-2 | 3-4-0-0-0 | 0-1-3-3 |
| Dentrix Ascend | 0-4-4-4-0-3-3-2-0 | 2-2-2-2-1-1 | 0-0-0-0-2 | 3-0-0-3-3 | 4-0-3 | 2-4-3-2-0 | 2-0-3-3 |
| DentalSoft | 2-2-0-0-2-2-2-2-0 | 2-2-0-2-2-2 | 2-2-2-2-0 | 2-0-2-2-2 | 2-2-2 | 2-2-2-2-2 | 5-2-2-4 |
| Órbita | 0-1-2-0-2-0-2-1-0 | 2-2-2-2-2-1 | 2-1-2-0-0 | 2-2-2-2-2 | 2-2-1 | 2-2-2-2-0 | 0-1-3-3 |
| OdontoClinIA | 2-2-2-2-2-2-0-2-0 | 2-2-0-1-2-2 | 2-0-2-0-0 | 2-2-0-2-2 | 2-2-0 | 2-2-2-2-2 | 0-1-2-2 |
| DentalCore | 2-2-0-0-0-0-0-2-0 | 2-2-2-2-1-0 | 2-2-2-0-0 | 2-2-1-2-1 | 0-2-0 | 2-2-2-2-2 | 4-2-2-4 |
| Doctocliq | 0-2-2-0-0-0-0-2-0 | 2-2-2-2-1-0 | 2-0-0-0-1 | 2-0-2-2-2 | 2-2-2 | 2-0-0-1-0 | 4-4-2-3 |
| Curve Dental | 0-2-2-2-2-0-0-2-2 | 2-2-2-2-2-0 | 0-0-0-0-0 | 2-0-0-2-2 | 2-0-2 | 0-1-2-2-0 | 0-0-2-1 |
| Clinic Cloud | 0-3-0-0-0-0-0-3-0 | 2-1-1-0-2-2 | 3-0-0-0-0 | 2-0-2-2-2 | 2-1-1 | 0-1-0-2-0 | 3-2-3-3 |
| Odonto.ar | 2-2-0-3-0-0-0-0-0 | 2-2-0-2-2-0 | 0-0-2-0-0 | 1-0-0-1-0 | 4-2-0 | 2-1-1-2-2 | 5-2-2-0 |
| Doctoralia | 3-0-0-2-1-0-0-2-2 | 2-0-0-0-0-0 | 2-0-0-0-0 | 0-0-0-0-2 | 4-2-2 | 0-0-1-2-3 | 5-1-2-4 |
| DENTIDESK | 0-0-0-2-2-0-0-2-0 | 2-2-2-2-2-0 | 0-0-0-0-0 | 0-0-2-2-2 | 2-2-2 | 2-0-0-0-0 | 0-2-2-0 |
| Clinicorp | 0-2-0-0-0-0-0-2-0 | 2-0-0-2-1-2 | 2-0-0-0-0 | 2-0-2-2-2 | 2-2-2 | 0-0-0-2-0 | 3-0-2-3 |
| DentalTec | 0-2-0-1-0-0-0-2-0 | 2-2-0-2-0-0 | 2-0-2-0-0 | 0-2-2-2-1 | 0-1-0 | 2-2-1-2-0 | 0-1-2-3 |

Criterios de desempate aplicados:

- Los precios en moneda extranjera publicados valen 3 (EUR, GBP, BRL) o 4 (USD con tarifa internacional o con cobro en ARS en el caso de Odonto.ar, que vale 5 porque cobra en pesos).
- Un precio publicado solo para un plan promocional vale 2 (Dentrix Ascend).
- Los costos adicionales listados sin montos valen 3 si la fuente es comprobada.
- El soporte vale 5 solo si combina centro de ayuda público y atención local en Argentina (Bilog).

---

## C. Análisis competitivo

Los conteos que siguen salen de las tablas A.2: "con evidencia" incluye C y AC; "comprobado" incluye solo C.

### C.1 Funcionalidades que ya son estándar de mercado

| Funcionalidad | Con evidencia (de 20) | Comprobado (de 20) | Sistemas con evidencia comprobada |
|---|---|---|---|
| Ficha clínica | 20 | 5 | Bilog (guía), Odonthia, Dentalink, AgendaPro, Open Dental |
| Recordatorios automáticos | 19 | 8 | Bilog, Odonthia, Dentalink, Reservo, AgendaPro, Dentally, Open Dental, Clinic Cloud |
| Reportes y métricas | 19 | 6 | Bilog, Odonthia, Dentalink, AgendaPro, Dentrix Ascend, Open Dental |
| Agenda multi-profesional | 18 | 9 | Bilog, Odonthia, Dentalink, Reservo, AgendaPro, Dentrix Ascend, Dentally, Open Dental, Clinic Cloud |
| Turnos online / enlace de reserva | 18 | 10 | Bilog, Odonthia, Dentalink, Reservo, AgendaPro, Odonto.ar, Doctoralia, Dentrix Ascend, Dentally, Open Dental |
| Confirmación/cancelación por el paciente | 18 | 7 | Bilog, Odonthia, Dentalink, Reservo, AgendaPro, Dentally, Open Dental |
| Caja y cobros | 17 | 8 | Bilog, Odonthia, Dentalink, Reservo, AgendaPro, Dentrix Ascend, Dentally, Open Dental |
| Odontograma | 16 | 4 | Odonthia, Dentalink, Reservo, Dentally |
| WhatsApp (recordatorios y/o asistente) | 14 de 20; 12 de 15 en LATAM/AR | 5 | Odonthia, Dentalink, Reservo, AgendaPro, Clinic Cloud |

**Conclusión crítica.** Agenda multi-profesional, recordatorios, turnos online, ficha clínica, odontograma y caja son el piso esperado. En el segmento latinoamericano, el WhatsApp es prácticamente obligatorio. Pero la brecha entre "declarado" y "comprobado" es enorme: el odontograma aparece en 16 sistemas y solo está comprobado en 4, y la ficha clínica aparece en 20 y está comprobada en 5. Que algo sea estándar no implica que esté bien resuelto ni documentado.

### C.2 Funcionalidades diferenciadoras reales (comprobadas y poco frecuentes)

- **Factura electrónica ARCA documentada**: solo Reservo (C), con certificados y punto de venta paso a paso. Órbita, DentalTec, OdontoClinIA y DentalCore la declaran (AC). Bilog menciona facturación genérica sin nombrar ARCA (AC). Odonthia declara no tenerla y AgendaPro la anuncia como "próximamente".
- **Mercado Pago integrado para cobrar al paciente**: AgendaPro (C, Checkout Pro, seña al reservar, comisión publicada) y Reservo (C, por título). En DentalSoft, DentalCore y Órbita es AC. En Odonthia y Odonto.ar, MP sirve solo para pagar la suscripción.
- **Prevención de solapamientos comprobada**: solo 4 sistemas.
  - Odonthia (C): impide al mismo profesional en dos turnos; entre profesionales solo si se configuran sillones (opcional, por sede). El aviso «Ese horario está ocupado» es al mover un turno, no al crearlo (**Ajustar**, verificación E.3).
  - Open Dental (C): preferencia configurable.
  - Dentrix Ascend (C): advertencia configurable, no bloqueo.
  - AgendaPro (C): alerta que se puede aceptar como sobrecupo, no bloqueo.
  - En consecuencia, **solo Odonthia y Open Dental pueden impedir el choque**, y en ambos casos depende de configuración. Ningún sistema documenta un bloqueo garantizado simultáneamente por profesional y por sillón.
- **Trazabilidad de cambios en turnos**: Reservo (C, quién creó, modificó o pagó cada cita), AgendaPro (C, historial de la reserva con usuario y acción), Dentrix Ascend (C, audit log exportable), Open Dental (C, audit trail con verificación de integridad) y Dentally (C, auditorías de sesión a pedido). Entre los proveedores argentinos ninguno la tiene comprobada: Bilog, DentalSoft, Órbita, DentalTec, DentalCore y OdontoClinIA la declaran (AC).
- **Motivo de cancelación registrado**: solo Dentally (C).
- **Lista de espera**: solo Open Dental (C, lista ASAP + Web Sched ASAP). Doctoralia (plan VIP), Dentally y Curve la declaran (AC). **Ningún proveedor argentino la evidencia.**
- **Obras sociales comprobadas**: Bilog (liquidación, guía), Dentalink (módulo argentino) y Odonthia (nomenclador y copago, sin liquidación). DentalTec (validación en tiempo real), OdontoClinIA (PUCO, PAMI, SUMAR), Órbita, DentalSoft y DentalCore las declaran (AC).
- **Agenda por sillón/box comprobada**: Odonthia, Dentalink (diferencia box y sillón), Reservo, Dentrix Ascend, Dentally y Open Dental.
- **Plan gratuito permanente comprobado**: Odonthia (sin límite de pacientes) y Doctocliq (30 pacientes/mes). Open Dental ofrece una prueba sin vencimiento de 30 pacientes.
- **API pública documentada**: AgendaPro (US$ 200/mes), Dentally y Open Dental. Bilog declara explícitamente que no tiene.

### C.3 Vacíos frecuentes del mercado argentino

Se consideran los 12 sistemas que operan en Argentina (filas 1–12).

1. **Prevención de solapamientos sin evidencia**: comprobada solo en Odonthia (bloqueo) y AgendaPro (solo alerta). Es AC en DentalSoft y Órbita y no está evidenciada en los 8 restantes, incluido Bilog, el proveedor con mayor base instalada declarada, que documenta sobreturnos pero no la prevención de choques. Varios sistemas (Bilog, Odonthia, Dentalink, AgendaPro, OdontoClinIA) habilitan sobreturnos como función, lo que en la práctica relaja la integridad de la agenda.
2. **Trazabilidad de turnos débil**: entre los proveedores argentinos es solo AC. Comprobada, solo aparece en dos productos latinoamericanos con operación argentina (Reservo y AgendaPro).
3. **Lista de espera ausente**: no evidenciada en ningún proveedor argentino. Doctoralia la ofrece solo como AC en su plan VIP.
4. **ARCA comprobada solo en un producto (Reservo)**, que es chileno. Ningún proveedor argentino documenta funcionalmente su integración con ARCA.
5. **Opacidad comercial**: no publican montos Bilog, Dentalink, Reservo, OdontoClinIA, Órbita ni DentalTec. DentalCore publica precios inconsistentes (USD 50 vs. "$75.000 ARS").
6. **Documentación pública escasa**: entre los proveedores argentinos, solo Bilog y Odonthia tienen centro de ayuda funcional. DentalSoft, DentalTec, DentalCore y Odonto.ar dependen de la landing.
7. **Normativa de datos de salud poco declarada**: la Ley 26.529 (historia clínica) aparece solo en Odonthia y AgendaPro, ambas como AC. Dentalink rige su privacidad por ley chilena y Órbita y DentalTec no declaran normativa de datos.
8. **Exportación de datos rara vez comprobada**: entre los que operan en Argentina, solo Odonthia (ZIP de planillas, C) y Dentalink (parcial). En Odonto.ar la copia es solo a pedido y dentro de los 30 días posteriores a la baja.

### C.4 Oportunidades de innovación

- **Integridad de agenda garantizada**: impedir solapamientos por profesional **y** por sillón de forma no configurable, validada también en la base de datos y no solo con una alerta en la interfaz. Hoy ningún competidor relevado documenta esa garantía doble.
- **Trazabilidad nativa de turnos**: historial de cada cambio de estado (quién, cuándo, de qué estado a cuál) y cancelación con motivo obligatorio. Fuera de Dentally y Reservo, ningún sistema que opere en Argentina lo documenta como función comprobada.
- **Transparencia como diferenciador**: documentación pública de funcionamiento y reglas de negocio explícitas. Es justamente lo que permitió a Odonthia liderar la matriz.
- **Lista de espera conectada a cancelaciones**, como etapa posterior: ningún proveedor argentino la evidencia, y el referente comprobado (Open Dental, con ASAP) muestra el patrón.
- **Paquete local completo a futuro**: ARCA + Mercado Pago + obras sociales en un mismo producto. Hoy cada pieza está comprobada en un sistema distinto (Reservo, AgendaPro, Bilog/Dentalink) y ninguno las combina con evidencia comprobada.
- **WhatsApp con confirmación por enlace que actualiza la agenda**, a futuro. Solo está comprobado en Dentalink (botones) y Odonthia (link en mensaje manual; el automático no incluye link).

---

## D. Recomendación final

### D.1 Cinco competidores prioritarios para demo

| # | Sistema | Justificación |
|---|---|---|
| 1 | **Bilog** (AR) | Mayor base instalada declarada del segmento (+1.500 clínicas, AC) y presentismo y sobreturnos documentados (C). La demo debe aclarar lo que no se evidencia: si **impide** solapamientos (No evidenciado) y cómo se registra la trazabilidad, declarada solo como AC. Ofrece demo en su landing. |
| 2 | **Odonthia** (AR) | Primero en la matriz (3.29). El plan gratuito sin límite (C) permite probarlo directamente. Es el único argentino con prevención de solapamientos y sillones comprobados en docs: sirve para contrastar nuestro diseño de disponibilidad y sobreturno. |
| 3 | **Dentalink** (Chile, módulo AR) | Segundo en la matriz (2.73). Es el referente regional con box/sillón, duración por motivo y estados configurables comprobados. La demo debe cubrir la falta de documentación sobre bloqueos y solapamientos. |
| 4 | **AgendaPro** (multinacional, AR) | Sobrecupo con alerta y historial de cambios por usuario comprobados. Es el mejor caso para observar cómo un competidor maneja el solapamiento como **alerta aceptable**, es decir, el comportamiento opuesto al de nuestro MVP. Precios públicos en ARS. |
| 5 | **Reservo** (Chile, AR) | Agendas por box o por profesional y trazabilidad por cita comprobadas: el modelo más cercano a nuestro requisito de trazabilidad. Su sitio comercial ilegible (JS) hace imprescindible la demo. |

Alternativas si alguno no concede demo: Órbita (agenda por sillón "sin choques", AC) y DentalSoft ("detección automática de superposición", AC). En ambos casos, la demo sería la única forma de pasar esas afirmaciones a "comprobado".

### D.2 Tres productos de referencia para experiencia de usuario

| # | Producto | Evidencia que lo justifica |
|---|---|---|
| 1 | **Odonthia** | Documentación pública detallada de la agenda (columnas por profesional, mensaje "Ese horario está ocupado" (al reprogramar un turno, según la verificación E.3), sobreturno forzable con advertencia, bloqueos por rango) y plan gratuito para explorar la interfaz real. Referente directo en español y para el contexto argentino. |
| 2 | **Dentrix Ascend** | Centro de aprendizaje público (learn.dentrixascend.com) con patrones de tiempo por turno (asistente/profesional/sillón) y advertencias de doble reserva configurables. Referencia para el diseño de disponibilidad y de mensajes de conflicto. |
| 3 | **Open Dental** | Manual público exhaustivo (agenda por sillón, blockouts, overlap, audit trail) y prueba descargable sin vencimiento (C). Referencia para estados de turno, bloqueos y auditoría. |

Para una etapa posterior con reserva online, la demo pública de **Odonto.ar** (motivo con duración, validación por DNI y teléfono) es la referencia comprobada más directa.

### D.3 MVP sugerido

**Marco.** El MVP se acota a las restricciones del equipo (`docs/restricciones-equipo.md`):

- entrega el 26/11/2026 a las 12:00, con 6 personas trabajando en paralelo;
- un MVP chico, terminado y probado;
- Next.js + Supabase + Prisma, con roles `ADMIN`, `RECEPCION` y `PROFESIONAL`;
- datos exclusivamente ficticios;
- control de acceso por rol y trazabilidad de cambios en turnos, porque los datos de salud son sensibles.

En el MVP, **los turnos los carga solo el consultorio**: no hay reserva online del paciente.

#### Imprescindibles

| # | Funcionalidad | Evidencia de mercado que la respalda (sección C) |
|---|---|---|
| 1 | Acceso con usuarios y roles `ADMIN`, `RECEPCION`, `PROFESIONAL` (alta por el administrador, sin registro público) | Los roles son estándar (16 de 20 con evidencia), pero solo 5 están comprobados (Odonthia, Dentalink, Reservo, AgendaPro, Open Dental). |
| 2 | Gestión de pacientes: alta, búsqueda y edición, con datos ficticios | Piso del mercado: la ficha aparece en los 20 sistemas. El MVP cubre solo los datos administrativos, sin ficha clínica. |
| 3 | Catálogo: profesionales, prestaciones con duración y sillones/boxes | La duración por prestación está comprobada solo en 6 sistemas (Odonthia, Dentalink, Odonto.ar, Dentrix Ascend, Dentally, Open Dental) y los sillones/boxes también en 6. |
| 4 | Horarios de atención y bloqueos con cálculo de disponibilidad | Los bloqueos están comprobados en 6 sistemas. Dentalink y Dentrix Ascend no documentan bloqueos explícitos. |
| 5 | Crear turno evitando solapamientos por profesional y por sillón, sin sobreturnos y garantizado también en la base de datos | Vacío principal: solapamientos comprobados en 4 de 20, solo 2 con bloqueo real y ninguno con garantía doble profesional + sillón. |
| 6 | Cancelar turno con motivo obligatorio (libera el horario) y estados de asistencia (confirmado, atendido, ausente) con historial y trazabilidad | Motivo de cancelación comprobado solo en Dentally. Trazabilidad por turno comprobada en 5 sistemas y en ningún proveedor argentino. Estados de presentismo comprobados en Bilog. |

#### Diferenciadores del MVP (justificados con C.2 y C.3)

- **Cero solapamientos garantizados por profesional y por sillón**, con una restricción en la base de datos además de la validación de dominio. Los competidores con evidencia lo resuelven como alerta aceptable (AgendaPro, Dentrix Ascend), como opción configurable (Open Dental, Odonthia según se configuren sillones) o lo habilitan expresamente como sobreturno (Bilog, Dentalink, OdontoClinIA). En 14 de 20 sistemas la prevención es "No evidenciado".
- **Trazabilidad completa del turno**: quién lo creó, quién cambió su estado y quién lo canceló, con motivo obligatorio. Entre los proveedores argentinos solo aparece como AC.
- **Agenda por sillón como recurso de primera clase**: comprobada en solo 6 de 20 sistemas y, entre los argentinos, solo en Odonthia.
- **Reglas de negocio explícitas y testeadas**: la lógica de disponibilidad es pura y se prueba con Vitest sin credenciales. Responde a la opacidad documental señalada en C.3.6.

#### Funcionalidades para etapas posteriores (fuera del MVP)

| Funcionalidad | Motivo para posponerla |
|---|---|
| Reserva online 24/7 del paciente | Exige portal público, validación de identidad (como DNI y teléfono en Odonto.ar) y reglas de anticipación. Rompe el supuesto de carga solo por el consultorio y no entra en 2 días. |
| WhatsApp y recordatorios | Requiere la API oficial de Meta, plantillas aprobadas y costo por mensaje (por ejemplo, 0,026 USD/msj en DentalSoft y packs pagos en DentalTec y AgendaPro). Implica dependencia externa y costo. |
| Lista de espera | Depende de notificaciones al paciente. Es un diferenciador futuro (ningún proveedor argentino la evidencia), pero no es imprescindible para una agenda íntegra. |
| Ficha clínica, odontograma, periodontograma e imágenes | Es un dominio clínico extenso: los referentes comprobados (Odonthia, Dentalink) lo resuelven con módulos completos. Además exige datos sensibles y Storage, y la consigna del MVP es la gestión de turnos. |
| Presupuestos | Dependen del odontograma y del nomenclador. |
| Caja, cobros y Mercado Pago | Requiere integración con un proveedor de pagos y conciliación. En el mercado solo está comprobado en AgendaPro y Reservo. |
| Facturación ARCA | Requiere certificados y punto de venta (como documenta Reservo) e implica obligación fiscal. Comprobada solo en 1 de 20 sistemas. |
| Obras sociales y prepagas | Implica nomencladores, convenios, débitos y padrones (PUCO). Es un dominio propio, como muestran DentalTec y Bilog. |
| Liquidaciones a profesionales | Dependen de cobros y prestaciones realizadas. |
| Reportes avanzados | Requieren historial acumulado. En el MVP alcanza con listados de agenda por día, profesional y sillón. **Ajustar** (2026-11-25, decisión DD-16 de la knowledge base): el líder sumó estadísticas simples para el dueño (turnos, ocupación, ausentismo y cancelaciones) calculadas sobre los turnos existentes, sin tablas nuevas; los reportes avanzados siguen fuera del MVP. |
| Multi-sucursal | Multiplica horarios, sillones y permisos. El MVP modela un único consultorio. |
| API pública | Sin consumidores en el MVP. Solo 3 de 20 sistemas la tienen comprobada. |

---

## E. Verificación de fuentes

Según la consigna, el equipo verifica personalmente al menos 5 fuentes citadas, una de cada tipo. Se eligieron fuentes que sostienen afirmaciones centrales de las secciones B a D: integridad de agenda, solapamientos, precios y adopción.

| # | Tipo | Sistema | URL | Afirmación a verificar | Responsable | Resultado (¿está en la URL?) | Fecha de verificación | Evidencia |
|---|---|---|---|---|---|---|---|---|
| 1 | Sitio oficial | Órbita | https://hiorbita.com/erp | La "agenda por sillón" de Órbita Gestión "no permite el choque y te ofrece los horarios libres" (clasificada como AC; sostiene C.2, C.3.1 y el diferenciador del MVP). | Octavio Crescini | Respaldado como afirmación comercial: la tabla de planes dice «Agenda por sillón, con choque imposible» y el beneficio 3 ofrece horarios libres. Se mantiene como AC. | 2026-11-25 | [crescini.md](verificacion/crescini.md) |
| 2 | Página de precios | AgendaPro | https://agendapro.com/ar/planes | Precios en ARS con IVA (Individual $9.900, Básico $19.900, Premium $39.900, Pro IA $129.900), API US$ 200/mes y facturación electrónica "Próximamente" para Argentina (sostiene A.2.4, A.2.5, B y C.2). | Joaquín Cortez Badaloni | Respaldado: los cuatro precios en ARS con IVA, la API a US$ 200/mes y la factura electrónica «Próximamente». **Ajustar**: los precios son para cuentas nuevas y Básico/Premium se calculan con 2 profesionales (Pro IA con 5). | 2026-11-25 | [cortez.md](verificacion/cortez.md) |
| 3 | Centro de ayuda / documentación | Odonthia | https://odonthia.com/docs/agenda-y-turnos | La agenda impide que el mismo profesional tenga dos turnos superpuestos, evita choques entre profesionales solo si se configuran sillones, muestra el aviso "Ese horario está ocupado" y permite forzar un sobreturno con advertencia (sostiene B, C.2, D.2 y el diferenciador 1 del MVP). | Lautaro de Coninck | Parcialmente: confirmados el control por profesional, los sillones por sede y el sobreturno forzado con advertencia. **Ajustar**: el aviso «Ese horario está ocupado» aparece al mover un turno, no al crearlo. | 2026-11-26 | [deconinck.md](verificacion/deconinck.md) |
| 4 | Video oficial | DENTIDESK | https://www.youtube.com/@dentideskcanaloficialsoftw2220 | Es el canal oficial de tutoriales enlazado desde dentidesk.com y algún video muestra la agenda con duración configurable (15/30/40 min) y bloqueo automático por feriados, afirmaciones hoy clasificadas como AC en A.2.1. Si el video lo muestra, se reclasifica a (C). Es la única URL de video citada en las notas. | Joaquín Echenagorria | Parcialmente: un video muestra que un feriado cargado bloquea la agenda (pasa a C). **Ajustar**: los intervalos de 15/30/40 min no se ven en los videos y siguen como AC. | 2026-11-26 | [echenagorria.md](verificacion/echenagorria.md) |
| 5 | Marketplace / reseña verificable | Bilog | https://apps.apple.com/ar/app/bilog-gesti%C3%B3n-odontol%C3%B3gica/id1554140449 | La app "Bilog Gestión Odontológica" está publicada en App Store Argentina con calificación 3,4/5 sobre 17 calificaciones y vendedor "Aldo Pernumian" (sostiene A.1, A.2.5 y la evidencia de adopción de Bilog). | Ulises Lucato Flores | Respaldado: 3,4/5 con 17 calificaciones y vendedor «Aldo Pernumian» al 2026-11-26. | 2026-11-26 | [lucato.md](verificacion/lucato.md) |

**Procedimiento:**

1. Cada integrante registra el detalle de su verificación en `docs/discovery/verificacion/<apellido>.md`: URL, fecha, texto encontrado y conclusión.
2. Guarda una captura de pantalla en `docs/evidencias/verificacion/`.
3. Si la afirmación resulta falsa, desactualizada o sin respaldo en la URL, se corrige en este informe con la marca **"Ajustar"** en la celda afectada (tablas A.2, matriz B y, si corresponde, secciones C y D).
4. El cambio se registra en la subsección siguiente.

Las calificaciones de tienda y los precios pueden haber cambiado después del 2026-11-25. En ese caso se informa el valor nuevo con su fecha, sin borrar el original.

### Hallazgos de la verificación

Las cinco fuentes se verificaron abriéndolas personalmente (la de Odonthia, con asistencia del agente y revisión de la captura por el responsable). Dos de cinco obligaron a corregir el informe.

| Fecha | Responsable | Fuente | Resultado | Ajuste aplicado en el informe |
|---|---|---|---|---|
| 2026-11-25 | Octavio Crescini | Órbita, sitio oficial | Respaldado (AC) | Ninguno: se mantiene como afirmación comercial y se cita la sección Beneficios. |
| 2026-11-25 | Joaquín Cortez Badaloni | AgendaPro, página de precios | Respaldado con matiz | A.1 y A.2.5: los precios aplican a cuentas nuevas y Básico/Premium se calculan con 2 profesionales (Pro IA con 5). |
| 2026-11-26 | Lautaro de Coninck | Odonthia, centro de ayuda | Parcialmente | A.2.1 y C.2: el aviso «Ese horario está ocupado» es al reprogramar; el control por sillón es opcional y se configura por sede. |
| 2026-11-26 | Joaquín Echenagorria | DENTIDESK, video oficial | Parcialmente | A.2.1: «bloqueo por feriado» pasa de AC a C; los intervalos 15/30/40 min siguen como AC. |
| 2026-11-26 | Ulises Lucato Flores | Bilog, App Store | Respaldado | A.2.5: se fecha la calificación (3,4/5, 17 calificaciones, al 2026-11-26). |

**Lectura del resultado:** el agente no inventó ninguna de las cinco afirmaciones, pero en dos casos exageró o generalizó (un aviso que existe en otro contexto y una función mostrada en video que no incluía la parte de los intervalos). Por eso la verificación humana era necesaria.

---

## Referencias completas

Fuentes del relevamiento por sistema. Todas las fuentes fueron consultadas el 2026-11-25 y son las citadas en la nota correspondiente de `docs/discovery/sources/`.

1. **Bilog**:
   - https://bilog.com.ar/
   - https://docs.bilog.com.ar
   - https://docs.bilog.com.ar/schedule/appointments
   - https://docs.bilog.com.ar/initial-guide/installation-access
   - https://bilog.com.ar/llms.txt
   - https://bilog.com.ar/soluciones/clinicas
   - https://bilog.com.ar/soluciones/auditoria-odontologica
   - https://bilog.com.ar/clientes/
   - https://apps.apple.com/ar/app/bilog-gesti%C3%B3n-odontol%C3%B3gica/id1554140449
2. **Odonthia**:
   - https://odonthia.com/
   - https://odonthia.com/planes
   - https://odonthia.com/docs
   - https://odonthia.com/docs/agenda-y-turnos
   - https://odonthia.com/docs/reserva-online
   - https://odonthia.com/docs/odontograma
   - https://odonthia.com/docs/tratamientos-y-especialidades
   - https://odonthia.com/docs/presupuestos-y-cobros
   - https://odonthia.com/seguridad
3. **Dentalink**:
   - https://www.softwaredentalink.com/ar
   - https://www.softwaredentalink.com/ar/planes
   - https://www.softwaredentalink.com/ar/soporte
   - https://www.softwaredentalink.com/ar/politica-de-privacidad
   - https://ayuda.softwaredentalink.com/es/articles/9488188-agenda-la-primera-cita
   - https://ayuda.softwaredentalink.com/es/articles/9493114-termina-de-configurar-tu-agenda
   - https://ayuda.softwaredentalink.com/es/articles/9493127-box-sillon
   - https://ayuda.softwaredentalink.com/es/articles/9493201-notificaciones-automaticas-por-whatsapp
   - https://ayuda.softwaredentalink.com/es/articles/9493218-como-usar-el-odontograma
   - https://ayuda.softwaredentalink.com/es/articles/9493220-como-usar-el-periodontograma
   - https://ayuda.softwaredentalink.com/es/articles/9493280-configura-los-permisos-de-tus-usuarios
   - https://ayuda.softwaredentalink.com/es/collections/19196578-modulo-exclusivo-para-argentina
   - https://ayuda.softwaredentalink.com/es/collections/9620066-conoce-todos-los-modulos-de-dentalink
   - https://ayuda.softwaredentalink.com/es/collections/9620069-facturacion-electronica
4. **Reservo**:
   - https://reservo.cl/ar/
   - https://reservo.cl/precios/
   - https://reservo.cl/salud/centro-dental/
   - https://intercom.help/reservo/es/articles/10273489-como-escoger-la-vista-adecuada-de-la-agenda-para-trabajar
   - https://intercom.help/reservo/es/articles/3603616-diferencia-entre-agendas-por-box-y-agendas-por-profesional
   - https://intercom.help/reservo/es/collections/2082408-modulo-de-agenda
   - https://intercom.help/reservo/es/articles/2965555-como-conocer-la-trazabilidad-de-una-cita
   - https://intercom.help/reservo/es/collections/16452140-argentina
   - https://intercom.help/reservo/es/articles/12768328-como-completar-el-odontograma-argentina
   - https://intercom.help/reservo/es/articles/12738616-como-emitir-una-factura-electronica-en-argentina
   - https://intercom.help/reservo/es/articles/13704209-como-integrar-mercadopago-para-pasarela-de-pago-online-argentina
   - https://intercom.help/reservo/es/articles/11002520-compra-de-whatsapp-mensajes-para-confirmacion-y-recordatorio-automatico
5. **AgendaPro**:
   - https://agendapro.com/ar/dental/software-odontologico
   - https://agendapro.com/ar/planes
   - https://ayuda.agendapro.com/es/collections/969562-agenda-reservas-y-bloqueos
   - https://ayuda.agendapro.com/es/articles/6500344-como-agendar-un-sobrecupo
   - https://ayuda.agendapro.com/es/articles/6496960-como-se-quien-modifico-una-cita
   - https://ayuda.agendapro.com/es/articles/5837664-como-programar-y-gestionar-bloqueos-de-horario-de-mis-profesionales
   - https://ayuda.agendapro.com/es/articles/8129545-como-vender-con-agendapro-y-mercado-pago
   - https://ayuda.agendapro.com/es/collections/969520-integraciones
   - https://ayuda.agendapro.com/es/articles/6541935-api-publica-para-que-y-como-usarla
6. **DentalSoft**:
   - https://dentalsoft.com.ar/
   - https://www.dentalsoft.com.ar/funcionalidades
   - https://www.dentalsoft.com.ar/privacidad
   - https://search.google.com/local/reviews?placeid=ChIJdQaKm4DsuA8RpY_BWaWdZuw
7. **OdontoClinIA**:
   - https://www.clinia.com.ar/odontologia
   - https://www.clinia.com.ar/faq
   - https://www.clinia.com.ar/catalogo-funcional.pdf
   - https://www.clinia.com.ar/seguridad
   - https://www.clinia.com.ar/sobre-clinia
8. **Órbita**:
   - https://hiorbita.com/
   - https://hiorbita.com/erp
   - https://hiorbita.com/precios
   - https://hiorbita.com/ayuda
9. **DentalTec**:
   - https://web.dentaltec.com.ar/funcionalidades
   - https://web.dentaltec.com.ar/preguntas-frecuentes
   - https://web.dentaltec.com.ar/casos-de-exito
   - https://web.dentaltec.com.ar/software-odontologos-argentina
10. **DentalCore**:
    - https://dentalcore.app/
    - https://dentalcore.app/pricing
    - https://dentalcore.app/faq
11. **Odonto.ar**:
    - https://odonto.ar/
    - https://odonto.ar/demo
    - https://odonto.ar/privacidad
    - https://odonto.ar/terminos
12. **Doctoralia**:
    - https://pro.doctoralia.com/ar
    - https://pro.doctoralia.com/ar/agenda-doctoralia-para-especialistas
    - https://pro.doctoralia.com/ar/precio
    - https://www.doctoraliar.com/ecommerce-terms
    - https://www.doctoraliar.com/
    - https://apps.apple.com/ar/app/doctoralia-para-especialistas/id1237598188
13. **Doctocliq**:
    - https://www.doctocliq.com/
    - https://www.doctocliq.com/software-dental
    - https://www.doctocliq.com/planes-y-precios
    - https://www.doctocliq.com/soporte-tecnico-de-doctocliq
14. **DENTIDESK**:
    - https://www.dentidesk.com/
    - https://www.dentidesk.com/dentidesk/feature
    - https://www.youtube.com/@dentideskcanaloficialsoftw2220
15. **Clinicorp**:
    - https://www.clinicorp.com/
    - https://www.clinicorp.com/faq
16. **Dentrix Ascend**:
    - https://www.dentrixascend.com/
    - https://learn.dentrixascend.com/appointment-time-patterns/
    - https://learn.dentrixascend.com/topic/online-booking-overview/
    - https://learn.dentrixascend.com/tag/exporting/
    - https://dentrixascend.com/how-to-purchase
    - https://www.henryscheinone.com/about-us/press-release/ascend-by-dentrix-launches-ascend-starter/
17. **Dentally**:
    - https://dentally.com/
    - https://dentally.com/pricing
    - https://dentally.com/dental-software-features
    - https://dentally.com/security
    - https://help.dentally.com/en/articles/3551725-how-to-book-appointments
    - https://www.dentally.com/en-gb/insights-hub/the-appointment-book
    - https://help.dentally.com/en/articles/3565932-charting-overview
    - https://help.dentally.com/en/articles/3565934-charting-a-perio-exam-periodontal-charting
    - https://help.dentally.com/en/articles/11950461-requesting-detailed-user-session-audits
    - https://developer.dentally.co/
    - https://www.dentally.com/en-gb/stories
18. **Open Dental**:
    - https://www.opendental.com/
    - https://www.opendental.com/site/fees.html
    - https://www.opendental.com/site/trial.html
    - https://opendental.com/site/license.html
    - https://opendental.com/site/countries.html
    - https://opendental.com/manual/appointments.html
    - https://opendental.com/manual/blockouts.html
    - https://opendental.com/manual/asaplist.html
    - https://opendental.com/site/websched.html
    - https://opendental.com/manual/perio.html
    - https://opendental.com/manual/permissions.html
    - https://opendental.com/manual/audittrail.html
    - https://opendental.com/site/apispecification.html
19. **Curve Dental**:
    - https://www.curvedental.com/
    - https://www.curvedental.com/pricing
    - https://www.curvedental.com/dental-scheduling-software
    - https://www.curvedental.com/dental-patient-engagement-software
    - https://www.curvedental.com/dental-charting-software
    - https://www.curvedental.com/data-policy
    - https://curvedental.com/fast-facts
20. **Clinic Cloud**:
    - https://clinic-cloud.com/
    - https://clinic-cloud.com/tarifas
    - https://clinic-cloud.com/faq

---

**Fuentes de la verificación (sección E):**

- https://hiorbita.com/erp (consultada el 2026-11-25)
- https://agendapro.com/ar/planes (consultada el 2026-11-25)
- https://odonthia.com/docs/agenda-y-turnos (consultada el 2026-11-26)
- https://www.youtube.com/@dentideskcanaloficialsoftw2220 (consultada el 2026-11-26)
- https://apps.apple.com/ar/app/bilog-gesti%C3%B3n-odontol%C3%B3gica/id1554140449 (consultada el 2026-11-26)

---

## Anexo: inconsistencias detectadas entre fuentes y tratamiento aplicado

| Sistema | Inconsistencia | Tratamiento en el informe |
|---|---|---|
| DentalCore | La página de precios y la FAQ dicen USD 50/mes (2 usuarios) + USD 10 por usuario; la landing y la calculadora dicen "$ 75.000 ARS" y "$ 15.000" sin moneda clara. | Se informan ambos valores y se marca "inconsistente". Precio puntuado con 4 (publicado, no 5). |
| Odonthia | Su blog (relevado el 09/10/2026) indica Pro ARS 157.300; la página de planes muestra $164.900. | Se usa la página de planes, que es la fuente vigente y oficial de precios. |
| AgendaPro | La FAQ dental dice "desde $13.900 ARS/mes" y prueba de 14 días; la página de planes dice Individual $9.900 y solo "Probá gratis" sin duración. La página dental menciona FONASA y CENS (chilenos). | Se usa la página de planes para los precios. La prueba de 14 días queda como AC. FONASA/CENS se consideran contenido no localizado y no se usan. |
| OdontoClinIA | La FAQ dice soporte 24/7 y la landing, contacto L–V de 8 a 16 h. | Se informan ambos y se marca "inconsistente" (AC). |
| Reservo | Una página no localizada declara "500 clientes en 5 países" y solo recordatorios por email; la vertical `/ar` y la ayuda documentan WhatsApp. | La adopción se informa como AC de "página antigua". El WhatsApp se toma de la ayuda (C). |
| Bilog | Un blog de Odonthia (competidor) le atribuye un freemium de 50 pacientes y 1 profesional, no verificado en fuentes de Bilog. El vendedor en App Store figura como "Aldo Pernumian". | No se usa la atribución del competidor; se informa solo el "plan gratuito" mencionado en la ayuda de Bilog. El nombre del vendedor queda como dato a verificar (E.5). |
| Odonto.ar | El blog de Odonthia le atribuye "turnos online y WhatsApp"; el sitio oficial no menciona WhatsApp. | WhatsApp: No evidenciado. |
| Doctoralia | La tabla de planes es ambigua en lista de espera e historia clínica del plan Starter. | Se informa lo que la página asigna explícitamente (lista de espera en VIP, HC en Plus/VIP) como AC. |
| Clinic Cloud | La fila "Odontograma y periodontograma" tiene asignación por plan ambigua; la calificación de Capterra sale de un extracto del buscador. | Periodontograma: AC con puntaje 1. Calificación informada con salvedad. |
| Dentalink | El sitio `/ar` y su módulo argentino conviven con soporte telefónico solo de CL/CO/MX/ES y una política de privacidad regida por ley chilena. | Opera en AR (C), pero normativa AR "No evidenciado" y soporte sin teléfono argentino. |
| Dentally | Un hilo de la comunidad reporta una reserva online solapada con un turno existente; no se leyó la resolución. | La prevención de solapamientos se mantiene "No evidenciado". El hilo se cita como indicio, no como prueba. |
