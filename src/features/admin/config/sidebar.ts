import { LayoutDashboard, Package, ShoppingCart, Tag, Boxes, ListPlus, Users, MenuSquare, Settings } from "lucide-react";

export type SidebarItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: SidebarItem[];
};

type DbMenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: string | null;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
};

type DbMenu = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  items: DbMenuItem[];
};

const iconByName: Record<string, SidebarItem["icon"]> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Boxes,
  ListPlus,
  Users,
  MenuSquare,
  Settings,
};

const viewAliases: Record<string, string> = {
  dashboard: "dashboard",
  products: "productos",
  product: "productos",
  productos: "productos",
  orders: "pedidos",
  pedidos: "pedidos",
  users: "usuarios",
  usuarios: "usuarios",
  menus: "menus",
  menu: "menus",
  "products-types": "productos-tipos",
  "products-categories": "productos-categorias",
  "products-list": "productos-listado",
  "users-list": "usuarios-listado",
  "menus-list": "menus-listado",
  configuracion: "configuracion-general",
  configuration: "configuracion-general",
  settings: "configuracion-general",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseViewIdFromHref(href: string, label: string) {
  if (href === "/admin") {
    return "dashboard";
  }

  if (href.includes("view=")) {
    const raw = href.split("view=")[1]?.split("&")[0] || "";
    const normalized = raw.toLowerCase();
    return viewAliases[normalized] || normalized;
  }

  const fromLabel = slugify(label);
  return viewAliases[fromLabel] || fromLabel;
}

export function buildSidebarFromMenus(menus: DbMenu[]): SidebarItem[] {
  const mainMenu = menus.find((menu) => menu.slug === "main-admin" && menu.isActive);

  if (!mainMenu) {
    return sidebarGroups;
  }

  const activeItems = (mainMenu.items || []).filter((item) => item.isActive !== false);
  if (!activeItems.length) {
    return sidebarGroups;
  }

  const topLevelItems = activeItems
    .filter((item) => !item.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const childrenByParent = new Map<string, DbMenuItem[]>();
  for (const item of activeItems) {
    if (!item.parentId) continue;
    const siblings = childrenByParent.get(item.parentId) || [];
    siblings.push(item);
    childrenByParent.set(item.parentId, siblings);
  }

  for (const [parentId, children] of childrenByParent.entries()) {
    childrenByParent.set(
      parentId,
      children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    );
  }

  const resolved = topLevelItems.map((item) => {
    const viewId = parseViewIdFromHref(item.href, item.label);
    const children = (childrenByParent.get(item.id) || []).map((child) => ({
      id: parseViewIdFromHref(child.href, child.label),
      title: child.label,
      description: `Submenú de ${item.label.toLowerCase()}.`,
      icon: iconByName[child.icon || ""] || iconByName[item.icon || ""] || MenuSquare,
    }));

    return {
      id: viewId,
      title: item.label,
      description: `Configuración de ${item.label.toLowerCase()}.`,
      icon: iconByName[item.icon || ""] || MenuSquare,
      children,
    };
  });

  const normalized: SidebarItem[] = resolved.map((item) => {
    if (!item.children?.length) {
      return { ...item, children: undefined };
    }
    return item;
  });

  if (!normalized.some((item) => item.id === "configuracion-general")) {
    normalized.push({
      id: "configuracion-general",
      title: "Configuración",
      description: "Datos de empresa y branding.",
      icon: Settings,
    });
  }

  return normalized;
}

export const sidebarGroups: SidebarItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Resumen y metricas.",
    icon: LayoutDashboard,
  },
  {
    id: "productos",
    title: "Productos",
    description: "Gestionar catalogo.",
    icon: Package,
    children: [
      {
        id: "productos-tipos",
        title: "Crear tipo de producto",
        description: "Definir nuevos tipos.",
        icon: Boxes,
      },
      {
        id: "productos-categorias",
        title: "Categorias",
        description: "Organizar colecciones.",
        icon: Tag,
      },
      {
        id: "productos-listado",
        title: "Listado completo",
        description: "Todos los productos.",
        icon: ListPlus,
      },
    ],
  },
  {
    id: "pedidos",
    title: "Pedidos",
    description: "Historial de ventas.",
    icon: ShoppingCart,
  },
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Gestión de cuentas y perfiles.",
    icon: Users,
    children: [
      {
        id: "usuarios-listado",
        title: "Listado de usuarios",
        description: "Crear y editar perfiles.",
        icon: Users,
      },
    ],
  },
  {
    id: "menus",
    title: "Menús",
    description: "Menús dinámicos del panel.",
    icon: MenuSquare,
    children: [
      {
        id: "menus-listado",
        title: "Administrador de menús",
        description: "Crear y gestionar menús.",
        icon: MenuSquare,
      },
    ],
  },
  {
    id: "configuracion-general",
    title: "Configuración",
    description: "Datos de empresa y branding.",
    icon: Settings,
  },
];
