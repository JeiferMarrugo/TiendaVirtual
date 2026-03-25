import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, extractTokenFromHeader, verifyToken, isAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

function ensureAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  console.log("Authorization header:", authHeader);
  console.log("Extracted token:", token);

  if (!token) {
    return { ok: false as const, status: 401, message: "Token requerido" };
  }

  const payload = verifyToken(token);
  if (!payload || !isAdminRole(payload.role)) {
    return { ok: false as const, status: 403, message: "Acceso denegado" };
  }

  return { ok: true as const };
}

export async function GET(request: Request) {
  const done = logger.timer("GET /api/users", "Usuarios obtenidos");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
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
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    done();
    logger.error("GET /api/users", "Error al obtener usuarios", error);
    return NextResponse.json({ ok: false, message: "Error al obtener usuarios" }, { status: 500 });
  }
}

type CreateUserBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  profileId: string;
};

export async function POST(request: Request) {
  const done = logger.timer("POST /api/users", "Usuario creado");

  try {
    const authResult = ensureAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.message }, { status: authResult.status });
    }

    const body = (await request.json()) as CreateUserBody;
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const phone = body.phone?.trim();
    const avatar = body.avatar?.trim();
    const bio = body.bio?.trim();

    if (!body.email || !body.password || !firstName || !lastName || !body.profileId) {
      return NextResponse.json({ ok: false, message: "Faltan campos requeridos" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ ok: false, message: "El email ya está registrado" }, { status: 400 });
    }

    const selectedProfile = await prisma.profile.findUnique({ where: { id: body.profileId } });
    if (!selectedProfile) {
      return NextResponse.json({ ok: false, message: "Perfil no encontrado" }, { status: 404 });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: hashPassword(body.password),
        firstName,
        lastName,
        phone: phone || null,
        avatar: avatar || null,
        bio: bio || null,
        profileId: body.profileId,
      },
      include: {
        profile: true,
      },
    });

    done();
    logger.success("POST /api/users", "Usuario creado", { email: user.email, profile: user.profile.name });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    done();
    logger.error("POST /api/users", "Error al crear usuario", error);
    return NextResponse.json({ ok: false, message: "Error al crear usuario" }, { status: 500 });
  }
}
