import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminMetrics } from "@/features/admin/types";

type AdminSalesChartProps = {
  metrics: AdminMetrics;
};

export function AdminSalesChart({ metrics }: AdminSalesChartProps) {
  return (
    <section id="tendencia" className="scroll-mt-28 border-t border-line pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.3em]">Tendencia</p>
          <h3 className="section-title mt-2 text-3xl">Comportamiento reciente</h3>
        </div>
        <span className="rounded-full border border-line bg-card-strong px-3 py-1 text-xs text-primary">
          Auto refresh 60s
        </span>
      </div>

      <div className="mt-5 h-80 rounded-3xl border border-line bg-card-strong p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metrics.chartData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e7490" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0e7490" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(17, 17, 17, 0.1)" vertical={false} />
            <XAxis dataKey="label" stroke="#858585" tickLine={false} axisLine={false} />
            <YAxis stroke="#858585" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.97)",
                borderRadius: 18,
                border: "1px solid rgba(17, 17, 17, 0.12)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0e7490"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
