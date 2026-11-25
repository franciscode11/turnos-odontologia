# OdontoClinIA (módulo odontológico de ClinIA)

- **URL**: https://www.clinia.com.ar/odontologia
- **Fecha de investigación**: 2026-11-25
- **Proveedor / país**: EMPRINET 4.0 ("Desarrollado por Emprinet"; tipo societario no publicado; primeros clientes en Córdoba) / Argentina
- **Región asignada**: Argentina

## Problema que resuelve
Plataforma sanitaria argentina (ClinIA) con línea odontológica: agenda, turnos por WhatsApp con IA, historia clínica dental con odontograma versionado, facturación a obras sociales/PAMI/SUMAR y ARCA, receta electrónica registrada en ReNaPDiS (https://www.clinia.com.ar/odontologia, https://www.clinia.com.ar/faq).

## Usuarios objetivo
Consultorios privados, clínicas pymes con varios sillones, centros de salud municipales y hospitales públicos, cadenas multi-sede (https://www.clinia.com.ar/odontologia). Producto de salud general con módulo dental (no exclusivamente odontológico).

## Features detectadas
- Agenda por profesional, especialidad, consultorio o sillón; vistas día/semana/mes; excepciones, licencias y feriados; sobreturnos con tope por profesional; turnos múltiples para tratamientos; duración por práctica (https://www.clinia.com.ar/odontologia, catálogo https://www.clinia.com.ar/catalogo-funcional.pdf).
- Turnero web y app para pacientes; asistente IA por WhatsApp que agenda, confirma, cancela y reprograma; recordatorios WhatsApp y email (https://www.clinia.com.ar/odontologia).
- Historia clínica dental, CIE-10, odontograma FDI versionado (52 piezas) con export PDF, plan de tratamiento con importe por nomenclador, planilla B1 (https://www.clinia.com.ar/odontologia, catálogo).
- Cobros en pesos/dólares/euros, recibos PDF, arqueo de caja, cajas por centro; obras sociales y prepagas con verificación PUCO; facturación ARCA; módulos PAMI y SUMAR (https://www.clinia.com.ar/odontologia, https://www.clinia.com.ar/faq).
- 16 tipos de usuario con permisos por módulo/vista/acción; auditoría del sistema exportable; reportes a Excel/PDF (catálogo).
- Backups cada 10 minutos, soporte 24/7 (https://www.clinia.com.ar/faq).

## Pricing
Abono mensual no publicado, "Se cotiza por institución, según su tamaño y los módulos contratados"; $0 por usuario, $0 migración, $0 servidores/instalación (https://www.clinia.com.ar/faq, https://www.clinia.com.ar/odontologia).

## Posicionamiento
Plataforma integral de salud (pública y privada) con IA y fuerte cumplimiento de integraciones estatales argentinas (ReNaPDiS, RENAPER, PUCO, PAMI, SUMAR, ARCA) (https://www.clinia.com.ar/odontologia, https://www.clinia.com.ar/sobre-clinia).

## Diferenciadores
- Receta electrónica inscripta en ReNaPDiS (ID 248) y HL7 FHIR.
- Integraciones con financiadores públicos (PAMI, SUMAR) y PUCO.
- Sin cobro por usuario.

## Notas del investigador
- No es software exclusivamente odontológico: ClinIA es plataforma de salud general; se incluye por tener línea dental específica (OdontoClinIA) y foco argentino.
- Gran parte del detalle proviene del "Catálogo funcional — Edición 2026" (PDF del proveedor), que afirma que todo lo listado "está en producción"; se clasifica como Afirmación comercial por ser documento comercial del proveedor. El PDF se convirtió a texto localmente (Ghostscript) porque WebFetch no lo pudo leer.
- Liquidación de honorarios a profesionales figura "en desarrollo" en el catálogo; integración PACS/DICOM también "en desarrollo".
- La inscripción ReNaPDiS alcanza solo al módulo de recetas, según la propia página.
- Adopción: "+500 centros de atención" y municipios nombrados (Arroyito, Río Ceballos, Villa de Soto, San Pedro) — datos internos del proveedor; no se identificaron clínicas odontológicas cliente.

## Relevamiento según consigna
| Criterio | Hallazgo | Tipo (Comprobado / Afirmación comercial / No evidenciado) | Fuente (URL) |
|---|---|---|---|
| Segmento objetivo | Consultorios, clínicas pymes, centros municipales, hospitales, cadenas | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Modalidad (SaaS/nube/app/local/híbrida) | SaaS web, instancia por cliente con subdominio; app de pacientes | Afirmación comercial | https://www.clinia.com.ar/faq |
| Agenda: vista diaria/semanal | Día, semana, mes y agenda | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Agenda: múltiples profesionales | Por profesional, especialidad, consultorio y centro | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Agenda: múltiples sillones/boxes | "Turnos por profesional, especialidad o sillón" | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Agenda: duración variable de prestaciones | "Duración por práctica para el turnero"; turnos múltiples para tratamientos | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Agenda: bloqueos | Excepciones de agenda, licencias y feriados | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Agenda: sobreturnos | Sobreturnos con tope configurable por profesional | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Agenda: prevención de solapamientos | Bloqueo para que dos profesionales no se pisen al editar la HC (no de agenda); en agenda: no evidenciado | No evidenciado (agenda) | https://www.clinia.com.ar/odontologia |
| Turnos online 24/7 / enlace de reserva | Turnero web y app; autogestión desde portal | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| WhatsApp / chatbot | Asistente IA en WhatsApp que agenda/confirma/cancela/reprograma y deriva a humano | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Confirmación, cancelación, reprogramación | Por WhatsApp y portal | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Lista de espera | No evidenciado | No evidenciado | — |
| Recordatorios automáticos | WhatsApp y correo | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Seguimiento de ausentes / recuperación de pacientes / campañas | No evidenciado | No evidenciado | — |
| Ficha clínica y anamnesis | HC electrónica dental con antecedentes, evolución, diagnósticos CIE-10; "anamnesis" no nombrada | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Odontograma | FDI, 52 piezas, versionado, bloqueado al finalizar, export PDF | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Periodontograma | No evidenciado (solo registro de estado gingival) | No evidenciado | https://www.clinia.com.ar/odontologia |
| Imágenes / radiografías | Documentos y estudios adjuntos; PACS/DICOM "en desarrollo" | Afirmación comercial | https://www.clinia.com.ar/odontologia ; https://www.clinia.com.ar/catalogo-funcional.pdf |
| Presupuestos y planes de tratamiento | Plan de tratamiento con importe estimado; presupuesto por pieza | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Caja, cobros, señas | Cobros multi-moneda, recibos PDF, arqueo, cajas por centro; señas no evidenciadas | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Facturación electrónica AFIP/ARCA | Factura electrónica ARCA (ex AFIP) | Afirmación comercial | https://www.clinia.com.ar/faq |
| Mercado Pago | No evidenciado | No evidenciado | — |
| Obras sociales / prepagas | Facturación y convenios con OS/prepagas, PUCO, PAMI, SUMAR | Afirmación comercial | https://www.clinia.com.ar/faq |
| Liquidaciones a profesionales | "Liquidación de honorarios · en desarrollo" | Afirmación comercial (no disponible aún) | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Reportes y métricas | Ranking, turnos por estado, por OS, export Excel/PDF | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Google Calendar | No evidenciado | No evidenciado | — |
| API pública | No evidenciado (solo integraciones específicas) | No evidenciado | https://www.clinia.com.ar/faq |
| Firma digital | "Firma electrónica" del profesional y del paciente | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Sucursales | Múltiples centros por institución; "dashboard único" para cadenas | Afirmación comercial | https://www.clinia.com.ar/odontologia ; https://www.clinia.com.ar/catalogo-funcional.pdf |
| Roles y permisos | 16 tipos de usuario; permisos por módulo, vista y acción | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Auditoría / trazabilidad | Auditoría del sistema exportable; trazabilidad de cada modificación de HC | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Exportación de datos | Exportación de HC completa; reportes y auditoría a Excel | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Soporte y capacitación | Soporte 24/7 (FAQ) vs. contacto L–V 8–16 h (landing); migración en <24 h; canal YouTube | Afirmación comercial (con inconsistencia) | https://www.clinia.com.ar/faq ; https://www.clinia.com.ar/odontologia |
| Seguridad de datos de salud / respaldo | Backups cada 10 min; cifrado en tránsito y reposo (catálogo); página de seguridad genérica | Afirmación comercial | https://www.clinia.com.ar/faq ; https://www.clinia.com.ar/seguridad |
| Adecuación declarada a normativa argentina | Sello "Ley 25.326" sin detalle; ReNaPDiS ID 248 (recetas); HL7 FHIR; Ley 26.529 no | Afirmación comercial | https://www.clinia.com.ar/seguridad ; https://www.clinia.com.ar/odontologia |
| Prueba gratuita / plan gratuito | Sin prueba; demo gratuita de 45 min | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Precios publicados (moneda, modalidad) | No publicados; cotización por institución | No evidenciado | https://www.clinia.com.ar/faq |
| Costos adicionales visibles | $0 por usuario, migración e instalación (declarado) | Afirmación comercial | https://www.clinia.com.ar/odontologia |
| Evidencia de adopción | +500 centros, 15 municipios con PAMI; municipios nombrados; sin reseñas de terceros | Afirmación comercial | https://www.clinia.com.ar/sobre-clinia |
| Fortalezas | Cobertura de integraciones estatales y financiadores; agenda rica (sillones, sobreturnos con tope, feriados) | Afirmación comercial | https://www.clinia.com.ar/catalogo-funcional.pdf |
| Limitaciones | Sin precios ni prueba; orientado a instituciones; liquidación a profesionales en desarrollo; sin periodontograma evidenciado | No evidenciado / Afirmación comercial | https://www.clinia.com.ar/faq |
| Diferenciales evidentes | ReNaPDiS + PAMI/SUMAR/PUCO + IA en WhatsApp | Afirmación comercial | https://www.clinia.com.ar/odontologia |
