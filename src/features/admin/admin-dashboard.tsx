"use client";

import clsx from "clsx";
import { toast } from "sonner";
import { buildSidebarFromMenus, sidebarGroups, SidebarItem } from "@/features/admin/config/sidebar";
import { AdminAccessRequired } from "@/features/admin/components/admin-access-required";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { useAdminSync } from "@/features/admin/hooks/use-admin-sync";
import { DashboardView } from "@/features/admin/views/dashboard-view";
import { ProductsView } from "@/features/admin/views/products-view";
import { OrdersView } from "@/features/admin/views/orders-view";
import { UsersView } from "@/features/admin/views/users-view";
import { MenusView } from "@/features/admin/views/menus-view";
import { GeneralSettingsView } from "@/features/admin/views/general-settings-view";
import { updateSession } from "@/lib/storage";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminMenuApi = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon?: string | null;
    isActive?: boolean;
  }>;
};

export function AdminDashboardFeature() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(sidebarGroups);
  const { session, sales, lastSync, metrics, setSession, refreshData } = useAdminSync();

  const loadSidebarFromDb = useCallback(async () => {
    try {
      const response = await fetch("/api/menus", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok || !Array.isArray(data.menus)) {
        return;
      }

      const built = buildSidebarFromMenus(data.menus as AdminMenuApi[]);
      if (built.length) {
        setSidebarItems(built);
      }
    } catch {
      // Keep static fallback sidebar if DB menus are unavailable.
    }
  }, []);

  useEffect(() => {
    void loadSidebarFromDb();

    const handleMenusUpdated = () => {
      void loadSidebarFromDb();
    };

    window.addEventListener("tv:admin-menus-updated", handleMenusUpdated);
    return () => {
      window.removeEventListener("tv:admin-menus-updated", handleMenusUpdated);
    };
  }, [loadSidebarFromDb]);

  function toggleAdminSession() {
    if (session.adminLoggedIn) {
      const nextSession = {
        ...session,
        adminLoggedIn: false,
        adminName: "Admin Principal",
        adminRole: null,
        adminToken: null,
      };

      setSession(nextSession);
      updateSession(nextSession);
      toast.success("Sesión admin cerrada.");
      return;
    }

    router.push("/admin/login");
  }

  function manualRefresh() {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          refreshData();
          resolve();
        }, 900);
      }),
      {
        loading: "Sincronizando con la tienda...",
        success: "Panel actualizado correctamente.",
        error: "Error al sincronizar los datos.",
      },
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-4 sm:px-6 lg:px-8">
      <div
        className={clsx(
          "grid min-h-[calc(100vh-2rem)] gap-4 transition-all duration-300",
          isSidebarOpen ? "lg:grid-cols-[290px_1fr]" : "lg:grid-cols-[86px_1fr]",
        )}
      >
        <AdminSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((value) => !value)}
          groups={sidebarItems}
          activeView={activeView}
          onSelectView={setActiveView}
        />

        <section className="glass-panel overflow-hidden rounded-[32px] border border-line/70">
          <AdminHeader
            session={session}
            lastSync={lastSync}
            onRefresh={manualRefresh}
            onToggleSession={toggleAdminSession}
          />

          {session.adminLoggedIn ? (
            <div className="space-y-8">
              {activeView === "dashboard" && <DashboardView metrics={metrics} sales={sales} />}
              {(activeView === "productos" ||
                activeView === "productos-tipos" ||
                activeView === "productos-categorias" ||
                activeView === "productos-listado") && <ProductsView activeView={activeView} />}
              {activeView === "pedidos" && <OrdersView sales={sales} />}
              {(activeView === "usuarios" || activeView === "usuarios-listado") && (
                <UsersView token={session.adminToken} />
              )}
              {(activeView === "menus" || activeView === "menus-listado") && (
                <MenusView token={session.adminToken} />
              )}
              {(activeView === "configuracion-general" || activeView === "configuracion") && (
                <GeneralSettingsView token={session.adminToken} />
              )}
            </div>
          ) : (
            <AdminAccessRequired onLogin={toggleAdminSession} />
          )}

        </section>
      </div>
    </div>
  );
}
