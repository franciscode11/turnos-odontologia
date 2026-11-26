import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Único cliente Prisma del proyecto. No instanciar otro en ningún módulo.
// DATABASE_URL = pooler de transacciones de Supabase (puerto 6543).
function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en el .env (pedíselo al líder por privado).");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function cliente(): PrismaClient {
  if (!globalParaPrisma.prisma) globalParaPrisma.prisma = crearCliente();
  return globalParaPrisma.prisma;
}

/**
 * Se crea recién en el primer uso, así `next build` y los tests no necesitan la base.
 * Uso: `import { prisma } from "@/server/db"` y `prisma.paciente.findMany(...)`.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_destino, propiedad) {
    const real = cliente();
    const valor: unknown = Reflect.get(real, propiedad);
    return typeof valor === "function" ? (valor as (...args: unknown[]) => unknown).bind(real) : valor;
  },
});
