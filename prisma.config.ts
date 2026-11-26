import "dotenv/config";
import { defineConfig } from "prisma/config";

// Las migraciones usan la conexión directa (DIRECT_URL, puerto 5432). Solo el líder la tiene.
// Sin la variable (CI, integrantes), `prisma generate` igual funciona: no se conecta.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "postgresql://sin-configurar@localhost:5432/sin-configurar",
  },
});
