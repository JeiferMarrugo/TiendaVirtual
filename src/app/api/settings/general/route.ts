import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, isAdminRole, verifyToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

type UpdateSettingsBody = {
  companyName?: string;
  nit?: string;
  logoUrl?: string;
  accentColor?: string;
};

function isHexColor(value: string) {
  return /^#([A-Fa-f0-9]{6})$/.test(value);
}

async function getOrCreateSettings() {
  return prisma.generalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Maison Canvas",
      accentColor: "#0e7490",
    },
  });
}

export async function GET() {
  const done = logger.timer("GET /api/settings/general", "Configuración obtenida");

  try {
    const settings = await getOrCreateSettings();
    done();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    done();
    logger.error("GET /api/settings/general", "Error al obtener configuración", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener la configuración" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const done = logger.timer("PUT /api/settings/general", "Configuración actualizada");

  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ ok: false, message: "Token requerido" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ ok: false, message: "Acceso denegado" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateSettingsBody;

    const companyName = body.companyName?.trim();
    const nit = body.nit?.trim();
    const logoUrl = body.logoUrl?.trim();
    const accentColor = body.accentColor?.trim();

    if (!companyName) {
      return NextResponse.json(
        { ok: false, message: "El nombre de la empresa es obligatorio" },
        { status: 400 },
      );
    }

    if (accentColor && !isHexColor(accentColor)) {
      return NextResponse.json(
        { ok: false, message: "El color debe estar en formato HEX #RRGGBB" },
        { status: 400 },
      );
    }

    const settings = await prisma.generalSettings.upsert({
      where: { id: "default" },
      update: {
        companyName,
        nit: nit || null,
        logoUrl: logoUrl || null,
        accentColor: accentColor || "#0e7490",
      },
      create: {
        id: "default",
        companyName,
        nit: nit || null,
        logoUrl: logoUrl || null,
        accentColor: accentColor || "#0e7490",
      },
    });

    done();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    done();
    logger.error("PUT /api/settings/general", "Error al actualizar configuración", error);
    return NextResponse.json(
      { ok: false, message: "Error al actualizar la configuración" },
      { status: 500 },
    );
  }
}
