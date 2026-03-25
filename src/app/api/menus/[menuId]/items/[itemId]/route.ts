import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

type UpdateMenuItemBody = {
  label?: string;
  href?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
  isActive?: boolean;
};

// PUT /api/menus/[menuId]/items/[itemId] - Actualizar item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  const { menuId, itemId } = await params;
  const done = logger.timer("PUT /api/menus/[menuId]/items/[itemId]", "Item actualizado");

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
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json(
        { ok: false, message: "Acceso denegado" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as UpdateMenuItemBody;

    if (body.parentId) {
      const parent = await prisma.menuItem.findFirst({
        where: {
          id: body.parentId,
          menuId,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { ok: false, message: "El item padre no existe en este menú" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        label: body.label || undefined,
        href: body.href || undefined,
        icon: body.icon || undefined,
        order: body.order !== undefined ? body.order : undefined,
        parentId: body.parentId !== undefined ? body.parentId : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });

    done();
    logger.success("PUT /api/menus/[menuId]/items/[itemId]", "Item actualizado", {
      id: itemId,
    });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    done();
    logger.error(
      "PUT /api/menus/[menuId]/items/[itemId]",
      "Error al actualizar item",
      error
    );
    return NextResponse.json(
      { ok: false, message: "Error al actualizar item de menú" },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[menuId]/items/[itemId] - Eliminar item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  const { itemId } = await params;
  const done = logger.timer("DELETE /api/menus/[menuId]/items/[itemId]", "Item eliminado");

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
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json(
        { ok: false, message: "Acceso denegado" },
        { status: 403 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    done();
    logger.success("DELETE /api/menus/[menuId]/items/[itemId]", "Item eliminado", {
      id: itemId,
    });

    return NextResponse.json({ ok: true, message: "Item eliminado" });
  } catch (error) {
    done();
    logger.error(
      "DELETE /api/menus/[menuId]/items/[itemId]",
      "Error al eliminar item",
      error
    );
    return NextResponse.json(
      { ok: false, message: "Error al eliminar item de menú" },
      { status: 500 }
    );
  }
}
