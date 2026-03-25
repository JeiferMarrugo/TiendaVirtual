# 🗄️ Base de Datos - Guía de Scripts

## Scripts Principales

### Inicializar Base de Datos (Primera vez)
```bash
npm run db:init
```
- Sincroniza el schema con PostgreSQL
- Ejecuta el seed con datos iniciales (usuarios, menús, productos)
- **Usa esto la primera vez** que configures el proyecto

### Ejecutar Solo el Seed
```bash
npm run db:seed
```
- Puebla/actualiza la base de datos con:
  - 3 usuarios de prueba
  - 2 menús preconfigurados
  - 3 productos de ejemplo
- No borra datos existentes (usa `upsert`)

### Resetear la Base de Datos Completamente
```bash
npm run db:reset
```
- ⚠️ **Elimina TODOS los datos**
- Recrear las tablas desde cero
- Ejecuta el seed automáticamente
- **Úsalo solo en desarrollo**

### Ver/Editar Datos en Prisma Studio
```bash
npm run prisma:studio
```
- Abre interfaz gráfica en http://localhost:5555
- Permite ver, crear, editar y eliminar registros
- Muy útil para debug

---

## 👥 Credenciales de Prueba

Después de correr `db:seed`, puedes usar estas credenciales:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@tienda.local` | `admin123` | ADMIN |
| `editor@tienda.local` | `editor123` | EDITOR |
| `viewer@tienda.local` | `viewer123` | VIEWER |

---

## 📋 Modelos de BD

### User
```typescript
- id (string, PK)
- email (string, unique)
- password (string, hasheada)
- role (ADMIN | EDITOR | VIEWER)
- isActive (boolean)
- profile (Relación con Profile)
- createdAt, updatedAt
```

### Profile
```typescript
- id (string, PK)
- firstName, lastName (string)
- phone, bio, avatar (opcional)
- userId (FK)
- createdAt, updatedAt
```

### Menu
```typescript
- id (string, PK)
- name (string)
- slug (string, unique)
- isActive (boolean)
- items (Relación con MenuItem[])
- createdAt, updatedAt
```

### MenuItem
```typescript
- id (string, PK)
- label, href (string)
- icon (opcional)
- order (número)
- isActive (boolean)
- menuId (FK)
- createdAt, updatedAt
```

---

## 🔗 Endpoints de API

### Autenticación
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/register` - Registrar nuevo usuario

### Usuarios (requiere auth + ADMIN role)
- `GET /api/users` - Listar todos
- `POST /api/users` - Crear usuario
- `PUT /api/users/[id]` - Actualizar usuario
- `DELETE /api/users/[id]` - Eliminar usuario

### Menús (GET es público, resto requiere auth + ADMIN)
- `GET /api/menus` - Listar menús
- `POST /api/menus` - Crear menú
- `PUT /api/menus/[menuId]` - Actualizar menú
- `DELETE /api/menus/[menuId]` - Eliminar menú

### Items de Menús (requiere auth + ADMIN role)
- `POST /api/menus/[menuId]/items` - Crear item
- `PUT /api/menus/[menuId]/items/[itemId]` - Actualizar item
- `DELETE /api/menus/[menuId]/items/[itemId]` - Eliminar item

---

## 🚀 Flujo de Autenticación

1. Usuario hace login: `POST /api/auth/login`
2. Backend retorna JWT token
3. Cliente guarda token en localStorage
4. Para requests protegidas, enviar: `Authorization: Bearer <token>`
5. Backend valida token y permisos (role)

---

## ⚙️ Configuración

Asegúrate de tener `.env.local` con:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/base_datos"
JWT_SECRET="tu-clave-secreta-aqui"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 🐛 Troubleshooting

**Error: "ECONNREFUSED" en seed**
- PostgreSQL no está corriendo
- Verifica que el servidor esté activo

**Error: "PrismaClientValidationError"**
- El `.env.local` no tiene `DATABASE_URL`
- Asegúrate de que las variables estén cargadas

**Base de datos rota**
- Ejecuta: `npm run db:reset`
- Esto la reconstruye completamente

