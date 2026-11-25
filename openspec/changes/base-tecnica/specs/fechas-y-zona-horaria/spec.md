# Spec Delta

## Purpose

Asegura que todos los instantes se guarden en UTC y se muestren e interpreten en hora de Argentina, para que un turno cargado a las 09:00 en el consultorio sea 09:00 para todos, sin importar la zona del navegador o del servidor.

## ADDED Requirements

### Requirement: Guardado en UTC
Todo instante (inicio y fin de turnos, bloqueos, fechas de historial) MUST guardarse como instante absoluto en UTC (RN-GL-03).

#### Scenario: Turno de la mañana
- **WHEN** se registra un turno a las 09:00 del 25/11/2026 en hora de Argentina
- **THEN** se guarda el instante 2026-11-25T12:00:00Z

#### Scenario: Turno cerca de la medianoche
- **WHEN** se registra un turno a las 22:30 del 25/11/2026 en hora de Argentina
- **THEN** se guarda el instante 2026-11-26T01:30:00Z

#### Scenario: Servidor en otra zona horaria
- **GIVEN** un servidor configurado en UTC o en otra zona
- **WHEN** convierte las 09:00 del 25/11/2026 de Argentina a instante
- **THEN** el resultado es el mismo 2026-11-25T12:00:00Z

### Requirement: Presentación en hora de Argentina
Toda fecha y hora mostrada al usuario SHALL expresarse en `America/Argentina/Buenos_Aires`, con formato día/mes/año y hora de 24 h (RN-GL-03).

#### Scenario: Mostrar un instante guardado
- **WHEN** se muestra el instante 2026-11-25T12:00:00Z
- **THEN** se ve "25/11/2026" y "09:00"

#### Scenario: Instante que cambia de día
- **WHEN** se muestra el instante 2026-11-26T01:30:00Z
- **THEN** se ve "25/11/2026" y "22:30"

#### Scenario: Navegador en otra zona horaria
- **GIVEN** un navegador configurado en Madrid
- **WHEN** muestra el instante 2026-11-25T12:00:00Z
- **THEN** igual se ve "09:00", la hora del consultorio

### Requirement: Límites de un día del consultorio
El sistema SHALL calcular el comienzo y el fin de un día calendario en hora de Argentina como el intervalo `[00:00, 00:00 del día siguiente)` en esa zona, para consultar los turnos de un día.

#### Scenario: Rango del 25 de noviembre
- **WHEN** se pide el rango del día 25/11/2026
- **THEN** el resultado es `[2026-11-25T03:00:00Z, 2026-11-26T03:00:00Z)`

#### Scenario: Turno a las 23:30 pertenece a ese día
- **GIVEN** un turno a las 23:30 del 25/11/2026 en hora de Argentina
- **WHEN** se consultan los turnos del 25/11/2026
- **THEN** el turno aparece

#### Scenario: Turno a las 00:00 del día siguiente
- **GIVEN** un turno a las 00:00 del 26/11/2026 en hora de Argentina
- **WHEN** se consultan los turnos del 25/11/2026
- **THEN** el turno no aparece
