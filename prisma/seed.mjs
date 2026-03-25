import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedProducts = [
  {
    slug: "aurora-lamp",
    name: "Lampara Aurora",
    category: "Iluminacion",
    price: 129,
    rating: 4.9,
    description: "Luz ambiental con acabado de piedra y laton cepillado.",
    accent: "linear-gradient(135deg, #fff8ec 0%, #d4a04a 100%)",
    badge: "Nuevo",
    images: [
      {
        url: "https://images.unsplash.com/photo-1565636192335-14f0afc17d5f?w=500&h=500&fit=crop",
        alt: "Lampara Aurora vista frontal",
      },
      {
        url: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop",
        alt: "Lampara Aurora detalle",
      },
    ],
  },
  {
    slug: "noir-chair",
    name: "Sillon Noir",
    category: "Mobiliario",
    price: 420,
    rating: 4.8,
    description: "Silueta curvada en tela boucle y estructura de nogal.",
    accent: "linear-gradient(135deg, #f2ede8 0%, #9e8070 100%)",
    badge: "Top",
    images: [
      {
        url: "https://images.unsplash.com/photo-1567538096051-b6a3ce346236?w=500&h=500&fit=crop",
        alt: "Sillon Noir vista lateral",
      },
      {
        url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop",
        alt: "Sillon Noir detalle tela",
      },
    ],
  },
  {
    slug: "atelier-vase",
    name: "Jarron Atelier",
    category: "Decoracion",
    price: 76,
    rating: 4.7,
    description: "Ceramica mate para composiciones sobrias y elegantes.",
    accent: "linear-gradient(135deg, #f5ede9 0%, #a5705e 100%)",
    badge: "Edicion",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop",
        alt: "Jarron Atelier vista principal",
      },
      {
        url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&h=500&fit=crop",
        alt: "Jarron Atelier detalle",
      },
    ],
  },
];

async function main() {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        price: product.price,
        rating: product.rating,
        description: product.description,
        accent: product.accent,
        badge: product.badge,
      },
      create: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        rating: product.rating,
        description: product.description,
        accent: product.accent,
        badge: product.badge,
        images: {
          create: product.images.map((image, index) => ({
            ...image,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log("Seed Prisma completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
