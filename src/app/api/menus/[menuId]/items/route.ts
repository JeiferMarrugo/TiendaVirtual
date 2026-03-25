import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

type CreateMenuItemBody = {
  label: string;
  href: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
};

type ReorderMenuItemsBody = {
  items: Array<{
    id: string;
    parentId?: string | null;
    order: number;
  }>;
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
    if (!payload || !isAdminRole(payload.role)) {
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

    // Contar items hermanos existentes para definir order
    const itemCount = await prisma.menuItem.count({
      where: {
        menuId,
        parentId: body.parentId ?? null,
      },
    });

    const item = await prisma.menuItem.create({
      data: {
        label: body.label,
        href: body.href,
        icon: body.icon,
        order: body.order ?? itemCount,
        parentId: body.parentId ?? null,
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

// PATCH /api/menus/[menuId]/items - Actualizar jerarquía y orden por lote
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const done = logger.timer("PATCH /api/menus/[menuId]/items", "Jerarquía de items actualizada");

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

    const body = (await request.json()) as ReorderMenuItemsBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Se requiere un arreglo de items" },
        { status: 400 }
      );
    }

    const validItems = await prisma.menuItem.findMany({
      where: {
        menuId,
        id: {
          in: body.items.map((item) => item.id),
        },
      },
      select: { id: true },
    });

    if (validItems.length !== body.items.length) {
      return NextResponse.json(
        { ok: false, message: "Uno o más items no pertenecen a este menú" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      body.items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId ?? null,
            order: item.order,
          },
        })
      )
    );

    done();
    return NextResponse.json({ ok: true, message: "Jerarquía actualizada" });
  } catch (error) {
    done();
    logger.error(
      "PATCH /api/menus/[menuId]/items",
      "Error al actualizar jerarquía de items",
      error
    );
    return NextResponse.json(
      { ok: false, message: "Error al actualizar jerarquía de items" },
      { status: 500 }
    );
  }
}
