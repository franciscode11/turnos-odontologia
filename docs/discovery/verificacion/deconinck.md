# Verificación de fuente — Lautaro de Coninck (51954)

- **Sistema:** Odonthia (fila 3 de la sección E del informe)
- **Tipo de fuente:** Centro de ayuda / documentación oficial
- **URL:** https://odonthia.com/docs/agenda-y-turnos
- **Fecha de consulta:** 2026-11-26
- **Cómo se verificó:** con asistencia del agente, que abrió la página y extrajo los textos; Lautaro revisó la captura antes de subirla.
- **Qué afirma el informe:** La agenda impide que el mismo profesional tenga dos turnos superpuestos, evita choques entre profesionales solo si se configuran sillones, muestra el aviso «Ese horario está ocupado» y permite forzar un sobreturno con advertencia (sostiene B, C.2, D.2 y el diferenciador 1 del MVP).
- **Qué encontré en la URL:**
  - En «Somos dos profesionales y un solo sillón, ¿cómo evito que se pisen los turnos?»: la agenda, de fábrica, «solo controla que un profesional no esté en dos lugares a la vez».
  - Los choques entre profesionales se evitan cargando la cantidad de sillones de cada sede (Configuración → Sedes → «Sillones»); con el campo vacío no cambia nada.
  - Con el consultorio lleno, la agenda avisa pero no frena: «el botón de forzar el sobreturno sigue estando».
  - El aviso «Ese horario está ocupado» existe, pero aparece al **mover** un turno a un horario que ya tiene otro, no al crear uno nuevo.
- **Resultado:** ⚠️ Parcialmente (las tres primeras afirmaciones están respaldadas; la del aviso necesita un matiz).
- **Corrección que propongo:** en B y C.2, aclarar que el aviso «Ese horario está ocupado» aparece al reprogramar un turno, y que el control por sillón es opcional y se configura por sede.
- **Captura:** docs/evidencias/verificacion/deconinck.png
