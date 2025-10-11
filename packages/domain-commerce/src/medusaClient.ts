export type MedusaClientOptions = {
  baseUrl?: string;
  adminToken?: string;
};

const DEFAULT_BASE_URL = process.env.MEDUSA_BASE_URL || "http://localhost:9000";
const DEFAULT_ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN;

export function createMedusaClient(options: MedusaClientOptions = {}) {
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const adminToken = options.adminToken || DEFAULT_ADMIN_TOKEN;

  async function request(
    path: string,
    init: RequestInit = {},
    auth: "none" | "admin" = "none"
  ) {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };
    if (auth === "admin" && adminToken) {
      headers["authorization"] = `Bearer ${adminToken}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Medusa ${res.status} ${path}`);
    }
    if (res.status === 204) return null as any;
    return res.json();
  }

  return {
    listStoreProducts(q?: string) {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return request(`/store/products${qs}`);
    },
    listProducts(params?: Record<string, string | number | boolean>) {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request(`/admin/products${qs}`, {}, "admin");
    },
    retrieveProduct(id: string) {
      return request(`/admin/products/${id}`, {}, "admin");
    },
    retrieveOrder(id: string) {
      return request(`/admin/orders/${id}`, {}, "admin");
    },
    listOrders(params?: Record<string, string | number | boolean>) {
      const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
      return request(`/admin/orders${qs}`, {}, "admin");
    },
  };
}
