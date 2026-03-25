"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  LogIn,
  LogOut,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductShowcaseModal } from "@/components/product-showcase-modal";
import {
  Product,
  formatCurrency,
  getDiscountedPrice,
  getDisplayBadge,
} from "@/lib/store-data";
import { addSale, CartItem, getDefaultSession, readSession, updateSession } from "@/lib/storage";
import { LoadingOverlay } from "@/components/loading-overlay";

type CartProduct = CartItem & {
  name: string;
  price: number;
};

const heroStats = [
  { label: "Curaduria premium", value: "32 piezas" },
  { label: "Entrega boutique", value: "24 horas" },
  { label: "Clientes felices", value: "98%" },
];

export function StorefrontApp() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [session, setSession] = useState(getDefaultSession());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    setSession(readSession());

    async function loadProductsFromDb() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data = await response.json();

        if (response.ok && data.ok && Array.isArray(data.data)) {
          setProductList(data.data);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProductsFromDb();
  }, []);

  const availableCategories = useMemo(
    () => ["Todos", ...new Set(productList.map((product) => product.category))],
    [productList],
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") {
      return productList;
    }

    return productList.filter((product) => product.category === selectedCategory);
  }, [productList, selectedCategory]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const selectedProduct = useMemo(
    () => productList.find((product) => product.id === selectedProductId) ?? null,
    [productList, selectedProductId],
  );

  function toggleShopperSession() {
    const nextSession = {
      ...session,
      shopperLoggedIn: !session.shopperLoggedIn,
      shopperName: session.shopperLoggedIn ? "Cliente invitado" : "Valentina",
    };

    setSession(nextSession);
    updateSession(nextSession);
    toast.success(
      nextSession.shopperLoggedIn ? "Sesion de cliente iniciada." : "Sesion de cliente cerrada.",
    );
  }

  function addToCart(productId: string) {
    const product = productList.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === productId);

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId,
          quantity: 1,
          name: product.name,
          price: getDiscountedPrice(product),
        },
      ];
    });

    toast.success(`${product.name} agregado al carrito.`);
    setCartOpen(true);
  }

  function updateCartQuantity(productId: string, nextQuantity: number) {
    setCart((currentCart) => {
      if (nextQuantity <= 0) {
        return currentCart.filter((item) => item.productId !== productId);
      }

      return currentCart.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQuantity } : item,
      );
    });
  }

  function checkout() {
    if (!session.shopperLoggedIn) {
      toast.error("Inicia sesion en la tienda antes de finalizar la compra.");
      return;
    }

    if (!cart.length) {
      toast.error("Tu carrito esta vacio.");
      return;
    }

    setIsCheckingOut(true);
    setCartOpen(false);

    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          addSale({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            customerName: session.shopperName,
            total: cartTotal,
            items: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          });
          setCart([]);
          setIsCheckingOut(false);
          resolve();
        }, 1600);
      }),
      {
        loading: "Procesando tu compra...",
        success: "Compra registrada. El panel admin la vera en breve.",
        error: "Error al procesar la compra.",
      },
    );
  }

  return (
    <div className="grain relative overflow-hidden">
      <div className="min-h-screen w-full px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-30 flex items-center justify-between rounded-[28px] px-5 py-4">
          <div>
            <p className="text-muted text-xs uppercase tracking-[0.35em]">
              Tienda Virtual
            </p>
            <Link href="/" className="section-title text-3xl font-semibold text-foreground">
              Maison Canvas
            </Link>
          </div>

          <nav className="text-muted hidden items-center gap-8 text-sm md:flex">
            <a href="#coleccion">Coleccion</a>
            <a href="#ediciones">Ediciones</a>
            <a href="#experiencia">Experiencia</a>
            <Link href="/admin">Admin</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleShopperSession}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card-strong px-4 py-2 text-sm text-foreground transition hover:bg-card"
            >
              {session.shopperLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
              {session.shopperLoggedIn ? "Logout" : "Login"}
            </button>

            <button
              onClick={() => setCartOpen((currentValue) => !currentValue)}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-on-primary transition hover:opacity-90"
            >
              <ShoppingBag size={16} />
              Carrito
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{cartCount}</span>
            </button>
          </div>
        </header>

        <main className="pb-16 pt-6">
          <div className="glass-panel overflow-hidden rounded-[40px]">

            {/* Hero */}
            <section className="grid lg:grid-cols-[1.3fr_0.7fr]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden px-8 py-10 sm:px-10 lg:px-12"
              >
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[rgba(14,116,144,0.12)] blur-3xl" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[rgba(14,116,144,0.07)] blur-3xl" />

                <span className="text-muted inline-flex items-center gap-2 rounded-full bg-card-strong px-4 py-2 text-xs uppercase tracking-[0.25em]">
                  <Sparkles size={14} />
                  Escaparate Premium
                </span>

                <h1 className="section-title mt-6 max-w-3xl text-5xl leading-none text-foreground sm:text-6xl lg:text-7xl">
                  Piezas de diseno para una tienda visual sobria y elegante.
                </h1>

                <p className="text-muted mt-6 max-w-2xl text-base leading-8 sm:text-lg">
                  Coleccion curada con acabados refinados, tonos tierra equilibrados y una experiencia de compra que prioriza detalle, calma y conversion.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#coleccion"
                    className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-soft"
                  >
                    Ver productos
                    <ArrowRight size={16} />
                  </a>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-card-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card"
                  >
                    Abrir panel admin
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-8 border-t border-line pt-6">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-muted text-xs uppercase tracking-[0.25em]">{stat.label}</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-t border-line px-7 py-8 lg:border-l lg:border-t-0"
              >
                <p className="text-muted text-xs uppercase tracking-[0.3em]">Cliente</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-muted text-sm">Sesion actual</p>
                    <h2 className="mt-1 text-2xl font-semibold">{session.shopperName}</h2>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {session.shopperLoggedIn ? "Activa" : "Invitado"}
                  </span>
                </div>

                <div className="mt-6 space-y-3 border-t border-line pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm">Carrito</span>
                    <span className="font-semibold">{cartCount} items</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <span className="text-muted text-sm">Total estimado</span>
                    <span className="font-semibold">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <p className="text-muted mt-5 border-t border-dashed border-line pt-4 text-xs leading-6">
                  Las ventas realizadas aqui quedan guardadas en el navegador y alimentan el panel administrativo automaticamente.
                </p>
              </motion.div>
            </section>

            {/* Catalogo */}
            <section id="coleccion" className="scroll-mt-28 border-t border-line px-8 py-8 sm:px-10 lg:px-12">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-muted text-xs uppercase tracking-[0.35em]">Coleccion</p>
                  <h2 className="section-title mt-2 text-4xl sm:text-5xl">Productos con presencia premium</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        "rounded-full px-4 py-2 text-sm transition",
                        selectedCategory === category
                          ? "bg-foreground [color:var(--on-primary)]"
                          : "border border-line bg-card-strong text-foreground hover:bg-card",
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {isLoadingProducts
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-line bg-card-strong">
                        <div className="h-52 bg-card" />
                        <div className="p-4 space-y-3">
                          <div className="h-3 w-16 rounded-full bg-card" />
                          <div className="h-4 w-32 rounded-full bg-card" />
                          <div className="h-3 w-full rounded-full bg-card" />
                          <div className="h-8 w-full rounded-full bg-card" />
                        </div>
                      </div>
                    ))
                  : filteredProducts.map((product, index) => (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="overflow-hidden rounded-3xl border border-line bg-card-strong"
                  >
                    <div className="relative h-52 overflow-hidden" style={{ background: product.accent }}>
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt ?? product.name}
                        className="h-full w-full object-cover mix-blend-multiply opacity-90 transition duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.2em]">
                          {getDisplayBadge(product)}
                        </span>
                        <span className="text-muted inline-flex items-center gap-1 text-sm">
                          <Star size={13} className="fill-current" />
                          {product.rating}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-muted text-xs">{product.category}</p>
                        <h3 className="mt-1 text-xl font-semibold">{product.name}</h3>
                        <p className="text-muted mt-2 min-h-12 text-sm leading-6">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                        <div>
                          {(product.discountPercentage ?? 0) > 0 && (
                            <p className="text-muted text-xs line-through">{formatCurrency(product.price)}</p>
                          )}
                          <p className="text-lg font-semibold">{formatCurrency(getDiscountedPrice(product))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedProductId(product.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
                          >
                            Ver detalle
                          </button>
                          <button
                            onClick={() => addToCart(product.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-soft"
                          >
                            <Plus size={15} />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>

            {/* Experiencia */}
            <section id="experiencia" className="scroll-mt-28 border-t border-line">
              <div className="grid divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                {[
                  "Ambientacion cuidada para una estetica sofisticada.",
                  "Carrito y compra con feedback inmediato mediante popups.",
                  "Sincronizacion con panel admin para monitoreo comercial.",
                ].map((message) => (
                  <div key={message} className="flex items-start gap-4 px-8 py-6 sm:px-10">
                    <span className="inline-flex shrink-0 rounded-xl bg-accent-soft p-2.5 text-accent">
                      <BadgeCheck size={18} />
                    </span>
                    <p className="text-sm leading-7 text-foreground">{message}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      <aside
        className={clsx(
          "fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-line bg-card/95 p-5 shadow-2xl backdrop-blur-xl transition-transform duration-300",
          cartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-xs uppercase tracking-[0.3em]">Carrito</p>
            <h2 className="section-title mt-1 text-4xl">Tu seleccion</h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-full border border-line px-4 py-2 text-sm"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.productId} className="rounded-3xl border border-line bg-card-strong p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-muted mt-1 text-sm">{formatCurrency(item.price)}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                    x{item.quantity}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="rounded-full border border-line p-2"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="rounded-full border border-line p-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted rounded-3xl border border-dashed border-line bg-card-strong p-6 text-sm leading-7">
              Aun no has agregado productos. Explora la coleccion y selecciona tus piezas favoritas.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[28px] bg-primary p-5 text-on-primary">
          <div className="flex items-center justify-between text-sm text-on-primary/70">
            <span>Total</span>
            <span>{cartCount} items</span>
          </div>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(cartTotal)}</p>
          <button
            onClick={checkout}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-card-strong px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-90"
          >
            Finalizar compra
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>

      <LoadingOverlay visible={isCheckingOut} message="Procesando tu compra..." />
      <ProductShowcaseModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}