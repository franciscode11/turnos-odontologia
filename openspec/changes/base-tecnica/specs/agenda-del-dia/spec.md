# Spec Delta

## Purpose

Permite que cualquier usuario del consultorio vea, en solo lectura, los turnos de un día por profesional, como pantalla de inicio del panel.

## ADDED Requirements

### Requirement: Turnos del día por profesional
La página `/turnos` SHALL mostrar a cualquier rol con sesión los turnos del día elegido (hoy por defecto), agrupados por profesional activo y ordenados por hora de inicio, con paciente, prestación, sillón, horario en hora de Argentina y Badge de estado. No SHALL permitir modificar turnos.

#### Scenario: Día con turnos del seed
- **GIVEN** el seed cargado y un usuario `PROFESIONAL` con sesión
- **WHEN** abre `/turnos` en un día con turnos de ejemplo
- **THEN** ve una columna por profesional activo con sus turnos ordenados por hora, cada uno con paciente, prestación, sillón, horario y estado

#### Scenario: Día sin turnos
- **WHEN** un usuario abre `/turnos` en un día sin turnos
- **THEN** ve el estado vacío "No hay turnos para este día" y las columnas de los profesionales

#### Scenario: Turnos cancelados
- **GIVEN** un día con un turno `CANCELADO`
- **WHEN** se muestra la agenda en vista Día
- **THEN** el cancelado no ocupa lugar en la grilla (libera el horario, RN-TU-04) y en la vista Lista aparece tachado con su Badge "Cancelado"

### Requirement: Navegación entre días
La agenda SHALL permitir ir al día anterior, al siguiente y volver a hoy, y MUST calcular el día en hora de Argentina (RN-GL-03).

#### Scenario: Ir al día siguiente
- **GIVEN** la agenda del 25/11/2026
- **WHEN** el usuario elige "Siguiente"
- **THEN** ve la agenda del 26/11/2026

#### Scenario: Volver a hoy
- **GIVEN** la agenda de otro día
- **WHEN** el usuario elige "Hoy"
- **THEN** ve la agenda de la fecha actual en hora de Argentina

#### Scenario: Fecha inválida en la dirección
- **WHEN** alguien abre `/turnos?fecha=2026-13-45`
- **THEN** el sistema muestra la agenda de hoy en lugar de fallar

### Requirement: Inicio del panel
La raíz del panel (`/`) SHALL llevar al usuario con sesión a `/turnos`.

#### Scenario: Entrar a la raíz con sesión
- **WHEN** un usuario con sesión abre `/`
- **THEN** el sistema lo redirige a `/turnos`

#### Scenario: Entrar a la raíz sin sesión
- **WHEN** alguien sin sesión abre `/`
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Carga lenta
- **WHEN** la consulta de turnos tarda
- **THEN** la página muestra el esqueleto de carga del design system en lugar de una pantalla en blanco
