# Tasks — C-02 Gestión de pacientes

## 1. Dominio y validación

- [x] 1.1 Escribir pruebas de normalización del DNI antes del código. Implementar la normalización y comprobar que se conservan los ceros iniciales, se aceptan 7 u 8 dígitos y se rechazan entradas inválidas.
- [x] 1.2 Escribir pruebas de campos obligatorios y de fecha de nacimiento. Implementar el esquema Zod y comprobar contacto obligatorio, campos opcionales y límites del día en Argentina.

## 2. Acciones y persistencia

- [x] 2.1 Escribir primero pruebas de alta válida, duplicado literal, duplicado con puntos, DNI de un registro dado de baja con historial conservado y conflicto del índice. Implementar el alta con el modelo existente y comprobar el mensaje «Ya existe un paciente con ese DNI».
- [x] 2.2 Escribir pruebas de edición con DNI propio y con el DNI de otro paciente activo. Implementar edición y comprobar que un conflicto deja el registro sin cambios.
- [x] 2.3 Escribir pruebas de baja lógica y de búsqueda por apellido parcial, DNI con puntos y página. Implementar ambas operaciones y comprobar que solo se devuelven activos, con el historial del paciente de baja intacto.
- [x] 2.4 Escribir pruebas de sesión ausente y rol `PROFESIONAL` antes de conectar las acciones al servidor. Comprobar que una escritura prohibida no llega al repositorio.

## 3. Pantalla de pacientes

- [x] 3.1 Reemplazar el marcador con encabezado, tabla, buscador, paginación y estado vacío. Comprobar que la búsqueda espera 250 ms y descarta respuestas de filtros anteriores.
- [x] 3.2 Incorporar formularios de alta y edición y confirmación de baja con los componentes compartidos. Comprobar el manejo de errores, la cancelación de la baja y la actualización del listado.
- [x] 3.3 Comprobar en la interacción que `PROFESIONAL` consulta la pantalla sin mandos de escritura y que todos los controles usan `@/components/ui`.

## 4. Verificación integral

- [x] 4.1 Vincular a cada escenario su prueba o comprobación observable. Verificar que la baja mantiene los turnos históricos y excluye al paciente de nuevas reservas.
- [x] 4.2 Ejecutar `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`. Guardar las evidencias de ejecución y confirmar que el diff de aplicación está dentro de la zona de C-02.
- [ ] 4.3 Probar `/pacientes` con credenciales de prueba entregadas por el líder y datos ficticios. Registrar por separado la prueba visual si las credenciales siguen pendientes.

## Workflow follow-up

- Archivar el change cuando la verificación quede completa.
- Pedir autorización para publicar el commit y abrir el PR en la rama `C-02-pacientes`.
