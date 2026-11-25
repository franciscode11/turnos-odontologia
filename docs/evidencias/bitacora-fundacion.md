# Bitácora de la fundación

> Registro de qué se decidió en cada etapa de `/active-orchestrator` y por qué (protocolo de inspección). Insumo para la reflexión y el video.

| Fecha | Etapa | Qué pasó | Decisión y motivo |
|---|---|---|---|
| 2026-11-24 | 0 · Entorno | Active Stack Full instalado en macOS. El instalador intentaba `sudo npm -g` y fallaba sin terminal interactiva. | Se usó un `sudo` temporal que no eleva permisos (Node instalado con Homebrew no lo necesita). Después `active-stack` y `engram` no estaban en el PATH (Engram ✘ en `/mcp`): se enlazaron en el bin de Homebrew. Ambos arreglos se agregaron a la guía del equipo. Evidencia: `docs/evidencias/instalacion/`. |
| 2026-11-25 | Ruta | `/active-orchestrator init` recomendó **fundación** (no ruta directa). | Proyecto de varios días, 6 personas y decisiones que deben quedar registradas. Plan aprobado por el líder: Discovery → KB → design system (solo sistema) → roadmap → tareas locales → modo equipo → memoria local → find-skill → registry → AGENTS.md. |
| 2026-11-25 | 1 · OpenSpec init | `openspec init --tools claude,codex --language es --scope project`. | Skills de OpenSpec versionadas en el repo (`.claude/skills`, `.agents/skills`) para que cada integrante las reciba al clonar, use Claude Code o Codex. Se agregó el workflow **verify** (el perfil `core` no lo trae y la consigna pide la fase Verify). |
