"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Pencil, Save, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Product, ProductImage, formatCurrency, getDiscountedPrice, isProductNew } from "@/lib/store-data";

type ProductDetailModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
};

export function ProductDetailModal({ product, isOpen, onClose, onSave }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Product | null>(null);

  useEffect(() => {
    if (!product) return;
    setDraft(product);
    setCurrentImageIndex(0);
    setIsEditing(false);
  }, [product]);

  if (!product || !draft) return null;

  const currentImage = draft.images[currentImageIndex];
  const hasMultipleImages = draft.images.length > 1;
  const discountedPrice = getDiscountedPrice(draft);
  const hasDiscount = (draft.discountPercentage ?? 0) > 0;
  const stillNew = isProductNew(draft);
  const createdAtDate = draft.createdAt ? new Date(draft.createdAt) : new Date();
  const elapsedMs = new Date().getTime() - createdAtDate.getTime();
  const canToggleNew = elapsedMs <= 1000 * 60 * 60 * 24 * 10;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % draft.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + draft.images.length) % draft.images.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo puedes subir imagenes.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newImage: ProductImage = {
        id: `img-${Date.now()}`,
        url: String(event.target?.result ?? ""),
        alt: `Imagen ${draft.images.length + 1} de ${draft.name}`,
      };

      setDraft((prev) => {
        if (!prev) return prev;
        return { ...prev, images: [...prev.images, newImage] };
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextImages = prev.images.filter((img) => img.id !== imageId);
      if (currentImageIndex > Math.max(nextImages.length - 1, 0)) {
        setCurrentImageIndex(Math.max(nextImages.length - 1, 0));
      }
      return { ...prev, images: nextImages };
    });
  };

  const saveChanges = () => {
    if (!draft.name.trim()) {
      toast.error("El nombre del producto es obligatorio.");
      return;
    }
    if (!draft.images.length) {
      toast.error("El producto debe tener al menos una imagen.");
      return;
    }

    onSave({
      ...draft,
      price: Number(draft.price) || 0,
      discountPercentage: Math.min(Math.max(Number(draft.discountPercentage ?? 0) || 0, 0), 90),
      isMarkedNew: canToggleNew ? Boolean(draft.isMarkedNew) : false,
    });
    setIsEditing(false);
    toast.success("Producto actualizado correctamente.");
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="admin-text w-full max-w-4xl rounded-[2rem] border border-line bg-card-strong/95 max-h-[90vh] overflow-y-auto shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-[linear-gradient(125deg,rgba(14,116,144,0.16),rgba(14,116,144,0.05))] px-6 py-4 z-10">
          <div>
            <p className="admin-label text-[10px] uppercase tracking-[0.28em] text-muted">Producto</p>
            <h2 className="admin-title text-2xl">{draft.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-background/70 transition"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-line bg-background group">
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="w-full h-full object-cover"
              />

              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <ChevronLeft size={20} className="text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <ChevronRight size={20} className="text-foreground" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                    {currentImageIndex + 1} / {draft.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="flex gap-3 flex-wrap">
                {draft.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {isEditing && (
              <label className="inline-flex items-center gap-2 rounded-full border border-line bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent cursor-pointer">
                <Upload size={14} />
                Agregar imagen
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 border-t border-line pt-6">
            {/* Title & Badge */}
            <div className="flex items-start justify-between">
              <div>
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Informacion del producto</p>
                {isEditing ? (
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                    className="admin-input mt-2 w-full rounded-xl border border-line bg-background px-3 py-2 text-lg text-foreground"
                  />
                ) : (
                  <h3 className="admin-title mt-2 text-2xl">{draft.name}</h3>
                )}
              </div>
              {isEditing ? (
                <input
                  value={draft.badge}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, badge: e.target.value } : prev))}
                  className="admin-input w-28 rounded-full border border-line bg-background px-3 py-1 text-center text-xs text-foreground"
                />
              ) : (
                <span className="inline-flex rounded-full bg-accent-soft px-4 py-1 text-xs font-semibold text-accent">
                  {stillNew ? "Nuevo" : draft.badge}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Descripcion</p>
              {isEditing ? (
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                  rows={3}
                  className="admin-input mt-2 w-full rounded-xl border border-line bg-background px-3 py-2 text-foreground"
                />
              ) : (
                <p className="admin-text mt-2 text-foreground leading-relaxed">{draft.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-background p-4">
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Categoria</p>
                {isEditing ? (
                  <input
                    value={draft.category}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, category: e.target.value } : prev))}
                    className="admin-input mt-2 w-full rounded-lg border border-line bg-card-strong px-2 py-1 text-sm text-foreground"
                  />
                ) : (
                  <p className="admin-text mt-2 text-foreground font-semibold">{draft.category}</p>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-background p-4">
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Precio</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, price: Number(e.target.value) } : prev))}
                    className="admin-input mt-2 w-full rounded-lg border border-line bg-card-strong px-2 py-1 text-sm text-foreground"
                  />
                ) : (
                  <div className="mt-2 space-y-1">
                    {hasDiscount ? (
                      <>
                        <p className="text-muted text-xs line-through">{formatCurrency(draft.price)}</p>
                        <p className="admin-text text-foreground font-semibold">{formatCurrency(discountedPrice)}</p>
                      </>
                    ) : (
                      <p className="admin-text text-foreground font-semibold">{formatCurrency(draft.price)}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-background p-4">
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Rating</p>
                <p className="admin-text mt-2 text-foreground font-semibold">⭐ {draft.rating}</p>
              </div>

              <div className="rounded-2xl border border-line bg-background p-4">
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Descuento</p>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={draft.discountPercentage ?? 0}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev ? { ...prev, discountPercentage: Number(e.target.value) } : prev,
                      )
                    }
                    className="admin-input mt-2 w-full rounded-lg border border-line bg-card-strong px-2 py-1 text-sm text-foreground"
                  />
                ) : (
                  <p className="admin-text mt-2 text-foreground font-semibold">{draft.discountPercentage ?? 0}%</p>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-background p-4 col-span-2 md:col-span-1">
                <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Imagenes</p>
                <p className="admin-text mt-2 text-foreground font-semibold">{draft.images.length}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-background p-4">
              <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted">Estado nuevo</p>
              {isEditing ? (
                <label className="admin-input mt-2 inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.isMarkedNew) && canToggleNew}
                    disabled={!canToggleNew}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev ? { ...prev, isMarkedNew: e.target.checked } : prev,
                      )
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  {canToggleNew
                    ? "Marcar como nuevo"
                    : "La opcion de nuevo expiro (mas de 10 dias)"}
                </label>
              ) : (
                <p className="admin-text mt-2 text-foreground font-semibold">
                  {stillNew ? "Activo" : "No activo"}
                </p>
              )}
            </div>

            {/* Image List */}
            <div>
              <p className="admin-label text-xs uppercase tracking-[0.3em] text-muted mb-3">Galeria de imagenes</p>
              <div className="space-y-2">
                {draft.images.map((image, index) => (
                  <div key={image.id} className="rounded-2xl border border-line bg-background p-3 flex items-center gap-3">
                    <img src={image.url} alt={image.alt} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          value={image.alt}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDraft((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                images: prev.images.map((img) =>
                                  img.id === image.id ? { ...img, alt: value } : img,
                                ),
                              };
                            });
                          }}
                          className="admin-input w-full rounded-md border border-line bg-card-strong px-2 py-1 text-xs text-foreground"
                        />
                      ) : (
                        <p className="admin-text text-xs font-medium text-foreground">{image.alt}</p>
                      )}
                      <p className="text-muted text-xs">Imagen {index + 1}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeImage(image.id)}
                        className="rounded-full border border-line bg-card-strong p-2 text-muted transition hover:border-red-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-line pt-6">
            <button
              onClick={onClose}
              className="admin-button flex-1 rounded-full border border-line bg-background px-4 py-2.5 text-sm text-foreground transition hover:bg-card-strong"
            >
              Cerrar
            </button>
            {isEditing ? (
              <button
                onClick={saveChanges}
                className="admin-button flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <span className="inline-flex items-center gap-2">
                  <Save size={15} />
                  Guardar cambios
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="admin-button flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil size={15} />
                  Editar producto
                </span>
              </button>
            )}
          </div>
        </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
