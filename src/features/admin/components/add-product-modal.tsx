"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Product, ProductImage } from "@/lib/store-data";

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (product: Product) => void;
};

type FormData = {
  name: string;
  category: string;
  price: string;
  description: string;
  badge: string;
  discountPercentage: string;
  isMarkedNew: boolean;
  images: ProductImage[];
};

export function AddProductModal({ isOpen, onClose, onCreate }: AddProductModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "Mobiliario",
    price: "",
    description: "",
    badge: "Nuevo",
    discountPercentage: "0",
    isMarkedNew: true,
    images: [],
  });

  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    setFormData((prev) => ({ ...prev, [name]: name === "isMarkedNew" ? checked : value }));
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.images.length >= 5) {
      setImageError("Máximo 5 imágenes por producto");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Solo se permiten archivos de imagen");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newImage = {
        id: `img-${Date.now()}`,
        url,
        alt: `Imagen ${formData.images.length + 1} de ${formData.name || "producto"}`,
      };

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
      setImageError("");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Ingresa el nombre del producto");
      return;
    }
    if (!formData.price.trim()) {
      toast.error("Ingresa el precio del producto");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("Agregue al menos una imagen");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[AddProduct] Iniciando submit. Imagenes a subir:", formData.images.length);
      const uploadedImages = await Promise.all(
        formData.images.map(async (image, index) => {
          console.log(`[AddProduct] Subiendo imagen ${index + 1}/${formData.images.length}...`);
          const uploadRes = await fetch("/api/uploads/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dataUrl: image.url,
              fileName: `${formData.name}-${index + 1}`,
            }),
          });

          const uploadJson = await uploadRes.json();
          console.log(`[AddProduct] Respuesta upload imagen ${index + 1}:`, { ok: uploadRes.ok, status: uploadRes.status, body: uploadJson });
          if (!uploadRes.ok || !uploadJson.ok) {
            throw new Error(uploadJson?.message || "Error subiendo imagen");
          }

          return {
            url: uploadJson.url as string,
            alt: image.alt,
          };
        }),
      );

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          price: Number(formData.price),
          rating: 4.8,
          description:
            formData.description.trim() || "Producto nuevo agregado desde el panel administrativo.",
          accent: "linear-gradient(135deg, #e6f7fb 0%, #0e7490 100%)",
          badge: formData.badge.trim() || "Nuevo",
          discountPercentage: Math.min(Math.max(Number(formData.discountPercentage) || 0, 0), 90),
          isMarkedNew: formData.isMarkedNew,
          images: uploadedImages,
        }),
      });

      const productJson = await productRes.json();
      console.log("[AddProduct] Respuesta POST /api/products:", { ok: productRes.ok, status: productRes.status, body: productJson });
      if (!productRes.ok || !productJson.ok) {
        console.error("[AddProduct] Error al crear producto:", productJson);
        throw new Error(productJson?.message || "No se pudo crear el producto");
      }

      const createdProduct: Product = productJson.data;
      toast.success(`Producto "${formData.name}" creado y guardado en PostgreSQL.`);
      onCreate(createdProduct);

      setFormData({
        name: "",
        category: "Mobiliario",
        price: "",
        description: "",
        badge: "Nuevo",
        discountPercentage: "0",
        isMarkedNew: true,
        images: [],
      });

      setTimeout(() => {
        onClose();
      }, 400);
    } catch (error) {
      console.error("[AddProduct] ERROR en submit:", error);
      const message = error instanceof Error ? error.message : "Error inesperado";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
            className="admin-text w-full max-w-3xl rounded-[2rem] border border-line bg-card-strong/95 max-h-[90vh] overflow-y-auto shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-[linear-gradient(125deg,rgba(14,116,144,0.16),rgba(14,116,144,0.05))] px-6 py-4 z-10">
          <div>
            <p className="admin-label text-[10px] uppercase tracking-[0.28em] text-muted">Catalogo</p>
            <h2 className="admin-title text-2xl">Agregar nuevo producto</h2>
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
          {/* Product Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Sillon Moderno"
                className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Mobiliario</option>
                  <option>Iluminacion</option>
                  <option>Decoracion</option>
                  <option>Textiles</option>
                  <option>Bienestar</option>
                  <option>Accesorios</option>
                </select>
              </div>

              <div>
                <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ej: 299"
                  className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                Distintivo
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                placeholder="Ej: Nuevo, Top, Premium"
                className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  min={0}
                  max={90}
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="Ej: 15"
                  className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="admin-input inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="isMarkedNew"
                    checked={formData.isMarkedNew}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-accent"
                  />
                  Marcar como nuevo (se retira automaticamente en 10 dias)
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="admin-label text-xs uppercase tracking-[0.3em] text-foreground">
                Descripcion
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe las características del producto..."
                className="admin-input mt-2 w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t border-line pt-6">
            <p className="admin-label text-xs uppercase tracking-[0.3em] text-foreground mb-3">
              Imagenes del producto {formData.images.length}/5
            </p>

            {/* Upload Area */}
            <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-background p-6 cursor-pointer transition hover:border-accent hover:bg-accent-soft/40">
              <Upload size={20} className="text-muted" />
              <div>
                <p className="admin-label text-sm text-foreground">Cargar imagen</p>
                <p className="text-xs text-muted">PNG, JPG, GIF (máx. 5)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAddImage}
                className="hidden"
              />
            </label>

            {imageError && (
              <p className="mt-2 text-xs text-red-500 font-semibold">{imageError}</p>
            )}

            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {formData.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative rounded-2xl border border-line overflow-hidden bg-background"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-line pt-6">
            <button
              onClick={onClose}
              className="admin-button flex-1 rounded-full border border-line bg-background px-4 py-2.5 text-sm text-foreground transition hover:bg-card-strong"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="admin-button flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus size={16} />
                {isSubmitting ? "Guardando..." : "Crear producto"}
              </span>
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
