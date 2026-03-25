export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  images: ProductImage[];
  accent: string;
  badge: string;
  createdAt?: string;
  isMarkedNew?: boolean;
  discountPercentage?: number;
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const NEW_PRODUCT_WINDOW_DAYS = 10;

export function isProductNew(product: Product, referenceDate: Date = new Date()) {
  if (!product.isMarkedNew || !product.createdAt) {
    return false;
  }

  const createdAt = new Date(product.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const elapsedMs = referenceDate.getTime() - createdAt.getTime();
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  return elapsedDays <= NEW_PRODUCT_WINDOW_DAYS;
}

export function getDiscountedPrice(product: Product) {
  const percentage = Math.min(Math.max(product.discountPercentage ?? 0, 0), 90);
  if (!percentage) {
    return product.price;
  }

  return Math.round(product.price * (1 - percentage / 100));
}

export function getDisplayBadge(product: Product) {
  return isProductNew(product) ? "Nuevo" : product.badge;
}
