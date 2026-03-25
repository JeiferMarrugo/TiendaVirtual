import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  profileId?: string;
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
  { params }: { params: Promise<{ id: string }> },
) {
  const done = logger.timer("PUT /api/users/[id]", "Usuario actualizado");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateUserBody;
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const phone = body.phone?.trim();
    const avatar = body.avatar?.trim();
    const bio = body.bio?.trim();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    if (body.profileId) {
      const selectedProfile = await prisma.profile.findUnique({ where: { id: body.profileId } });
      if (!selectedProfile) {
        return NextResponse.json({ ok: false, message: "Perfil no encontrado" }, { status: 404 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone !== undefined ? phone || null : undefined,
        avatar: avatar !== undefined ? avatar || null : undefined,
        bio: bio !== undefined ? bio || null : undefined,
        profileId: body.profileId || undefined,
        isActive: body.isActive !== undefined ? body.isActive : user.isActive,
      },
      include: { profile: true },
    });

    done();
    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    done();
    logger.error("PUT /api/users/[id]", "Error al actualizar usuario", error);
    return NextResponse.json({ ok: false, message: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const done = logger.timer("DELETE /api/users/[id]", "Usuario eliminado");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
    }

    const { id } = await params;
    await prisma.user.delete({ where: { id } });

    done();
    return NextResponse.json({ ok: true, message: "Usuario eliminado" });
  } catch (error) {
    done();
    logger.error("DELETE /api/users/[id]", "Error al eliminar usuario", error);
    return NextResponse.json({ ok: false, message: "Error al eliminar usuario" }, { status: 500 });
  }
}
