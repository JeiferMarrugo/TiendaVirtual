"use client";

import { Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, formatCurrency, getDiscountedPrice, isProductNew } from "@/lib/store-data";
import { ProductDetailModal } from "@/features/admin/components/product-detail-modal";
import { AddProductModal } from "@/features/admin/components/add-product-modal";

type ProductsViewProps = {
  activeView: string;
};

export function ProductsView({ activeView }: ProductsViewProps) {
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  const categories = [...new Set(productList.map((p) => p.category))];

  useEffect(() => {
    if (hasLoadedFromDb) return;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data = await response.json();

        if (response.ok && data.ok && Array.isArray(data.data)) {
          setProductList(data.data);
        }
      } finally {
        setHasLoadedFromDb(true);
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [hasLoadedFromDb]);

  const handleCreateProduct = (newProduct: Product) => {
    setProductList((prev) => [newProduct, ...prev]);
  };

  const handleSaveProduct = (updated: Product) => {
    setProductList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedProduct(updated);
  };

  if (activeView === "productos-tipos") {
    return (
      <div className="space-y-6 px-5 py-8 sm:px-7">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.3em]">Catalogo</p>
          <h3 className="admin-title mt-2 text-3xl">Crear tipo de producto</h3>
        </div>

        <div className="max-w-2xl rounded-3xl border border-line bg-card-strong p-6">
          <div className="space-y-4">
            <div>
              <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">Nombre del tipo</label>
              <input
                type="text"
                placeholder="Ej: Mobiliario, Decoracion, Textiles"
                className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">Descripcion</label>
              <textarea
                placeholder="Describe este tipo de producto..."
                className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
              />
            </div>

            <button className="admin-button inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              <Plus size={16} />
              Crear tipo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "productos-categorias") {
    return (
      <div className="space-y-6 px-5 py-8 sm:px-7">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.3em]">Organizacion</p>
          <h3 className="admin-title mt-2 text-3xl">Gestionar categorías</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between rounded-2xl border border-line bg-card-strong p-4">
              <div>
                <p className="admin-text font-semibold text-foreground">{category}</p>
                <p className="text-muted mt-1 text-xs">
                  {productList.filter((p) => p.category === category).length} productos
                </p>
              </div>
              <button className="text-muted transition hover:text-accent">⋮</button>
            </div>
          ))}
        </div>

        <button className="admin-button inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus size={16} />
          Crear categoria
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 py-8 sm:px-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.3em]">Catalogo</p>
          <h3 className="admin-title mt-2 text-3xl">Listado completo de productos</h3>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="admin-button inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          Agregar producto
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong">
              <th className="px-5 py-4 text-left admin-label text-foreground">Producto</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Categoria</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Precio</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Descuento</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Rating</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Estado</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Imagenes</th>
              <th className="px-5 py-4 text-left admin-label text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Cargando productos desde la base de datos...
                  </span>
                </td>
              </tr>
            ) : productList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted text-sm">
                  No hay productos registrados aun. Agrega el primero con el boton de arriba.
                </td>
              </tr>
            ) : (
            productList.map((product) => (
              <tr key={product.id} className="border-b border-line transition hover:bg-card-strong">
                <td className="px-5 py-3">
                  <div>
                    <p className="admin-text font-semibold text-foreground">{product.name}</p>
                    <p className="text-muted text-xs">{product.description}</p>
                  </div>
                </td>
                <td className="px-5 py-3 admin-text text-muted">{product.category}</td>
                <td className="px-5 py-3 admin-text font-semibold">
                  {(product.discountPercentage ?? 0) > 0 ? (
                    <div className="space-y-1">
                      <p className="text-muted text-xs line-through">{formatCurrency(product.price)}</p>
                      <p>{formatCurrency(getDiscountedPrice(product))}</p>
                    </div>
                  ) : (
                    formatCurrency(product.price)
                  )}
                </td>
                <td className="px-5 py-3 admin-text text-muted">{product.discountPercentage ?? 0}%</td>
                <td className="px-5 py-3 admin-text">
                  <span className="inline-flex items-center gap-1 text-muted">
                    ⭐ {product.rating}
                  </span>
                </td>
                <td className="px-5 py-3 admin-text">
                  {isProductNew(product) ? (
                    <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      Nuevo
                    </span>
                  ) : (
                    <span className="text-muted text-xs">{product.badge}</span>
                  )}
                </td>
                <td className="px-5 py-3 admin-text text-muted">
                  {product.images.length} imagen{product.images.length !== 1 ? 'es' : ''}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
                  >
                    <Eye size={14} />
                    Ver
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-text text-muted text-sm leading-7">
        Total de {productList.length} productos en catalogo. Todos disponibles para la compra en tiempo real.
      </div>

      {/* Modales */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onSave={handleSaveProduct}
      />
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
}
