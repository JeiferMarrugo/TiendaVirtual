import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

function isStaleClient(client: PrismaClient | undefined) {
  if (!client) {
    return true;
  }

  // In dev HMR, a cached client can be stale after schema updates.
  // Some stale clients still expose the property key but with an invalid delegate value.
  const maybeDelegate = (client as unknown as { generalSettings?: { upsert?: unknown } }).generalSettings;
  return typeof maybeDelegate?.upsert !== "function";
}

const client = isStaleClient(globalForPrisma.prisma)
  ? createPrismaClient()
  : globalForPrisma.prisma;

export const prisma = client as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
