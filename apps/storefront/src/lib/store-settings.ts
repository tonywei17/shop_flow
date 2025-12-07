import { getSupabaseAdmin } from "@enterprise/db";

export type StoreSettings = {
  id: string;
  store_name: string;
  store_status: "active" | "maintenance";
  tax_rate: number;
  tax_type: "exclusive" | "inclusive";
  shipping_fee: number;
  free_shipping_threshold: number | null;
  rounding_method: "round" | "floor" | "ceil";
  minimum_order_amount: number;
};

const DEFAULT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Get store settings from database
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
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
  } catch (error) {
    console.error("[getStoreSettings] Error:", error);
    return null;
  }
}

/**
 * Calculate tax based on store settings
 */
export function calculateTax(
  amount: number,
  taxRate: number,
  roundingMethod: "round" | "floor" | "ceil"
): number {
  const taxAmount = amount * (taxRate / 100);
  
  switch (roundingMethod) {
    case "floor":
      return Math.floor(taxAmount);
    case "ceil":
      return Math.ceil(taxAmount);
    case "round":
    default:
      return Math.round(taxAmount);
  }
}

/**
 * Calculate shipping fee based on store settings
 */
export function calculateShippingFee(
  subtotal: number,
  shippingFee: number,
  freeShippingThreshold: number | null
): number {
  if (freeShippingThreshold !== null && subtotal >= freeShippingThreshold) {
    return 0;
  }
  return shippingFee;
}

/**
 * Default store settings (fallback)
 */
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: DEFAULT_SETTINGS_ID,
  store_name: "オンラインストア",
  store_status: "active",
  tax_rate: 10,
  tax_type: "exclusive",
  shipping_fee: 0,
  free_shipping_threshold: null,
  rounding_method: "round",
  minimum_order_amount: 0,
};
