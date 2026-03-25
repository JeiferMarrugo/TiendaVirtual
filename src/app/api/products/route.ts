import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type ProductImageInput = {
  url: string;
  alt: string;
};

type CreateProductBody = {
  name: string;
  category: string;
  price: number;
  rating?: number;
  description: string;
  accent?: string;
  badge?: string;
  isMarkedNew?: boolean;
  discountPercentage?: number;
  images: ProductImageInput[];
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapProduct(product: {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  accent: string;
  badge: string;
  createdAt: Date;
  isMarkedNew: boolean;
  discountPercentage: number;
  images: Array<{ id: string; url: string; alt: string }>;
}) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    rating: product.rating,
    description: product.description,
    accent: product.accent,
    badge: product.badge,
    createdAt: product.createdAt.toISOString(),
    isMarkedNew: product.isMarkedNew,
    discountPercentage: product.discountPercentage,
    images: product.images,
  };
}

export async function GET() {
  const done = logger.timer("GET /api/products", "Query completada");
  try {
    logger.info("GET /api/products", "Consultando productos en DB...");
    const rows = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, alt: true },
        },
      },
    });

    done();
    logger.success("GET /api/products", `${rows.length} producto(s) retornados`, {
      ids: rows.map((r) => r.id),
    });
    return NextResponse.json({ ok: true, data: rows.map(mapProduct) });
  } catch (error) {
    done();
    logger.error("GET /api/products", "Error al obtener productos", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { ok: false, message: "No se pudieron obtener productos.", error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const done = logger.timer("POST /api/products", "Producto creado");
  try {
    const body = (await request.json()) as CreateProductBody;

    logger.info("POST /api/products", "Body recibido", {
      name: body.name,
      category: body.category,
      price: body.price,
      badge: body.badge,
      isMarkedNew: body.isMarkedNew,
      discountPercentage: body.discountPercentage,
      images: `${body.images?.length ?? 0} imagen(es)`,
    });

    if (!body.name?.trim()) {
      return NextResponse.json({ ok: false, message: "Nombre es requerido." }, { status: 400 });
    }

    if (!body.images?.length) {
      return NextResponse.json(
        { ok: false, message: "Se requiere al menos una imagen." },
        { status: 400 },
      );
    }

    const discount = Math.min(Math.max(Number(body.discountPercentage ?? 0), 0), 90);
    const baseSlug = toSlug(body.name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    logger.info("POST /api/products", `Insertando en DB con slug: ${slug}`);
    const created = await prisma.product.create({
      data: {
        slug,
        name: body.name.trim(),
        category: body.category || "General",
        price: Number(body.price) || 0,
        rating: Number(body.rating ?? 4.8),
        description: body.description?.trim() || "",
        accent: body.accent || "linear-gradient(135deg, #e6f7fb 0%, #0e7490 100%)",
        badge: body.badge?.trim() || "Nuevo",
        isMarkedNew: Boolean(body.isMarkedNew),
        discountPercentage: discount,
        images: {
          create: body.images.map((image, index) => ({
            url: image.url,
            alt: image.alt || `Imagen ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, url: true, alt: true },
        },
      },
    });

    done();
    logger.success("POST /api/products", "Producto creado OK", {
      id: created.id,
      slug: created.slug,
      name: created.name,
      images: created.images.length,
    });
    return NextResponse.json({ ok: true, data: mapProduct(created) }, { status: 201 });
  } catch (error) {
    done();
    logger.error("POST /api/products", "Error al crear producto", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { ok: false, message: "No se pudo crear el producto.", error: message },
      { status: 500 },
    );
  }
}
