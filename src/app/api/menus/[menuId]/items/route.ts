import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

type CreateMenuItemBody = {
  label: string;
  href: string;
  icon?: string;
  order?: number;
};

// POST /api/menus/[menuId]/items - Agregar item a menú
export async function POST(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const done = logger.timer("POST /api/menus/[menuId]/items", "Item creado");

  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Token requerido" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, message: "Acceso denegado" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateMenuItemBody;

    if (!body.label || !body.href) {
      return NextResponse.json(
        { ok: false, message: "Label y href requeridos" },
        { status: 400 }
      );
    }

    // Contar items existentes para definir order
    const itemCount = await prisma.menuItem.count({
      where: { menuId },
    });

    const item = await prisma.menuItem.create({
      data: {
        label: body.label,
        href: body.href,
        icon: body.icon,
        order: body.order ?? itemCount,
        menuId,
      },
    });

    done();
    logger.success("POST /api/menus/[menuId]/items", "Item creado", {
      label: item.label,
    });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    done();
    logger.error(
      "POST /api/menus/[menuId]/items",
      "Error al crear item",
      error
    );
    return NextResponse.json(
      { ok: false, message: "Error al crear item de menú" },
      { status: 500 }
    );
  }
}
