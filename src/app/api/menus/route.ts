import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/menus - Listar todos los menús
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        items: {
          orderBy: [
            {
              parentId: "asc",
            },
            {
              order: "asc",
            },
          ],
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      ok: true,
      menus,
    });
  } catch (error) {
    logger.error("GET /api/menus", "Error al obtener menús", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener menús" },
      { status: 500 }
    );
  }
}

type CreateMenuBody = {
  name: string;
  slug: string;
  items?: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
};

// POST /api/menus - Crear menú (solo ADMIN)
export async function POST(request: Request) {
  const done = logger.timer("POST /api/menus", "Menú creado");

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

    const body = (await request.json()) as CreateMenuBody;

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { ok: false, message: "Nombre y slug requeridos" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name: body.name,
        slug: body.slug,
        items: {
          create: (body.items || []).map((item, index) => ({
            label: item.label,
            href: item.href,
            icon: item.icon,
            order: index,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    done();
    logger.success("POST /api/menus", "Menú creado", { slug: menu.slug });

    return NextResponse.json({
      ok: true,
      menu,
    });
  } catch (error) {
    done();
    logger.error("POST /api/menus", "Error al crear menú", error);
    return NextResponse.json(
      { ok: false, message: "Error al crear menú" },
      { status: 500 }
    );
  }
}

type UpdateMenuBody = {
  name?: string;
  isActive?: boolean;
};

// PUT /api/menus/[id] - Actualizar menú
export async function PUT(request: Request) {
  const done = logger.timer("PUT /api/menus/[id]", "Menú actualizado");

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

    const url = new URL(request.url);
    const menuId = url.pathname.split("/").pop();

    if (!menuId) {
      return NextResponse.json(
        { ok: false, message: "ID de menú requerido" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateMenuBody;

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: body.name || undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
      include: {
        items: true,
      },
    });

    done();
    logger.success("PUT /api/menus/[id]", "Menú actualizado", { id: menuId });

    return NextResponse.json({
      ok: true,
      menu,
    });
  } catch (error) {
    done();
    logger.error("PUT /api/menus/[id]", "Error al actualizar menú", error);
    return NextResponse.json(
      { ok: false, message: "Error al actualizar menú" },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[id] - Eliminar menú
export async function DELETE(request: Request) {
  const done = logger.timer("DELETE /api/menus/[id]", "Menú eliminado");

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

    const url = new URL(request.url);
    const menuId = url.pathname.split("/").pop();

    if (!menuId) {
      return NextResponse.json(
        { ok: false, message: "ID de menú requerido" },
        { status: 400 }
      );
    }

    await prisma.menu.delete({
      where: { id: menuId },
    });

    done();
    logger.success("DELETE /api/menus/[id]", "Menú eliminado", { id: menuId });

    return NextResponse.json({ ok: true, message: "Menú eliminado" });
  } catch (error) {
    done();
    logger.error("DELETE /api/menus/[id]", "Error al eliminar menú", error);
    return NextResponse.json(
      { ok: false, message: "Error al eliminar menú" },
      { status: 500 }
    );
  }
}
