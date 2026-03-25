# 🛍️ Tienda Virtual Premium

Aplicación full-stack de e-commerce moderna construida con **Next.js 15**, **TypeScript** y **Tailwind CSS**. Incluye una tienda visual premium y un panel administrativo completo todo en una misma aplicación.

---

## ✨ Características Principales

### 🏪 Tienda Pública (`/`)
- Catálogo de productos con interfaz visual premium
- Carrito de compras funcional
- Sistema de autenticación (Login/Logout)
- Barra de navegación superior
- Guardado automático de ventas en localStorage
- Tema claro/oscuro

### 📊 Panel Administrativo (`/admin`)
- Dashboard con métricas e indicadores clave
- Gestión de productos (crear, editar, eliminar)
- Seguimiento de ventas y órdenes en tiempo real
- Gráficos de ventas y estadísticas
- Sincronización automática cada 60 segundos
- Acceso restringido con autenticación
- Barra lateral con navegación desplegable

---

## 🚀 Requisitos Previos

- **Node.js** 18.17+ o superior
- **npm** o **yarn** para gestión de dependencias
- **Git** para control de versiones

---

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd TiendaVirtual
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar `.env.local` con tus configuraciones

4. **Ejecutar migraciones de Prisma (si aplica)**
   ```bash
   npm run db:push
   npx prisma db seed
   ```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linter (ESLint)
npm run lint

# Base de datos - Prisma
npx prisma studio      # Abrir Prisma Studio
npx prisma db push     # Sincronizar esquema
npx prisma db seed     # Ejecutar seed
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                      # App Router de Next.js
│   ├── page.tsx             # Página principal (tienda)
│   ├── admin/               # Rutas del panel admin
│   ├── api/                 # Rutas API
│   └── globals.css          # Estilos globales
├── components/               # Componentes reutilizables
│   ├── storefront-app.tsx   # Aplicación de tienda
│   ├── admin-dashboard.tsx  # Dashboard admin
│   └── admin/               # Componentes específicos del admin
├── features/                 # Características organizadas por dominio
│   └── admin/               # Lógica y componentes del admin
├── lib/                      # Utilidades y helpers
│   ├── prisma.ts           # Cliente Prisma
│   ├── storage.ts          # Gestión de almacenamiento
│   ├── store-data.ts       # Datos de la tienda
│   └── logger.ts           # Sistema de logging
└── hooks/                    # Custom React Hooks

prisma/
├── schema.prisma           # Definición del esquema de BD
├── seed.mjs                # Datos de prueba
└── sql/                    # Migraciones SQL

public/
└── uploads/                # Archivos subidos (productos, etc)
```

---

## 💾 Base de Datos

El proyecto utiliza **Prisma** como ORM. La configuración está en `prisma/schema.prisma`.

- **Base de datos soportadas**: PostgreSQL, MySQL, SQLite
- **Seed**: Ejecutar `npx prisma db seed` para cargar datos iniciales
- **Migraciones**: Usar `npx prisma migrate dev` para cambios en el esquema

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Utilidades de estilos
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos

### Backend & Base de Datos
- **Next.js API Routes** - API serverless
- **Prisma** - ORM moderno
- **PostgreSQL/MySQL/SQLite** - Base de datos

### UI & Notificaciones
- **Sonner** - Sistema de notificaciones toast
- **Radix UI** - Componentes accesibles
- **Recharts** - Gráficos y visualización

---

## 🔐 Autenticación y Persistencia

- Sistema de login/logout básico
- **localStorage** para persistencia del estado
- Ventas y datos de usuarios se guardan localmente
- Sincronización automática entre pestañas (StorageEvent)
- El panel admin fuerza sincronización cada 60 segundos

---

## 📝 Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/tienda_virtual"

# API (si aplica)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Otros
NODE_ENV="development"
```

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t tienda-virtual .
docker run -p 3000:3000 tienda-virtual
```

### Otros Hosting
- Ensure `npm run build` completes without errors
- Set `NODE_ENV=production`
- Configure `DATABASE_URL` en el servidor

---

## 📌 Notas Técnicas

- ✅ App Router (No Pages Router)
- ✅ Componentes Server-side donde sea posible
- ✅ Optimización de imágenes con Next.js Image
- ✅ CSS Modules + Tailwind CSS
- ✅ Manejo de errores con ErrorBoundary
- ✅ Logging centralizado

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Soporte

Para reportar bugs o sugerencias, abre un [Issue](https://github.com/username/TiendaVirtual/issues).
