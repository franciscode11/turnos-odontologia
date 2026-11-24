# Video de defensa — guion y cómo grabarlo

## Lo que pide la cátedra

- Duración: **8 a 12 minutos**. Apuntamos a **≈ 11 min**.
- **Todos aparecen y hablan.** Cámara encendida **al menos en tu presentación**.
- Cada integrante explica **la producción de su change**. El líder cierra con un pantallazo general del proyecto.
- Se tiene que ver **la pantalla trabajando de verdad** (VS Code, terminal, GitHub, la app), no solo diapositivas.
- Se sube a **YouTube** y **no puede estar en privado** (lo subimos como *Público*).

## Estructura y tiempos

| # | Bloque | Quién | Duración | Qué se muestra |
|---|---|---|---|---|
| 1 | Presentación del producto y Discovery | Francisco | 1:30 | Cámara + `docs/discovery/informe-discovery.md` (tabla de 15 sistemas, matriz, MVP recomendado) y la verificación de fuentes |
| 2 | Fundación del proyecto | Francisco | 1:30 | `knowledge-base/`, `CHANGES.md` (dependencias y paralelismo), `AGENTS.md`, `.active-orchestrator-state.json`, un momento de **Ajustar** |
| 3 | Change C01 · base técnica | Francisco | 0:45 | Spec del C01, tests en verde, CI de GitHub, login con roles |
| 4 | Change C02 · pacientes | Octavio | 1:15 | Ver su guía |
| 5 | Change C03 · catálogo | Joaquín C. | 1:15 | Ver su guía |
| 6 | Change C04 · horarios | Lautaro | 1:15 | Ver su guía |
| 7 | Change C05 · crear turno | Joaquín E. | 1:15 | Ver su guía |
| 8 | Change C06 · estados | Ulises | 1:15 | Ver su guía |
| 9 | Engram + cierre | Francisco | 1:00 | Consulta real a Engram, GitHub (PRs mergeados, gráfico de contribuidores), conclusiones |
| | **Total** | | **≈ 11:00** | |

## Cómo grabar tu parte

1. **Programa:** cualquiera que grabe pantalla + cámara.
   - Windows: **Xbox Game Bar** (`Win + G`) o **OBS Studio** (gratis, <https://obsproject.com>).
   - Mac: **QuickTime** (*Archivo → Nueva grabación de pantalla*) u **OBS Studio**.
   - O una reunión de **Google Meet / Zoom** grabada compartiendo pantalla con la cámara prendida.
2. **Antes de grabar:**
   - Cerrá WhatsApp, mails y pestañas personales. Activá *No molestar*.
   - Agrandá la letra de VS Code (`Ctrl/Cmd` + `+`) y de la terminal para que se lea.
   - Tené abiertas, en orden: `CHANGES.md`, tu spec, la terminal con `npm test`, la app en el navegador y tu PR en GitHub.
   - **Nada de datos reales** en pantalla. Nunca muestres el archivo `.env`.
3. **Grabá en 1080p**, en un lugar sin ruido. Si te trabás, seguí y repetí la frase: el líder corta.
4. **Duración:** tu parte tiene que durar entre **1:00 y 1:30**. Leé tu guion en voz alta una vez antes, cronometrando.
5. **Entrega del archivo:** nombralo `NN-apellido.mp4` (ej. `04-crescini.mp4`, `07-echenagorria.mp4`) y subilo a la carpeta de Drive que comparte el líder **antes del miércoles a las 23:00**.

## Guion del líder

### Bloque 1 — Producto y Discovery (Francisco, 1:30)

> **[Cámara]** "Hola, soy Francisco Valles Adad, legajo 52147, líder del grupo de la comisión 3K09. Junto con Octavio, Joaquín, Lautaro, Joaquín y Ulises construimos un sistema de gestión de turnos para consultorios odontológicos en Argentina, sin escribir código a mano, usando Spec-Driven Development con OpenSpec y Active Stack."
>
> **[Pantalla: informe de Discovery]** "Arrancamos sin código, con un Discovery. Le pedimos al agente una investigación de mercado de más de 15 sistemas, con URL y fecha de consulta en cada fuente. Cada dato sin respaldo público quedó como *No evidenciado*. Acá está la matriz ponderada y el MVP recomendado: (leer las 3 o 4 funcionalidades imprescindibles)."
>
> **[Pantalla: verificación de fuentes]** "Como el agente tiende a rellenar huecos, cada integrante verificó personalmente una fuente. Encontramos (contar el hallazgo real más interesante) y lo corregimos con Ajustar."

### Bloque 2 — Fundación (Francisco, 1:30)

> **[Pantalla: knowledge-base/]** "Con el Discovery, `kb-creator` generó la base de conocimiento: visión, actores, modelo de datos, reglas de negocio… Revisamos que las reglas de agenda —duración de prestaciones, sillones, solapamientos— estuvieran, y que lo no evidenciado quedara en preguntas abiertas."
>
> **[Pantalla: CHANGES.md]** "`roadmap-generator` armó el roadmap. Le pedimos que tuviera un change base secuencial y después cinco changes independientes, para trabajar los seis en paralelo, cada uno en su rama."
>
> **[Pantalla: el momento de Ajustar]** "Acá usamos Ajustar porque (contar qué estaba mal: por ejemplo, el roadmap incluía una funcionalidad que el Discovery dejó para etapas posteriores)."
>
> **[Pantalla: AGENTS.md]** "Y `agent-instruction` generó las reglas del agente, donde agregamos reglas propias del dominio, como no usar nunca datos reales de pacientes."

### Bloque 3 — Change C01 (Francisco, 0:45)

> "El primer change fue la base técnica: Next.js, Prisma con PostgreSQL en Supabase, login con roles de administrador, recepción y profesional, y CI en GitHub. El esquema completo del MVP quedó definido acá, para que nadie tuviera que tocar la base en paralelo. La garantía final contra turnos superpuestos es una restricción en la propia base de datos." **[Pantalla: tests en verde y CI pasando]**

### Bloque 9 — Engram y cierre (Francisco, 1:00)

> **[Pantalla: sesión nueva del agente]** "Engram es la memoria persistente del agente. Abro una sesión nueva, sin contexto, y le pregunto: *¿qué decidimos sobre los solapamientos de turnos y por qué?* Lo recupera de Engram, de una sesión anterior, sin tener que explicarle todo de nuevo."
>
> **[Pantalla: GitHub → Pull requests cerrados → Insights → Contributors]** "Todo quedó trazable: cada integrante con su rama, sus commits y su PR, mergeados a main después de pasar los tests."
>
> **[Cámara]** "Como conclusión: la especificación aprobada funcionó como contrato. Corregir temprano con Ajustar nos ahorró errores en el código, y la IA fue una herramienta: todo lo que entregamos lo leímos, lo entendimos y lo validamos nosotros. Gracias."

## Edición y subida (líder)

1. Unir los clips en orden con CapCut / DaVinci Resolve / iMovie. Agregar un cartel con nombre y legajo en cada presentación.
2. Exportar en 1080p.
3. Subir a YouTube con título `Global Desarrollo de Software 3K09 — Turnos Odontología (SDD + Active Stack)`, visibilidad **Pública**.
4. Probar el link en una ventana de incógnito antes de entregarlo.
