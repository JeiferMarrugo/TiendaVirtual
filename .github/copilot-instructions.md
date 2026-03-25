- [x] Verify that the copilot-instructions.md file in the .github directory is created.
  Summary: archivo creado y mantenido dentro de `.github`.

- [x] Clarify Project Requirements
  Summary: proyecto definido como Next.js con TypeScript, App Router, tienda visual premium y panel administrativo.

- [x] Scaffold the Project
  Summary: aplicacion Next.js creada en la raiz del workspace con npm, Tailwind y App Router.

- [x] Customize the Project
  Summary: tienda publica en `/`, panel admin en `/admin`, carrito, login/logout, sidebar desplegable, popups y sincronizacion local de ventas.

- [x] Install Required Extensions
  Summary: no se requirieron extensiones adicionales.

- [x] Compile the Project
  Summary: dependencias instaladas y `npm run build` completado correctamente.

- [x] Create and Run Task
  Summary: omitido; los scripts de npm existentes cubren desarrollo y build sin necesidad de `tasks.json`.

- [ ] Launch the Project
  Summary: pendiente de confirmacion del usuario para iniciar en modo debug o desarrollo.

- [x] Ensure Documentation is Complete
  Summary: README actualizado y este archivo limpiado de comentarios HTML.

- [x] Optimize Product Images
  Summary: Implementación de normalización automática de imágenes con `sharp`:
  - Todas las imágenes se redimensionan a 400x400px manteniendo aspect ratio
  - Compresión automática con WebP para mejor rendimiento
  - Cards de productos ahora con `aspect-square` para consistencia visual
  - Transiciones de hover mejoradas (scale-110 en lugar de scale-105)
  - Lazy loading en thumbnails del modal
  - API `/api/uploads/image` actualizada con procesamiento automático

- [x] Implement Real-time Authentication & Database
  Summary: Sistema completo de autenticación con BD y menús dinámicos:
  
  **Autenticación:**
  - Modelo User con email, password hasheado (bcryptjs) y roles (ADMIN, EDITOR, VIEWER)
  - Modelo Profile para datos adicionales del usuario
  - JWT tokens con expiración de 7 días
  - Endpoints: POST /api/auth/register, POST /api/auth/login
  - Helper functions en `src/lib/auth.ts` para hashing, tokens y verificación
  
  **Usuarios & Perfiles (CRUD):**
  - Endpoint GET /api/users - listar usuarios (ADMIN only)
  - Endpoint POST /api/users - crear usuario (ADMIN only)
  - Endpoint PUT /api/users/[id] - actualizar usuario (ADMIN only)
  - Endpoint DELETE /api/users/[id] - eliminar usuario (ADMIN only)
  - Perfiles asociados a usuarios con firstName, lastName, phone, bio, avatar
  
  **Menús Dinámicos:**
  - Modelo Menu con nombre, slug único e items ordenados
  - Modelo MenuItem con label, href, icon, order, isActive
  - Endpoint GET /api/menus - listar menús (público)
  - Endpoint POST /api/menus - crear menú (ADMIN only)
  - Endpoint PUT /api/menus/[id] - actualizar menú (ADMIN only)
  - Endpoint DELETE /api/menus/[id] - eliminar menú (ADMIN only)
  - Endpoint POST /api/menus/[menuId]/items - agregar item (ADMIN only)
  - Endpoint PUT /api/menus/[menuId]/items/[itemId] - actualizar item (ADMIN only)
  - Endpoint DELETE /api/menus/[menuId]/items/[itemId] - eliminar item (ADMIN only)
  
  **Datos Iniciales:**
  - Seed script en `prisma/seed.mjs` crea 3 usuarios de prueba:
    - admin@tienda.local / admin123 (ADMIN)
    - editor@tienda.local / editor123 (EDITOR)
    - viewer@tienda.local / viewer123 (VIEWER)
  - 2 menús preconfigurados: Main Admin Menu y Footer Menu
  - 3 productos de ejemplo
  
  **Scripts disponibles:**
  - `npm run db:seed` - ejecutar seed
  - `npm run db:init` - migrar DB + seed
  - `npm run db:reset` - resetear DB completamente + seed
  - `npm run prisma:studio` - abrir Prisma Studio para ver/editar datos