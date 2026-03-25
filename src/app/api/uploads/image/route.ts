import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type UploadBody = {
  dataUrl?: string;
  fileName?: string;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function extensionFromMime(mime: string) {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  const done = logger.timer("POST /api/uploads/image", "Upload completado");
  try {
    const body = (await request.json()) as UploadBody;
    logger.info("POST /api/uploads/image", `fileName: "${body.fileName}" | dataUrl presente: ${!!body.dataUrl}`);

    if (!body.dataUrl || !body.dataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { ok: false, message: "Imagen invalida. Se esperaba data URL." },
        { status: 400 },
      );
    }

    const [meta, base64Data] = body.dataUrl.split(",");
    if (!meta || !base64Data) {
      return NextResponse.json(
        { ok: false, message: "Formato de imagen invalido." },
        { status: 400 },
      );
    }

    const mimeMatch = meta.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64$/);
    if (!mimeMatch) {
      return NextResponse.json(
        { ok: false, message: "Mime type de imagen no soportado." },
        { status: 400 },
      );
    }

    const mime = mimeMatch[1];
    const ext = extensionFromMime(mime);
    const cleanFileName = sanitizeFileName(body.fileName || `product-${Date.now()}`);
    const finalFileName = `${cleanFileName}-${randomUUID().slice(0, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const fileBuffer = Buffer.from(base64Data, "base64");
    const filePath = path.join(uploadDir, finalFileName);
    await writeFile(filePath, fileBuffer);

    done();
    logger.success("POST /api/uploads/image", `Imagen guardada`, {
      fileName: finalFileName,
      mime,
      sizeKb: Math.round(fileBuffer.length / 1024),
      url: `/uploads/products/${finalFileName}`,
    });

    return NextResponse.json({
      ok: true,
      url: `/uploads/products/${finalFileName}`,
      storage: "local",
    });
  } catch (error) {
    done();
    logger.error("POST /api/uploads/image", "Error al guardar imagen", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { ok: false, message: "No se pudo guardar la imagen en el repositorio.", error: message },
      { status: 500 },
    );
  }
}
