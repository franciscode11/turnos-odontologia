# Design system: Turnos Odontología

- **Mode:** system-only (decisión del líder, 2026-11-25: sistema visual sí, mockups por change no)
- **Revision:** 4 (2026-11-26, pedido del líder: login con panel ilustrado del molar, logo y favicons definitivos, sidebar colapsado centrado y sin scroll, menú de usuario con cerrar sesión en rojo, agenda con resumen del día). Revision 3: avatares 3D y nombres del equipo. Revision 2: tipografía, minimalismo, proporciones del panel, referencias de 21st.dev, microanimaciones medidas.
- **Approval:** approved (2026-11-26, by user: el líder pidió y entregó la ilustración y el logo)
- **Preview:** rendered (2026-11-25), capturas en `previews/` a 390×844 y 1440×900

## Propósito

Una sola base visual para todas las pantallas. Los integrantes no diseñan: usan los componentes de `src/components/ui`, que el líder implementa en el C01 con estos tokens (shadcn/ui + Radix + Tailwind). Con `system-only`, los changes visuales no piden mockup y registran `Decision: no (project policy)` en su `design.md`.

## Archivos

| Archivo | Qué es |
|---|---|
| `tokens.css` | Única fuente de color, tipografía, espaciado, proporciones del panel, radios, sombras, foco, duraciones, curvas y tiempos de reacción. |
| `ui.css` | Estilos de referencia de cada componente, solo con tokens. Cada bloque se traduce a un componente de `src/components/ui`. |
| `components.html` | Catálogo de todos los componentes y estados (en la app: `/dev/componentes`). |
| `screens/panel-turnos.html` | Agenda del día con el sidebar (pantalla principal). |
| `screens/login.html`, `screens/activar-cuenta.html` | Ingreso y activación de una invitación. |
| `screens/estadisticas.html` | Estadísticas para el dueño del consultorio (C-08, DD-16). |
| `screens/equipo.html` | Equipo e invitaciones (C-07, DD-15). |
| `shell.js`, `icons.js`, `smoke.js`, `brand.js` | Solo para las vistas HTML: menú, íconos, fondo animado del login y nombre del producto. |
| `brand.md` | Nombre, tono, logo e imágenes. |
| `assets/fonts/` | Geist y Geist Mono (variables, woff2) con su licencia OFL. |
| `assets/logo.svg`, `assets/logo-claro.svg`, `assets/simbolo.svg` | Logo definitivo (fondo claro y oscuro) y símbolo del molar. En la app: `public/` y `src/app/icon.svg`. |
| `assets/ilustracion-dental.webp` | Ilustración del panel izquierdo del login. |
| `assets/avatars/` | 15 avatares 3D (WebP, 256 px). En la app se copian a `public/avatars/`. |
| `previews/` | Capturas mobile y desktop de cada vista. |

## Referencias que pidió el líder

| Pieza | Referencia | Cómo se adaptó |
|---|---|---|
| Sidebar | 21st.dev `@wensity/components/sidebar` | Marca de 24 px, secciones en mayúscula chica, íconos Tabler de 18 px con trazo 1,75, contadores, ítem activo con fondo que se desliza, usuario abajo y colapso a riel de íconos de 60 px. |
| Toasts y estados | 21st.dev `@arihantcodes_1f7b8c4d/components/status-badge` | Fondo tenue, ícono con trazo grueso y texto del mismo tono. Los tonos de la referencia no llegaban a contraste AA: se oscurecieron. Los mismos pares se usan en badges de estado del turno y en toasts. |
| Login | 21st.dev `@aakashmehra/components/smoke-login` | Pantalla partida: humo en WebGL que reacciona al puntero, con un hilo del color de acento (en lugar del verde ácido), y formulario sobre fondo liso con entrada desenfocada. Sin botones de Apple o Google: el MVP solo usa email y contraseña. Sin selector claro/oscuro: el MVP es claro. |

Skills aplicadas: `design-taste-frontend` (Leonxlnx/taste-skill) para tipografía, color y reglas anti-plantilla, y `emil-design-eng` para animaciones y tiempos.

## Revision 4 (implementada en la app)

- **Login:** pantalla partida con el panel ilustrado (`ilustracion-dental.webp` sobre `--color-brand-soft`), logo arriba y frase abajo; formulario a la derecha. Reemplaza el humo en WebGL. La referencia viva es la app (`src/app/login/`); `screens/login.html` queda como la versión de la Revision 3.
- **Marca:** símbolo del molar en blanco sobre `--color-brand` (`#175344`), el verde del logo.
- **Sidebar colapsado:** riel de 60 px con marca, íconos y avatar centrados; los títulos de sección se vuelven una línea divisoria; sin scroll horizontal.
- **Menú de usuario:** tarjeta con avatar, nombre, email y rol; "Cerrar sesión" en `--color-danger`.
- **Agenda:** franja de resumen por estado, selector de fecha, contador por profesional, barra de color por estado en cada turno y grilla con encabezados fijos.

## Decisiones visuales

- **Tipografía:** Geist para la interfaz y Geist Mono para DNI, matrículas y códigos. Es una sans geométrica precisa y legible en tamaños chicos, con números tabulares para horarios. Se integra nativa con Next.js (`geist/font`). Archivos locales, sin servicios externos.
- **Color:** neutros zinc fríos y un único acento verde azulado (`#0e7a6b`, 5,4:1 con texto blanco). Los colores de estado solo aparecen en badges y toasts, siempre con ícono y texto.
- **Estados del turno:** Reservado gris (círculo punteado), Confirmado azul (círculo con check), Atendido verde (usuario con check), Ausente ámbar (triángulo), Cancelado rojo (círculo con cruz).
- **Radios (regla fija):** controles, botones y badges 8 px; cards, popovers, toasts y diálogos 12 px; avatares redondos.
- **Densidad de panel:** cuerpo de 14 px, controles de 36 px (40 px en pantallas táctiles), filas de tabla de 48 px.
- **Proporciones del panel:** sidebar de 248 px (60 px colapsado), encabezado de página de 64 px, márgenes laterales de 32 px (16 px en mobile), contenido hasta 1280 px, agenda con 88 px por hora.
- **Avatares:** siempre foto, nunca iniciales: 28 px en tablas y 36 px en el menú y la agenda, recortados en círculo. Una invitación pendiente muestra el ícono de sobre. Personal (asignación fija): Francisco Valles `01` (Administrador), Octavio Crescini `03` y Ulises Lucato `11` (Recepción), Dr. Joaquín Cortez `09`, Dr. Lautaro de Coninck `14` y Dr. Joaquín Echenagorria `10` (Profesionales). Los demás avatares (`02`, `04` a `08`, `12`, `13`, `15`) son para pacientes ficticios.
- **Sin decoración gratuita:** sin sombras fuertes, sin degradados en textos, sin puntos de color decorativos, sin rayas largas como separador.

## Tiempos (medidos)

| Interacción | Duración | Curva |
|---|---|---|
| Presionar botón (scale 0,97) | 120 ms | `--ease-out` |
| Hover de color | 150 ms | `ease`, solo con mouse |
| Tooltip | 125 ms, aparece a los 400 ms; los siguientes sin demora | `--ease-out` |
| Select, calendario, combobox, menú | 160 ms al abrir, 110 ms al cerrar, desde el disparador | `--ease-out` |
| Diálogo | 220 ms al abrir, 150 ms al cerrar, centrado | `--ease-out` |
| Toast | 240 ms al entrar, 160 ms al salir | `--ease-out` |
| Ítem activo del menú | 200 ms | `--ease-out` |
| Colapsar sidebar | 220 ms | `--ease-in-out` |
| Entrada del login | 450 ms, una vez | `--ease-out` |
| Foco con teclado | 0 ms | - |

| Regla de reacción | Valor |
|---|---|
| Respuesta visual a un clic | En el mismo cuadro (estado presionado) |
| Mostrar "Guardando" | Solo si la acción tarda más de 150 ms |
| Tiempo mínimo visible del spinner | 400 ms |
| Búsqueda al escribir | Espera 250 ms sin teclear |
| Toast de éxito / error | 4 s / 6 s; se pausa con el mouse o el foco |
| Movimiento reducido | Sin escalas ni desplazamientos; fundidos de 120 ms; humo del login quieto |

Solo se animan `transform` y `opacity` (la única excepción es el ancho del sidebar al colapsar, que es ocasional).

## Decisiones abiertas (TBD)

| Tema | Estado | Cómo reemplazarlo |
|---|---|---|
| Nombre comercial | (TBD): se usa "Turnos Odontología" | Cambiar `BRAND_NAME` en `brand.js` y en `src/config/brand.ts` (C01). |
| Modo oscuro | Fuera del MVP | Agregar valores bajo `@media (prefers-color-scheme: dark)` en `tokens.css` y subir Revision. |

## Cambios futuros

Cambiar un token o un asset compartido: subir `Revision`, volver `Approval` a `pending`, regenerar `previews/` y pedir aprobación de nuevo.
