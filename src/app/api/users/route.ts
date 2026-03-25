import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, extractTokenFromHeader, verifyToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/users - Listar todos los usuarios
export async function GET(request: Request) {
  const done = logger.timer("GET /api/users", "Usuarios obtenidos");

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

    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    done();
    return NextResponse.json({
      ok: true,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        profile: u.profile,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    done();
    logger.error("GET /api/users", "Error al obtener usuarios", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

type CreateUserBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

// POST /api/users - Crear usuario (solo ADMIN)
export async function POST(request: Request) {
  const done = logger.timer("POST /api/users", "Usuario creado");

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

    const body = (await request.json()) as CreateUserBody;

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: hashedPassword,
        role: body.role,
        profile: {
          create: {
            firstName: body.firstName,
            lastName: body.lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    done();
    logger.success("POST /api/users", "Usuario creado", { email: user.email });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    done();
    logger.error("POST /api/users", "Error al crear usuario", error);
    return NextResponse.json(
      { ok: false, message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}

type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
  isActive?: boolean;
};

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(request: Request) {
  const done = logger.timer("PUT /api/users/[id]", "Usuario actualizado");

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

    // Extraer ID de la URL
    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateUserBody;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: body.role || user.role,
        isActive: body.isActive !== undefined ? body.isActive : user.isActive,
        profile: {
          update: {
            firstName: body.firstName || undefined,
            lastName: body.lastName || undefined,
            phone: body.phone || undefined,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    done();
    logger.success("PUT /api/users/[id]", "Usuario actualizado", { id: userId });

    return NextResponse.json({
      ok: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    done();
    logger.error("PUT /api/users/[id]", "Error al actualizar usuario", error);
    return NextResponse.json(
      { ok: false, message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(request: Request) {
  const done = logger.timer("DELETE /api/users/[id]", "Usuario eliminado");

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

    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    done();
    logger.success("DELETE /api/users/[id]", "Usuario eliminado", { id: userId });

    return NextResponse.json({ ok: true, message: "Usuario eliminado" });
  } catch (error) {
    done();
    logger.error("DELETE /api/users/[id]", "Error al eliminar usuario", error);
    return NextResponse.json(
      { ok: false, message: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
