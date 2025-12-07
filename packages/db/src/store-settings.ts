import { getSupabaseAdmin } from "./client";

export type StoreStatus = "active" | "maintenance";
export type TaxType = "exclusive" | "inclusive";
export type RoundingMethod = "round" | "floor" | "ceil";

export type StoreSettings = {
  id: string;
  store_name: string;
  store_status: StoreStatus;
  tax_rate: number;
  tax_type: TaxType;
  shipping_fee: number;
  free_shipping_threshold: number | null;
  rounding_method: RoundingMethod;
  minimum_order_amount: number;
  created_at: string;
  updated_at: string;
};

export type UpdateStoreSettingsInput = {
  store_name?: string;
  store_status?: StoreStatus;
  tax_rate?: number;
  tax_type?: TaxType;
  shipping_fee?: number;
  free_shipping_threshold?: number | null;
  rounding_method?: RoundingMethod;
  minimum_order_amount?: number;
};

// Default settings ID (singleton pattern)
const DEFAULT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Get store settings (singleton)
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const sb = getSupabaseAdmin();
  
  const { data, error } = await sb
    .from("store_settings")
    .select("*")
    .eq("id", DEFAULT_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    console.error("[getStoreSettings] Error:", error);
    return null;
  }

  return data as StoreSettings | null;
}

/**
 * Update store settings
 */
export async function updateStoreSettings(
  input: UpdateStoreSettingsInput
): Promise<StoreSettings | null> {
  const sb = getSupabaseAdmin();

  const updatePayload: Record<string, unknown> = {};

  if (input.store_name !== undefined) {
    updatePayload.store_name = input.store_name;
  }
  if (input.store_status !== undefined) {
    updatePayload.store_status = input.store_status;
  }
  if (input.tax_rate !== undefined) {
    updatePayload.tax_rate = input.tax_rate;
  }
  if (input.tax_type !== undefined) {
    updatePayload.tax_type = input.tax_type;
  }
  if (input.shipping_fee !== undefined) {
    updatePayload.shipping_fee = input.shipping_fee;
  }
  if (input.free_shipping_threshold !== undefined) {
    updatePayload.free_shipping_threshold = input.free_shipping_threshold;
  }
  if (input.rounding_method !== undefined) {
    updatePayload.rounding_method = input.rounding_method;
  }
  if (input.minimum_order_amount !== undefined) {
    updatePayload.minimum_order_amount = input.minimum_order_amount;
  }

  const { data, error } = await sb
    .from("store_settings")
    .update(updatePayload)
    .eq("id", DEFAULT_SETTINGS_ID)
    .select()
    .single();

  if (error) {
    console.error("[updateStoreSettings] Error:", error);
    return null;
  }

  return data as StoreSettings;
}

/**
 * Initialize store settings if not exists
 */
export async function initializeStoreSettings(): Promise<StoreSettings | null> {
  const sb = getSupabaseAdmin();

  // Try to get existing settings first
  const existing = await getStoreSettings();
  if (existing) {
    return existing;
  }

  // Create default settings
  const { data, error } = await sb
    .from("store_settings")
    .insert({ id: DEFAULT_SETTINGS_ID })
    .select()
    .single();

  if (error) {
    console.error("[initializeStoreSettings] Error:", error);
    return null;
  }

  return data as StoreSettings;
}
