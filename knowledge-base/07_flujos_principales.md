# Flujos Principales

> Fuentes: reglas de `05_reglas_de_negocio.md`, arquitectura de `08_arquitectura_propuesta.md`, guías de los integrantes.

## Flujo 1: Inicio de sesión y acceso al panel

**Disparador**: el usuario abre una ruta del panel. **Actor**: cualquier rol.

1. El middleware/proxy lee la sesión de Supabase de las cookies.
2. Sin sesión → redirige a `/login`.
3. El usuario envía email y contraseña; Supabase Auth valida.
4. El servidor carga el `Usuario` por id; si no existe o está inactivo, cierra la sesión y muestra error.
5. Redirige a `/turnos`. El menú muestra solo las secciones del rol (cosmético: el control real está en cada acción).

**Casos de error**: credenciales inválidas → mensaje genérico, sin revelar si el email existe.

## Flujo 2: Patrón de toda acción del servidor

```
Formulario (cliente, react-hook-form + Zod)
   → Server Action (src/server/<modulo>/)
       1. sesión  → sin sesión: error "No autenticado"
       2. requireRol([...])  → rol no permitido: error "Sin permisos"
       3. schema.safeParse(input)  → errores por campo
       4. carga de datos con Prisma
       5. regla de dominio pura (src/domain/<modulo>/)  → error de negocio con mensaje
       6. escritura con Prisma (transacción si hay historial)
       7. revalidatePath(...)  → { ok: true, data }
```

## Flujo 3: Crear turno (C05)

**Disparador**: recepción completa `/turnos/nuevo`. **Actor**: ADMIN o RECEPCION.

1. El formulario pide paciente, profesional, prestación, sillón, fecha y hora de inicio (puede apoyarse en la disponibilidad del C04 cuando esté mergeado).
2. La acción verifica sesión y rol (RN-TU-12) y valida la entrada.
3. Carga la prestación activa y calcula `fin = inicio + duración` (RN-TU-07).
4. Verifica que todo esté activo (RN-TU-10) y que el inicio no sea pasado (RN-TU-09).
5. Carga las franjas y bloqueos del profesional para ese día y verifica RN-TU-08.
6. Carga los turnos que ocupan agenda del profesional y del sillón que se cruzan con `[inicio, fin)` y aplica RN-TU-01 a 03.
7. En una transacción: inserta el `Turno` en `RESERVADO` y su `HistorialTurno` (anterior nulo).
8. Si la base rechaza por la restricción de exclusión (dos reservas simultáneas), devuelve el mismo mensaje de conflicto (RN-TU-06).

```
Recepción → Form → crearTurno() → dominio (validaciones) → Prisma.$transaction
                                                         ← violación de exclusión (23P01) → "ya tiene un turno"
```

**Casos de error**: solapamiento de profesional, sillón ocupado, fuera de franja, bloqueo, pasado, elemento inactivo, rol no permitido.

## Flujo 4: Consultar disponibilidad (C04)

**Disparador**: se elige profesional, fecha y duración. **Actor**: cualquier rol.

1. Carga las franjas del día de la semana, los bloqueos del día y los turnos que ocupan agenda del profesional.
2. Para cada franja genera inicios cada 5 minutos con `inicio + duración ≤ hasta`.
3. Descarta los que se superponen con un bloqueo o un turno (RN-TU-01).
4. Devuelve la lista ordenada. Función pura: `calcularDisponibilidad(franjas, bloqueos, turnos, fecha, duracion)`.

## Flujo 5: Cambiar estado de un turno (C06)

**Disparador**: acción en `/turnos/[id]`. **Actor**: según RN-ES-07.

1. Carga el turno y verifica que la transición sea válida (RN-ES-01, 02).
2. Verifica rol; para atendido/ausente con rol PROFESIONAL, que el turno sea suyo.
3. Cancelar: exige motivo (RN-ES-03). Atendido/ausente: exige `inicio ≤ ahora` (RN-ES-05).
4. En una transacción: actualiza estado (y `motivoCancelacion`) e inserta `HistorialTurno`.
5. Al quedar `CANCELADO`, el turno sale de las restricciones de exclusión y el horario queda libre (RN-ES-04).

**Casos de error**: transición inválida, estado final, motivo vacío, turno futuro para asistencia, profesional ajeno, rol no permitido.

## Flujo 6: Invitar y activar una cuenta (C07)

**Disparador**: el ADMIN invita desde `/equipo`. **Actor**: ADMIN, luego el invitado.

1. La acción verifica rol ADMIN y valida email, rol y profesional vinculado (RN-EQ-02, 03).
2. Crea el `Usuario` en `INVITADO` y llama a `inviteUserByEmail` de Supabase Auth desde el servidor (clave secreta solo en el servidor).
3. El invitado abre el enlace y llega a `/activar-cuenta` con el token.
4. Define nombre y contraseña (RN-EQ-05); el servidor actualiza el usuario a `ACTIVO` e inicia la sesión.

**Casos de error**: token vencido o usado (ofrece pedir reenvío al ADMIN), email ya registrado, contraseña débil.

## Flujo 7: Trabajo del equipo (OPSX por change)

1. El líder mergea el C01 a `main`, actualiza con `main` las ramas `C-0X-…` (creadas al mergear la fundación) y hace obligatorio el CI.
2. Cada integrante, en su rama: explore → propose → (revisión y **Ajustar**) → apply → verify → archive, tocando solo su módulo.
3. Abre PR; CI corre lint + typecheck + test.
4. El líder revisa con la checklist de `equipo/04-plan-lider.md` y mergea con merge commit.
5. Los demás hacen `git merge main` en sus ramas.
