import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const done = logger.timer("GET /api/profiles", "Perfiles obtenidos");

  try {
    const profiles = await prisma.profile.findMany({
      orderBy: {
        name: "asc",
      },
    });

    done();
    return NextResponse.json({ ok: true, profiles });
  } catch (error) {
    done();
    logger.error("GET /api/profiles", "Error al obtener perfiles", error);
    return NextResponse.json({ ok: false, message: "Error al obtener perfiles" }, { status: 500 });
  }
}
