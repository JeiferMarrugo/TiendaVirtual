import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const done = logger.timer("GET /api/health/db", "Health check completado");
  try {
    logger.info("GET /api/health/db", "Verificando conexion a PostgreSQL...");
    await prisma.$queryRaw`SELECT 1`;
    const productCount = await prisma.product.count();

    done();
    logger.success("GET /api/health/db", `DB activa — ${productCount} producto(s) en catalogo`);
    return NextResponse.json({
      ok: true,
      message: "Conexion PostgreSQL activa con Prisma.",
      productCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    done();
    logger.error("GET /api/health/db", "Fallo la conexion a PostgreSQL", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { ok: false, message: "No se pudo conectar a PostgreSQL.", error: message },
      { status: 500 },
    );
  }
}
