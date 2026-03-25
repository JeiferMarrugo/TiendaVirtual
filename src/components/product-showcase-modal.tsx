"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, formatCurrency, getDiscountedPrice, getDisplayBadge } from "@/lib/store-data";

type ProductShowcaseModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
};

export function ProductShowcaseModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductShowcaseModalProps) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setImageIndex(0);
    }
  }, [isOpen, product?.id]);

  if (!product) return null;

  const currentProduct = product;
  const hasManyImages = currentProduct.images.length > 1;
  const currentImage = currentProduct.images[imageIndex];
  const discountedPrice = getDiscountedPrice(currentProduct);
  const hasDiscount = (currentProduct.discountPercentage ?? 0) > 0;

  function nextImage() {
    setImageIndex((prev) => (prev + 1) % currentProduct.images.length);
  }

  function prevImage() {
    setImageIndex((prev) => (prev - 1 + currentProduct.images.length) % currentProduct.images.length);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-card-strong shadow-[0_35px_120px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
          >
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-line lg:border-b-0 lg:border-r">
                <div className="relative aspect-square bg-background/70">
                  <motion.img
                    key={currentImage.id}
                    src={currentImage.url}
                    alt={currentImage.alt}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0.45, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    loading="eager"
                  />

                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/35 p-2 text-white transition hover:bg-black/60"
                  >
                    <X size={18} />
                  </button>

                  {hasManyImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white transition hover:bg-black/60"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white transition hover:bg-black/60"
                      >
                        <ChevronRight size={18} />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                        {imageIndex + 1} / {currentProduct.images.length}
                      </div>
                    </>
                  )}
                </div>

                {hasManyImages && (
                  <div className="flex flex-wrap gap-2 border-t border-line p-4">
                    {currentProduct.images.map((image, idx) => (
                      <button
                        key={image.id}
                        onClick={() => setImageIndex(idx)}
                        className={`h-16 w-16 overflow-hidden rounded-xl border transition ${
                          imageIndex === idx ? "border-accent" : "border-line hover:border-accent/70"
                        }`}
                      >
                        <img src={image.url} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-7">
                <motion.div
                  className="space-y-5"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
                  }}
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="flex items-center justify-between"
                  >
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      {getDisplayBadge(currentProduct)}
                    </span>
                    <span className="text-muted inline-flex items-center gap-1 text-sm">
                      <Star size={14} className="fill-current" />
                      {currentProduct.rating}
                    </span>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                    <p className="text-muted text-xs uppercase tracking-[0.26em]">{currentProduct.category}</p>
                    <h3 className="mt-2 text-3xl font-bold text-foreground">{currentProduct.name}</h3>
                  </motion.div>

                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="text-muted leading-8"
                  >
                    {currentProduct.description}
                  </motion.p>

                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="rounded-2xl border border-line bg-background/70 p-4"
                  >
                    <p className="text-muted text-xs uppercase tracking-[0.2em]">Incluye</p>
                    <ul className="mt-3 space-y-2 text-sm text-foreground">
                      <li>Galeria de {currentProduct.images.length} imagenes del producto</li>
                      <li>Descripcion completa y acabados premium</li>
                      <li>Entrega boutique y seguimiento de pedido</li>
                    </ul>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-6 border-t border-line pt-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted text-sm">Precio final</p>
                    <div className="text-right">
                      {hasDiscount && (
                        <p className="text-muted text-xs line-through">{formatCurrency(currentProduct.price)}</p>
                      )}
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(discountedPrice)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(currentProduct.id);
                      onClose();
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-soft"
                  >
                    <Plus size={16} />
                    Agregar al carrito
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
