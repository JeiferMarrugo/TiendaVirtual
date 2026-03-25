import { LayoutDashboard, Package, ShoppingCart, Tag, Boxes, ListPlus } from "lucide-react";

export type SidebarItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: SidebarItem[];
};

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
];
