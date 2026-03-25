import { AdminMetricsGrid } from "@/features/admin/components/admin-metrics-grid";
import { AdminSalesChart } from "@/features/admin/components/admin-sales-chart";
import { AdminSalesList } from "@/features/admin/components/admin-sales-list";
import { AdminMetrics } from "@/features/admin/types";
import { SaleRecord } from "@/lib/storage";

type DashboardViewProps = {
  metrics: AdminMetrics;
  sales: SaleRecord[];
};

export function DashboardView({ metrics, sales }: DashboardViewProps) {
  return (
    <div className="space-y-8 px-5 py-8 sm:px-7">
      <AdminMetricsGrid metrics={metrics} />
      <AdminSalesChart metrics={metrics} />
      <AdminSalesList sales={sales} />
    </div>
  );
}
