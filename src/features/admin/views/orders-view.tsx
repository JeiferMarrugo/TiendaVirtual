import { SaleRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/store-data";

type OrdersViewProps = {
  sales: SaleRecord[];
};

export function OrdersView({ sales }: OrdersViewProps) {
  return (
    <div className="space-y-6 px-5 py-8 sm:px-7">
      <div>
        <p className="text-muted text-xs uppercase tracking-[0.3em]">Pedidos</p>
        <h3 className="section-title mt-2 text-3xl">Historial de compras</h3>
      </div>

      {sales.length ? (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="overflow-hidden rounded-3xl border border-line bg-card-strong p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{sale.customerName}</p>
                  <p className="text-muted mt-1 text-sm">
                    {new Date(sale.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>

                <div className="flex items-baseline gap-4 md:text-right">
                  <div>
                    <p className="text-muted text-xs">Monto</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(sale.total)}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Items</p>
                    <p className="mt-1 text-xl font-semibold">{sale.items.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-muted mb-2 text-xs uppercase tracking-[0.15em]">Detalle de la compra</p>
                <div className="space-y-2">
                  {sale.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-muted">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted rounded-3xl border border-dashed border-line bg-card-strong p-8 text-center text-sm leading-7">
          Aun no hay pedidos registrados. Los pedidos de la tienda visual aparecerán aqui automaticamente.
        </div>
      )}
    </div>
  );
}
