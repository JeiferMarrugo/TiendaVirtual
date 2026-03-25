import { LayoutDashboard, Package, ShoppingCart, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/store-data";
import { AdminMetrics } from "@/features/admin/types";

type AdminMetricsGridProps = {
  metrics: AdminMetrics;
};

export function AdminMetricsGrid({ metrics }: AdminMetricsGridProps) {
  return (
    <section id="resumen" className="scroll-mt-28">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted text-xs uppercase tracking-[0.3em]">Resumen</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card-strong">
        <div className="grid divide-line md:grid-cols-2 md:divide-x xl:grid-cols-4">
          {[
            {
              label: "Facturacion total",
              value: formatCurrency(metrics.revenue),
              icon: Wallet,
            },
            {
              label: "Pedidos registrados",
              value: `${metrics.totalOrders}`,
              icon: ShoppingCart,
            },
            {
              label: "Ticket promedio",
              value: formatCurrency(metrics.averageTicket),
              icon: LayoutDashboard,
            },
            {
              label: "Producto mas vendido",
              value: metrics.topProduct,
              icon: Package,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.label} className="border-b border-line p-4 md:border-b-0 xl:last:border-r-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-muted text-sm">{item.label}</p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-accent-soft text-accent">
                    <Icon size={16} />
                  </span>
                </div>
                <p className="mt-3 text-xl font-semibold leading-snug text-foreground">{item.value}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
