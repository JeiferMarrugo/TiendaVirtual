import { SaleRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/store-data";

type AdminSalesListProps = {
  sales: SaleRecord[];
};

export function AdminSalesList({ sales }: AdminSalesListProps) {
  return (
    <section id="pedidos" className="scroll-mt-28 border-t border-line pt-8">
      <p className="text-muted text-xs uppercase tracking-[0.3em]">Pedidos</p>
      <h3 className="section-title mt-2 text-3xl">Ultimas ventas</h3>

      {sales.length ? (
        <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-card-strong">
          {sales.slice(0, 8).map((sale) => (
            <div
              key={sale.id}
              className="grid gap-3 border-b border-line px-4 py-4 last:border-b-0 md:grid-cols-[1.1fr_0.55fr_1.3fr] md:items-center"
            >
              <div>
                <p className="font-semibold text-foreground">{sale.customerName}</p>
                <p className="text-muted mt-1 text-sm">{new Date(sale.createdAt).toLocaleString("es-ES")}</p>
              </div>
              <p className="font-semibold md:text-right">{formatCurrency(sale.total)}</p>
              <p className="text-muted text-sm leading-7">
                {sale.items.map((item) => `${item.quantity}x ${item.name}`).join(" • ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted mt-5 rounded-3xl border border-dashed border-line bg-card-strong p-5 text-sm leading-7">
          Aun no hay ventas registradas. Realiza compras desde la tienda visual para poblar este panel.
        </div>
      )}
    </section>
  );
}
