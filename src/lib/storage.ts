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
  shopperRole: string | null;
  shopperToken: string | null;
  adminLoggedIn: boolean;
  adminName: string;
  adminRole: string | null;
  adminToken: string | null;
};

const SALES_KEY = "tienda-virtual-sales-v1";
const SESSION_KEY = "tienda-virtual-session-v1";

const defaultSession: SessionState = {
  shopperLoggedIn: false,
  shopperName: "Cliente invitado",
  shopperRole: null,
  shopperToken: null,
  adminLoggedIn: false,
  adminName: "Admin Principal",
  adminRole: null,
  adminToken: null,
};

function normalizeSession(session: Partial<SessionState> | null | undefined): SessionState {
  return {
    shopperLoggedIn: !!session?.shopperLoggedIn,
    shopperName: session?.shopperName || defaultSession.shopperName,
    shopperRole: session?.shopperRole ?? null,
    shopperToken: session?.shopperToken ?? null,
    adminLoggedIn: !!session?.adminLoggedIn,
    adminName: session?.adminName || defaultSession.adminName,
    adminRole: session?.adminRole ?? null,
    adminToken: session?.adminToken ?? null,
  };
}

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
  const raw = readJson<Partial<SessionState>>(SESSION_KEY, defaultSession);
  return normalizeSession(raw);
}

export function updateSession(nextSession: SessionState) {
  writeJson(SESSION_KEY, nextSession, "tv:session-updated");
}

export function getDefaultSession() {
  return defaultSession;
}