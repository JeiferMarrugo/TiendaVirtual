import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashSync } from "bcryptjs";

const { Pool } = pg;

// Crear adaptador Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== USUARIOS ====================
const seedUsers = [
  {
    email: "admin@tienda.local",
    password: "admin123",
    role: "ADMIN",
    profile: {
      firstName: "Sofia",
      lastName: "Admin",
      phone: "+57 310 1234567",
      bio: "Administrador del sistema",
    },
  },
  {
    email: "editor@tienda.local",
    password: "editor123",
    role: "EDITOR",
    profile: {
      firstName: "Carlos",
      lastName: "Editor",
      phone: "+57 310 7654321",
      bio: "Editor de contenidos",
    },
  },
  {
    email: "viewer@tienda.local",
    password: "viewer123",
    role: "VIEWER",
    profile: {
      firstName: "Ana",
      lastName: "Viewer",
      phone: "+57 310 9876543",
      bio: "Visualizador de datos",
    },
  },
];

// ==================== MENÚS ====================
const seedMenus = [
  {
    name: "Main Admin Menu",
    slug: "main-admin",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "LayoutDashboard",
      },
      {
        label: "Productos",
        href: "/admin?view=products",
        icon: "ShoppingCart",
      },
      {
        label: "Pedidos",
        href: "/admin?view=orders",
        icon: "Receipt",
      },
      {
        label: "Usuarios",
        href: "/admin?view=users",
        icon: "Users",
      },
      {
        label: "Menús",
        href: "/admin?view=menus",
        icon: "Menu",
      },
    ],
  },
  {
    name: "Footer Menu",
    slug: "footer",
    items: [
      {
        label: "Sobre Nosotros",
        href: "/about",
      },
      {
        label: "Contacto",
        href: "/contact",
      },
      {
        label: "Privacidad",
        href: "/privacy",
      },
      {
        label: "Términos",
        href: "/terms",
      },
    ],
  },
];

// ==================== PRODUCTOS ====================
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
  console.log("🌱 Iniciando seed de la base de datos...\n");

  // ==================== CREAR USUARIOS ====================
  console.log("👥 Creando usuarios...");
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashSync(user.password, 10),
        role: user.role,
        isActive: true,
        profile: {
          create: user.profile,
        },
      },
    });
    console.log(`   ✓ ${user.email} (${user.role})`);
  }

  // ==================== CREAR MENÚS ====================
  console.log("\n📋 Creando menús...");
  for (const menu of seedMenus) {
    await prisma.menu.upsert({
      where: { slug: menu.slug },
      update: {
        name: menu.name,
      },
      create: {
        name: menu.name,
        slug: menu.slug,
        isActive: true,
        items: {
          create: menu.items.map((item, index) => ({
            label: item.label,
            href: item.href,
            icon: item.icon || null,
            order: index,
            isActive: true,
          })),
        },
      },
    });
    console.log(`   ✓ ${menu.name}`);
  }

  // ==================== CREAR PRODUCTOS ====================
  console.log("\n🛍️  Creando productos...");
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
    console.log(`   ✓ ${product.name}`);
  }

  console.log("\n✅ Seed completado exitosamente!");
  console.log("\n📝 Credenciales de prueba:");
  console.log("   Admin:  admin@tienda.local / admin123");
  console.log("   Editor: editor@tienda.local / editor123");
  console.log("   Viewer: viewer@tienda.local / viewer123");
}

main()
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
