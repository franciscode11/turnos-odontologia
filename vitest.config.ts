import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests de dominio puros: sin base de datos, sin red y sin credenciales.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
