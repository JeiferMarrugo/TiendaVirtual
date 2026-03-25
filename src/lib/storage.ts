export type CartItem = {
  productId: string;
  quantity: number;
};

export type SaleRecord = {
  id: string;
  createdAt: string;
  customerName: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};

export type SessionState = {
  shopperLoggedIn: boolean;
  shopperName: string;
  adminLoggedIn: boolean;
  adminName: string;
};

const SALES_KEY = "tienda-virtual-sales-v1";
const SESSION_KEY = "tienda-virtual-session-v1";

const defaultSession: SessionState = {
  shopperLoggedIn: false,
  shopperName: "Cliente invitado",
  adminLoggedIn: false,
  adminName: "Admin Principal",
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown, eventName: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}

export function readSales() {
  return readJson<SaleRecord[]>(SALES_KEY, []);
}

export function addSale(record: SaleRecord) {
  const currentSales = readSales();
  writeJson(SALES_KEY, [record, ...currentSales], "tv:sales-updated");
}

export function readSession() {
  return readJson<SessionState>(SESSION_KEY, defaultSession);
}

export function updateSession(nextSession: SessionState) {
  writeJson(SESSION_KEY, nextSession, "tv:session-updated");
}

export function getDefaultSession() {
  return defaultSession;
}