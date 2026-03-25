import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export async function POST(request: Request) {
  const done = logger.timer("POST /api/auth/register", "Registro completado");
  
  try {
    const body = (await request.json()) as RegisterBody;

    // Validaciones
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Crear usuario
    const hashedPassword = hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: hashedPassword,
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

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    done();
    logger.success("POST /api/auth/register", "Usuario registrado", {
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    done();
    logger.error("POST /api/auth/register", "Error al registrar", error);
    return NextResponse.json(
      { ok: false, message: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
