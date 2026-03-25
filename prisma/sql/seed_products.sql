BEGIN;

-- Tablas de productos e imagenes, compatibles con el schema de Prisma.
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
  "description" TEXT NOT NULL,
  "accent" TEXT NOT NULL,
  "badge" TEXT NOT NULL,
  "isMarkedNew" BOOLEAN NOT NULL DEFAULT FALSE,
  "discountPercentage" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isMarkedNew" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "discountPercentage" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL, 
  "alt" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductImage_productId_fkey"
    FOREIGN KEY ("productId")
    REFERENCES "Product"("id")
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");

-- =========================
-- PRODUCTOS (UPSERT)
-- =========================

INSERT INTO "Product" (
  "id", "slug", "name", "category", "price", "rating", "description", "accent", "badge", "isMarkedNew", "discountPercentage"
)
VALUES
  ('prd-aurora-lamp', 'aurora-lamp', 'Lampara Aurora', 'Iluminacion', 129, 4.9, 'Luz ambiental con acabado de piedra y laton cepillado.', 'linear-gradient(135deg, #fff8ec 0%, #d4a04a 100%)', 'Nuevo', TRUE, 15),
  ('prd-noir-chair', 'noir-chair', 'Sillon Noir', 'Mobiliario', 420, 4.8, 'Silueta curvada en tela boucle y estructura de nogal.', 'linear-gradient(135deg, #f2ede8 0%, #9e8070 100%)', 'Top', FALSE, 0),
  ('prd-atelier-vase', 'atelier-vase', 'Jarron Atelier', 'Decoracion', 76, 4.7, 'Ceramica mate para composiciones sobrias y elegantes.', 'linear-gradient(135deg, #f5ede9 0%, #a5705e 100%)', 'Edicion', FALSE, 10),
  ('prd-linen-set', 'linen-set', 'Set Linen Calm', 'Textiles', 98, 4.9, 'Textura natural con tonos arena y costuras premium.', 'linear-gradient(135deg, #faf5ed 0%, #c4aa82 100%)', 'Favorito', FALSE, 0),
  ('prd-terra-table', 'terra-table', 'Mesa Terra', 'Mobiliario', 560, 4.8, 'Mesa auxiliar en roble tostado y superficie mineral.', 'linear-gradient(135deg, #ede6db 0%, #8c5e35 100%)', 'Premium', FALSE, 8),
  ('prd-sage-diffuser', 'sage-diffuser', 'Difusor Sage', 'Bienestar', 64, 4.6, 'Aroma botanico con notas herbales y base de vetiver.', 'linear-gradient(135deg, #edf4ee 0%, #5a8c63 100%)', 'Relax', TRUE, 12),
  ('prd-mirror-lune', 'mirror-lune', 'Espejo Lune', 'Decoracion', 210, 4.9, 'Marco delgado con brillo satinado para espacios refinados.', 'linear-gradient(135deg, #f0edf6 0%, #8e7ea8 100%)', 'Premium', FALSE, 0),
  ('prd-plinth-cabinet', 'plinth-cabinet', 'Plinth Cabinet', 'Mobiliario', 850, 4.9, 'Gabinete de exposicion con vidrio templado y base geometrica.', 'linear-gradient(135deg, #f0f0f0 0%, #696969 100%)', 'Iconico', TRUE, 5),
  ('prd-stone-tray', 'stone-tray', 'Bandeja Stone', 'Accesorios', 48, 4.7, 'Pieza escultorica para displays y organizacion de lujo.', 'linear-gradient(135deg, #eeecea 0%, #8a7870 100%)', 'Studio', FALSE, 20)
ON CONFLICT ("slug")
DO UPDATE SET
  "name" = EXCLUDED."name",
  "category" = EXCLUDED."category",
  "price" = EXCLUDED."price",
  "rating" = EXCLUDED."rating",
  "description" = EXCLUDED."description",
  "accent" = EXCLUDED."accent",
  "badge" = EXCLUDED."badge",
  "isMarkedNew" = EXCLUDED."isMarkedNew",
  "discountPercentage" = EXCLUDED."discountPercentage",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Limpiar imagenes existentes para volver a cargar la galeria sin duplicados.
DELETE FROM "ProductImage"
WHERE "productId" IN (
  'prd-aurora-lamp',
  'prd-noir-chair',
  'prd-atelier-vase',
  'prd-linen-set',
  'prd-terra-table',
  'prd-sage-diffuser',
  'prd-mirror-lune',
  'prd-plinth-cabinet',
  'prd-stone-tray'
);

-- =========================
-- IMAGENES DE PRODUCTO
-- =========================

INSERT INTO "ProductImage" ("id", "url", "alt", "sortOrder", "productId") VALUES
  ('img-aurora-1', 'https://images.unsplash.com/photo-1565636192335-14f0afc17d5f?w=500&h=500&fit=crop', 'Lampara Aurora vista frontal', 0, 'prd-aurora-lamp'),
  ('img-aurora-2', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop', 'Lampara Aurora detalle', 1, 'prd-aurora-lamp'),
  ('img-aurora-3', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=500&fit=crop', 'Lampara Aurora ambiente', 2, 'prd-aurora-lamp'),

  ('img-noir-1', 'https://images.unsplash.com/photo-1567538096051-b6a3ce346236?w=500&h=500&fit=crop', 'Sillon Noir vista lateral', 0, 'prd-noir-chair'),
  ('img-noir-2', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop', 'Sillon Noir detalle tela', 1, 'prd-noir-chair'),
  ('img-noir-3', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', 'Sillon Noir ambiente', 2, 'prd-noir-chair'),

  ('img-atelier-1', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop', 'Jarron Atelier vista principal', 0, 'prd-atelier-vase'),
  ('img-atelier-2', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&h=500&fit=crop', 'Jarron Atelier detalle', 1, 'prd-atelier-vase'),
  ('img-atelier-3', 'https://images.unsplash.com/photo-1578500414967-c8de8528006f?w=500&h=500&fit=crop', 'Jarron Atelier con flores', 2, 'prd-atelier-vase'),

  ('img-linen-1', 'https://images.unsplash.com/photo-1567016376408-0d4c7c1e5b66?w=500&h=500&fit=crop', 'Set Linen vista completa', 0, 'prd-linen-set'),
  ('img-linen-2', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop', 'Set Linen detalle textura', 1, 'prd-linen-set'),
  ('img-linen-3', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop', 'Set Linen ambiente', 2, 'prd-linen-set'),

  ('img-terra-1', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', 'Mesa Terra vista completa', 0, 'prd-terra-table'),
  ('img-terra-2', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop', 'Mesa Terra detalle superficie', 1, 'prd-terra-table'),
  ('img-terra-3', 'https://images.unsplash.com/photo-1507474306979-30756178ae15?w=500&h=500&fit=crop', 'Mesa Terra ambiente', 2, 'prd-terra-table'),

  ('img-sage-1', 'https://images.unsplash.com/photo-1600081760069-7e2b7ce67900?w=500&h=500&fit=crop', 'Difusor Sage vista frontal', 0, 'prd-sage-diffuser'),
  ('img-sage-2', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop', 'Difusor Sage detalle', 1, 'prd-sage-diffuser'),
  ('img-sage-3', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&h=500&fit=crop', 'Difusor Sage uso', 2, 'prd-sage-diffuser'),

  ('img-mirror-1', 'https://images.unsplash.com/photo-1578926078328-53f32b61a326?w=500&h=500&fit=crop', 'Espejo Lune vista frontal', 0, 'prd-mirror-lune'),
  ('img-mirror-2', 'https://images.unsplash.com/photo-1599122426515-1eb4ec8ba3c0?w=500&h=500&fit=crop', 'Espejo Lune detalle marco', 1, 'prd-mirror-lune'),
  ('img-mirror-3', 'https://images.unsplash.com/photo-1578926324987-13f2b59ea88f?w=500&h=500&fit=crop', 'Espejo Lune ambiente', 2, 'prd-mirror-lune'),

  ('img-plinth-1', 'https://images.unsplash.com/photo-1565636192335-14f0afc17d5f?w=500&h=500&fit=crop', 'Plinth Cabinet vista completa', 0, 'prd-plinth-cabinet'),
  ('img-plinth-2', 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop', 'Plinth Cabinet detalle vidrio', 1, 'prd-plinth-cabinet'),
  ('img-plinth-3', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=500&fit=crop', 'Plinth Cabinet ambiente', 2, 'prd-plinth-cabinet'),

  ('img-stone-1', 'https://images.unsplash.com/photo-1567016376408-0d4c7c1e5b66?w=500&h=500&fit=crop', 'Bandeja Stone vista principal', 0, 'prd-stone-tray'),
  ('img-stone-2', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop', 'Bandeja Stone detalle', 1, 'prd-stone-tray');

COMMIT;
