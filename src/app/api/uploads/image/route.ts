import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import sharp from "sharp";

type UploadBody = {
  dataUrl?: string;
  fileName?: string;
};

// Dimensiones estándar para normalizar todas las imágenes
const PRODUCT_IMAGE_WIDTH = 400;
const PRODUCT_IMAGE_HEIGHT = 400;
const PRODUCT_IMAGE_QUALITY = 80;

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
  // Priorizar webp para mejor compresión
  if (mime.includes("png")) return "png";
  if (mime.includes("gif")) return "gif";
  // Convertir JPEG y otros formatos a WebP para mejor ratio de compresión
  return "webp";
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

    const originalFileBuffer = Buffer.from(base64Data, "base64");
    logger.info("POST /api/uploads/image", `Procesando imagen: ${PRODUCT_IMAGE_WIDTH}x${PRODUCT_IMAGE_HEIGHT}px`);

    // Procesar y normalizar imagen
    let processedBuffer: Buffer;
    try {
      let sharpImage = sharp(originalFileBuffer);
      
      // Obtener metadatos para procesamiento inteligente
      const metadata = await sharpImage.metadata();
      
      // Redimensionar manteniendo aspect ratio y agregando padding si es necesario
      processedBuffer = await sharpImage
        .resize(PRODUCT_IMAGE_WIDTH, PRODUCT_IMAGE_HEIGHT, {
          fit: "contain", // Mantiene aspect ratio sin recortar
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo transparente
          position: "center",
        })
        .toFormat(ext as "webp" | "png" | "jpeg" | "jpg" | "gif", {
          quality: PRODUCT_IMAGE_QUALITY,
          progressive: true,
        })
        .toBuffer();

      logger.info("POST /api/uploads/image", `Imagen procesada`, {
        original: `${metadata.width}x${metadata.height}`,
        normalized: `${PRODUCT_IMAGE_WIDTH}x${PRODUCT_IMAGE_HEIGHT}`,
        originalSizeKb: Math.round(originalFileBuffer.length / 1024),
        processedSizeKb: Math.round(processedBuffer.length / 1024),
      });
    } catch (processError) {
      logger.warn("POST /api/uploads/image", `Error procesando imagen, usando original`, processError);
      processedBuffer = originalFileBuffer;
    }

    const filePath = path.join(uploadDir, finalFileName);
    await writeFile(filePath, processedBuffer);

    done();
    logger.success("POST /api/uploads/image", `Imagen guardada y normalizada`, {
      fileName: finalFileName,
      mime,
      sizeKb: Math.round(processedBuffer.length / 1024),
      dimensions: `${PRODUCT_IMAGE_WIDTH}x${PRODUCT_IMAGE_HEIGHT}`,
      url: `/uploads/products/${finalFileName}`,
    });

    return NextResponse.json({
      ok: true,
      url: `/uploads/products/${finalFileName}`,
      storage: "local",
      dimensions: {
        width: PRODUCT_IMAGE_WIDTH,
        height: PRODUCT_IMAGE_HEIGHT,
      },
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
