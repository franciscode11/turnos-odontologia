# Open Dental

- **URL**: https://www.opendental.com/
- **Fecha de investigación**: 2026-11-25
- **Proveedor / país**: Open Dental Software / Estados Unidos
- **Región asignada**: Internacional

## Problema que resuelve
Software de gestión odontológica integral y altamente personalizable, con base de datos abierta/documentada, que permite al consultorio mantener control de sus datos a bajo costo. Fuentes: https://www.opendental.com/ ; https://opendental.com/site/license.html

## Usuarios objetivo
Consultorios odontológicos (EE.UU. principalmente; también Canadá y "otros países"), grupos/enterprise, escuelas de odontología (gratis). Fuente: https://www.opendental.com/site/fees.html

## Features detectadas
- Módulo de turnos: vista de día dividida por sillón (operatory), vista de semana por días, horarios de profesionales, segundo profesional (higienista), estados de confirmación personalizables, turnos rotos (broken), vistas por clínica.
- Preferencia "Appointments allow overlap" (permitir o no varios turnos en el mismo sillón y horario).
- Blockouts (bloqueos) que permiten o impiden agendar; restricción por tipo de turno.
- Lista ASAP (pacientes que quieren adelantar turno) y Web Sched ASAP por SMS/email.
- Web Sched: reserva online de recall, pacientes nuevos y existentes.
- eServices: portal del paciente, portal de pagos, web forms, eClipboard, recordatorios (eReminders), confirmaciones (eConfirmations), mensajería integrada, email masivo, app ODMobile/ODTouch.
- Odontograma gráfico 3D, periodontograma completo, reportes/queries, descuentos, eRx (EE.UU.).
- Permisos de seguridad granulares y audit trail con verificación de integridad.
- API REST (local, servicio y remota) con portal de desarrolladores; FHIR.
- Herramienta de traducción a otros idiomas (manual, por usuario).
Fuentes: https://opendental.com/manual/appointments.html ; https://opendental.com/manual/blockouts.html ; https://opendental.com/manual/asaplist.html ; https://opendental.com/site/websched.html ; https://opendental.com/manual/perio.html ; https://opendental.com/manual/audittrail.html ; https://opendental.com/site/apispecification.html ; https://opendental.com/Manual/languages.html

## Pricing
USD. Soporte mensual por sede (hasta 3 profesionales): EE.UU. USD 199/mes los primeros 12 meses, luego USD 149/mes; Canadá USD 164 luego 137; otros países USD 89/mes por 12 meses (soporte email/teléfono en inglés); países en desarrollo gratis con soporte limitado; escuelas gratis. +USD 20/mes por profesional extra. Único costo inicial: primer mes de soporte. eServices aparte (p. ej. Web Sched USD 75/mes, eConfirmations USD 25/mes, bundle USD 165/mes); eReminders, portal y web forms gratis con soporte. Nube opcional (Open Dental Cloud) desde USD 250/mes adicional. Prueba gratuita descargable sin vencimiento (máx. 30 pacientes). Fuentes: https://www.opendental.com/site/fees.html ; https://opendental.com/site/opendentalcloud.html ; https://www.opendental.com/site/trial.html

## Posicionamiento
"Comprehensive, highly customizable dental practice management software", asequible, con la base de datos "más abierta que cualquier otro software dental". Fuentes: https://www.opendental.com/ ; https://opendental.com/site/license.html

## Diferenciadores
Base de datos documentada y accesible; API pública; precio bajo y transparente; manual de usuario público y exhaustivo; tarifa reducida para otros países. Fuentes: https://opendental.com/site/license.html ; https://www.opendental.com/site/fees.html

## Notas del investigador
- Ya NO es open source: desde la versión 24.4 la licencia pasó de GPL a propietaria; la última versión GPL es la 24.3 (https://opendental.com/site/license.html). Se mantiene el nombre.
- Instalación local en Windows/.NET con base MariaDB/MySQL; nube opcional con costo extra (según terceros, limitada a EE.UU.; no verificado en fuente oficial).
- Uso en Argentina: técnicamente comprable desde "otros países" (USD 89/mes), pero soporte solo en inglés; para español solo hay voluntarios listados (Perú y Uruguay) y la traducción es manual. Argentina no se menciona (https://opendental.com/site/countries.html).
- Muchas funciones (eServices, texting, eRx, CDT) están pensadas para EE.UU./Canadá.

## Relevamiento según consigna
| Criterio | Hallazgo | Tipo (Comprobado / Afirmación comercial / No evidenciado) | Fuente (URL) |
|---|---|---|---|
| Segmento objetivo | Consultorios odontológicos (principalmente EE.UU.), grupos, escuelas | Comprobado | https://www.opendental.com/site/fees.html |
| Modalidad (SaaS/nube/app/local/híbrida) | Local (Windows/.NET) con nube opcional (Open Dental Cloud) y apps ODMobile/ODTouch: híbrida | Comprobado | https://www.opendental.com/site/trial.html ; https://opendental.com/site/opendentalcloud.html |
| Agenda: vista diaria/semanal | Vista Día (por sillón) y Semana (por días) | Comprobado | https://opendental.com/manual/appointments.html |
| Agenda: múltiples profesionales | Horarios de profesionales en Schedule Setup; segundo profesional por turno | Comprobado | https://opendental.com/manual/appointments.html |
| Agenda: múltiples sillones/boxes | Grilla dividida en operatories configurables | Comprobado | https://opendental.com/manual/appointments.html |
| Agenda: duración variable de prestaciones | Patrón de tiempo según procedimientos; redimensión con permiso | Comprobado | https://opendental.com/manual/appointments.html |
| Agenda: bloqueos | Blockouts que permiten o impiden agendar, por tipo de turno | Comprobado | https://opendental.com/manual/blockouts.html |
| Agenda: sobreturnos | Preferencia "Appointments allow overlap" permite varios turnos en mismo sillón/horario | Comprobado | https://opendental.com/manual/appointments.html |
| Agenda: prevención de solapamientos | Configurable mediante la misma preferencia; blockouts no se solapan | Comprobado | https://opendental.com/manual/appointments.html ; https://opendental.com/manual/blockouts.html |
| Turnos online 24/7 / enlace de reserva | Web Sched (recall, nuevos, existentes) con costo mensual | Comprobado | https://opendental.com/site/websched.html |
| WhatsApp / chatbot | Mensajería SMS integrada (EE.UU./Canadá); WhatsApp no | No evidenciado (WhatsApp) | https://www.opendental.com/site/fees.html |
| Confirmación, cancelación, reprogramación | Estados de confirmación personalizables; eConfirmations; turnos rotos | Comprobado | https://opendental.com/manual/appointments.html ; https://www.opendental.com/site/fees.html |
| Lista de espera | Lista ASAP + Web Sched ASAP con enlace para tomar el hueco | Comprobado | https://opendental.com/manual/asaplist.html ; https://opendental.com/site/websched.html |
| Recordatorios automáticos | eReminders (gratis con soporte) | Comprobado (tarifa) | https://www.opendental.com/site/fees.html |
| Seguimiento de ausentes / recuperación de pacientes / campañas | Recall List con recordatorios manuales/automáticos; email masivo (Mailchimp) | Comprobado | https://opendental.com/site/websched.html ; https://www.opendental.com/site/fees.html |
| Ficha clínica y anamnesis | Ficha de paciente y web forms/eClipboard para formularios | Comprobado (formularios) | https://www.opendental.com/site/fees.html |
| Odontograma | Odontograma gráfico 3D | Afirmación comercial (página de producto) | https://www.opendental.com/site/0_graphicaltoothchart.html |
| Periodontograma | Perio chart completo (profundidades, MGJ, movilidad, furcas, CAL, índices) | Comprobado | https://opendental.com/manual/perio.html |
| Imágenes / radiografías | Almacenamiento OpenDentImages; puentes con cientos de programas; IA de imágenes (USD 149/mes) | Comprobado (tarifas/nube) | https://opendental.com/site/opendentalcloud.html ; https://www.opendental.com/site/fees.html |
| Presupuestos y planes de tratamiento | No evidenciado en páginas leídas | No evidenciado | — |
| Caja, cobros, señas | Portal de pagos, Message-to-Pay | Comprobado (tarifas) | https://www.opendental.com/site/fees.html |
| Facturación electrónica AFIP/ARCA | No | No evidenciado | — |
| Mercado Pago | No | No evidenciado | — |
| Obras sociales / prepagas | Seguros de EE.UU. vía 20+ clearinghouses; obras sociales AR no | No evidenciado (AR) | https://www.opendental.com/ |
| Liquidaciones a profesionales | No evidenciado | No evidenciado | — |
| Reportes y métricas | Reportes integrados, gráficos y queries de usuario; queries a medida USD 110/h | Comprobado | https://www.opendental.com/site/0_reports.html ; https://www.opendental.com/site/fees.html |
| Google Calendar | No evidenciado | No evidenciado | — |
| API pública | API REST documentada (local, servicio, remota), claves de desarrollador y cliente; FHIR | Comprobado | https://opendental.com/site/apispecification.html ; https://opendental.com/site/apilocal.html |
| Firma digital | No evidenciado | No evidenciado | — |
| Sucursales | Función Clinics con vistas de agenda por clínica; descuento por volumen de sedes | Comprobado | https://opendental.com/manual/appointments.html ; https://www.opendental.com/site/fees.html |
| Roles y permisos | Permisos de seguridad granulares por usuario/grupo | Comprobado | https://opendental.com/manual/permissions.html |
| Auditoría / trazabilidad | Audit Trail con filtros y detección de cambios fuera del software | Comprobado | https://opendental.com/manual/audittrail.html |
| Exportación de datos | Base de datos documentada y accesible en lectura; paso de nube a autohospedaje sin penalidad | Comprobado | https://opendental.com/site/license.html ; https://www.opendental.com/site/fees.html |
| Soporte y capacitación | Soporte telefónico/email solo en inglés; webinars gratis; capacitación online USD 80/h | Comprobado | https://opendental.com/site/countries.html ; https://www.opendental.com/site/fees.html |
| Seguridad de datos de salud / respaldo | Permisos, audit trail con integridad; respaldo a cargo del consultorio en instalación local (no detallado) | Comprobado (permisos/auditoría) / No evidenciado (respaldo) | https://opendental.com/manual/audittrail.html |
| Adecuación declarada a normativa argentina (Ley 25.326, Ley 26.529 historia clínica, etc.) | No declarada | No evidenciado | — |
| Prueba gratuita / plan gratuito | Prueba descargable sin vencimiento (30 pacientes, sin API ni eServices); gratis para países en desarrollo y escuelas | Comprobado | https://www.opendental.com/site/trial.html ; https://www.opendental.com/site/fees.html |
| Precios publicados (moneda, modalidad) | USD/mes por sede: EE.UU. 199→149; Canadá 164→137; otros países 89 | Comprobado | https://www.opendental.com/site/fees.html |
| Costos adicionales visibles | Profesional extra USD 20/mes; eServices (Web Sched 75, bundle 165, etc.); nube desde USD 250/mes; conversiones aparte; soporte por incidente USD 150 | Comprobado | https://www.opendental.com/site/fees.html ; https://opendental.com/site/opendentalcloud.html |
| Evidencia de adopción (casos de éxito, clientes publicados, reseñas verificables con link) | Lista de soporte regional (AU, CA, NZ, UK) y voluntarios internacionales; reseñas de terceros no consultadas (403 en Capterra) | Comprobado (alcance internacional) | https://opendental.com/site/countries.html |
| Fortalezas | Manual público exhaustivo, API y base abiertas, precios transparentes, agenda muy configurable | Comprobado | https://opendental.com/manual/appointments.html ; https://www.opendental.com/site/fees.html |
| Limitaciones | Ya no es open source (desde 24.4); soporte solo en inglés; instalación Windows local; funciones de mensajería/seguros centradas en EE.UU. | Comprobado | https://opendental.com/site/license.html ; https://opendental.com/site/countries.html |
| Diferenciales evidentes | Base de datos documentada + API con modo local sin throttling; tarifa reducida internacional | Comprobado | https://opendental.com/site/license.html ; https://www.opendental.com/site/fees.html |
