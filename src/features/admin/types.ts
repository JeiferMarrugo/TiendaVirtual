export type AdminMetrics = {
  revenue: number;
  totalOrders: number;
  averageTicket: number;
  topProduct: string;
  chartData: Array<{
    label: string;
    total: number;
  }>;
};
