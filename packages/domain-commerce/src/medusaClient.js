const DEFAULT_BASE_URL = process.env.MEDUSA_BASE_URL || "http://localhost:9000";
const DEFAULT_ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN;
export function createMedusaClient(options = {}) {
    const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    const adminToken = options.adminToken || DEFAULT_ADMIN_TOKEN;
    async function request(path, init = {}, auth = "none") {
        const headers = {
            "content-type": "application/json",
            ...init.headers,
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
        if (res.status === 204)
            return null;
        return res.json();
    }
    return {
        listStoreProducts(q) {
            const qs = q ? `?q=${encodeURIComponent(q)}` : "";
            return request(`/store/products${qs}`);
        },
        listProducts(params) {
            const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
            return request(`/admin/products${qs}`, {}, "admin");
        },
        retrieveProduct(id) {
            return request(`/admin/products/${id}`, {}, "admin");
        },
        createProduct(payload) {
            return request(`/admin/products`, {
                method: "POST",
                body: JSON.stringify(payload),
            }, "admin");
        },
        retrieveOrder(id) {
            return request(`/admin/orders/${id}`, {}, "admin");
        },
        listOrders(params) {
            const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
            return request(`/admin/orders${qs}`, {}, "admin");
        },
    };
}
