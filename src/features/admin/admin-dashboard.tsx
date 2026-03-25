"use client";

import clsx from "clsx";
import { toast } from "sonner";
import { sidebarGroups } from "@/features/admin/config/sidebar";
import { AdminAccessRequired } from "@/features/admin/components/admin-access-required";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { useAdminSync } from "@/features/admin/hooks/use-admin-sync";
import { DashboardView } from "@/features/admin/views/dashboard-view";
import { ProductsView } from "@/features/admin/views/products-view";
import { OrdersView } from "@/features/admin/views/orders-view";
import { updateSession } from "@/lib/storage";
import { useState } from "react";

export function AdminDashboardFeature() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const { session, sales, lastSync, metrics, setSession, refreshData } = useAdminSync();

  function toggleAdminSession() {
    const nextSession = {
      ...session,
      adminLoggedIn: !session.adminLoggedIn,
      adminName: session.adminLoggedIn ? "Admin Principal" : "Sofia Admin",
    };

    setSession(nextSession);
    updateSession(nextSession);
    toast.success(nextSession.adminLoggedIn ? "Sesion admin iniciada." : "Sesion admin cerrada.");
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
          groups={sidebarGroups}
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
            </div>
          ) : (
            <AdminAccessRequired onLogin={toggleAdminSession} />
          )}
        </section>
      </div>
    </div>
  );
}
