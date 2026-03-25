import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

type UpdateMenuBody = {
  name?: string;
  isActive?: boolean;
};

function ensureAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);
  if (!token) return { ok: false as const, status: 401, message: "Token requerido" };

  const payload = verifyToken(token);
  if (!payload || !isAdminRole(payload.role)) {
    return { ok: false as const, status: 403, message: "Acceso denegado" };
  }

  return { ok: true as const };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> },
) {
  const done = logger.timer("PUT /api/menus/[menuId]", "Menú actualizado");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
    }

    const { menuId } = await params;
    const body = (await request.json()) as UpdateMenuBody;

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: body.name || undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
      include: { items: true },
    });

    done();
    return NextResponse.json({ ok: true, menu });
  } catch (error) {
    done();
    logger.error("PUT /api/menus/[menuId]", "Error al actualizar menú", error);
    return NextResponse.json({ ok: false, message: "Error al actualizar menú" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> },
) {
  const done = logger.timer("DELETE /api/menus/[menuId]", "Menú eliminado");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
    }

    const { menuId } = await params;
    await prisma.menu.delete({ where: { id: menuId } });

    done();
    return NextResponse.json({ ok: true, message: "Menú eliminado" });
  } catch (error) {
    done();
    logger.error("DELETE /api/menus/[menuId]", "Error al eliminar menú", error);
    return NextResponse.json({ ok: false, message: "Error al eliminar menú" }, { status: 500 });
  }
}
