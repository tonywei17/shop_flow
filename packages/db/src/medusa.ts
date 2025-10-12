type MedusaRequestInit = RequestInit & {
  auth?: "admin" | "none";
};

export type MedusaProductVariantPrice = {
  amount: number;
  currency_code: string;
};

export type MedusaProductVariantInput = {
  title: string;
  sku?: string | null;
  manage_inventory?: boolean;
  inventory_quantity?: number;
  prices: MedusaProductVariantPrice[];
};

export type MedusaProductCreateInput = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  handle?: string | null;
  status?: "draft" | "proposed" | "published";
  metadata?: Record<string, unknown> | null;
  variants: MedusaProductVariantInput[];
};

const BASE_URL = process.env.MEDUSA_BASE_URL || "http://localhost:9000";
const ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN;

async function medusaRequest<T>(path: string, init: MedusaRequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if ((init.auth ?? "none") === "admin") {
    if (!ADMIN_TOKEN) {
      throw new Error("MEDUSA_ADMIN_TOKEN is not configured");
    }
    headers.authorization = `Bearer ${ADMIN_TOKEN}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Medusa request failed: ${response.status} ${response.statusText} - ${body}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function createMedusaProduct(payload: MedusaProductCreateInput) {
  return medusaRequest<{ product: { id: string } }>(`/admin/products`, {
    method: "POST",
    body: JSON.stringify(payload),
    auth: "admin",
  });
}
