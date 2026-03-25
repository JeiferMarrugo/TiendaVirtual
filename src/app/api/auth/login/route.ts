import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

type LoginBody = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  const done = logger.timer("POST /api/auth/login", "Login completado");

  try {
    const body = (await request.json()) as LoginBody;

    if (!body.email || !body.password) {
      return NextResponse.json(
        { ok: false, message: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: {
        profile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { ok: false, message: "Usuario o contraseña inválidos" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!comparePassword(body.password, user.password)) {
      return NextResponse.json(
        { ok: false, message: "Usuario o contraseña inválidos" },
        { status: 401 }
      );
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.profile.name,
    });

    done();
    logger.success("POST /api/auth/login", "Login exitoso", {
      email: user.email,
      role: user.profile.name,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    done();
    logger.error("POST /api/auth/login", "Error al login", error);
    return NextResponse.json(
      { ok: false, message: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
