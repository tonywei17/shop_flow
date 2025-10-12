export type MedusaClientOptions = {
    baseUrl?: string;
    adminToken?: string;
};
export type CreateMedusaProductVariantPrice = {
    amount: number;
    currency_code: string;
};
export type CreateMedusaProductVariant = {
    title: string;
    sku?: string | null;
    manage_inventory?: boolean;
    inventory_quantity?: number;
    options?: {
        value: string;
    }[];
    prices: CreateMedusaProductVariantPrice[];
};
export type CreateMedusaProductPayload = {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    handle?: string | null;
    status?: "draft" | "proposed" | "published";
    options?: {
        title: string;
    }[];
    metadata?: Record<string, unknown> | null;
    variants: CreateMedusaProductVariant[];
};
export declare function createMedusaClient(options?: MedusaClientOptions): {
    listStoreProducts(q?: string): Promise<any>;
    listProducts(params?: Record<string, string | number | boolean>): Promise<any>;
    retrieveProduct(id: string): Promise<any>;
    createProduct(payload: CreateMedusaProductPayload): Promise<any>;
    retrieveOrder(id: string): Promise<any>;
    listOrders(params?: Record<string, string | number | boolean>): Promise<any>;
};
