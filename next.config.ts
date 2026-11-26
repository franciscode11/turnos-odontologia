import type { NextConfig } from "next";

// cacheComponents y partialPrefetching quedan apagados a propósito (design.md §1):
// con renderizado dinámico clásico los integrantes no necesitan conocer las reglas de
// Suspense de Cache Components para leer la sesión o la base en sus páginas.
// agentRules: false evita que `next dev` agregue su bloque a AGENTS.md (y lo desincronice de
// CLAUDE.md); la misma advertencia ya está en las reglas del proyecto.
const nextConfig: NextConfig = {
  agentRules: false,
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
