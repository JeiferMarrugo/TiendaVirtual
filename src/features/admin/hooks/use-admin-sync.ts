"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getDefaultSession, readSales, readSession, SaleRecord, SessionState } from "@/lib/storage";
import { AdminMetrics } from "@/features/admin/types";

export function useAdminSync() {
  const [session, setSession] = useState<SessionState>(getDefaultSession());
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [lastSync, setLastSync] = useState("");

  const refreshData = () => {
    setSession(readSession());
    setSales(readSales());
    setLastSync(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => {
    refreshData();

    const intervalId = window.setInterval(() => {
      refreshData();
      toast.info("Panel administrativo sincronizado con las ventas de la tienda.");
    }, 60000);

    window.addEventListener("tv:sales-updated", refreshData);
    window.addEventListener("tv:session-updated", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("tv:sales-updated", refreshData);
      window.removeEventListener("tv:session-updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const metrics = useMemo<AdminMetrics>(() => {
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const averageTicket = totalOrders ? revenue / totalOrders : 0;

    const productCounts = sales
      .flatMap((sale) => sale.items)
      .reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.name] = (accumulator[item.name] ?? 0) + item.quantity;
        return accumulator;
      }, {});

    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin ventas";

    const chartData = sales
      .slice()
      .reverse()
      .map((sale) => ({
        label: new Date(sale.createdAt).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
        total: sale.total,
      }));

    return {
      revenue,
      totalOrders,
      averageTicket,
      topProduct,
      chartData,
    };
  }, [sales]);

  return {
    session,
    sales,
    lastSync,
    metrics,
    setSession,
    refreshData,
  };
}
