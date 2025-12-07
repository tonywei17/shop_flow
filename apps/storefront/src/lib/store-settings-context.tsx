"use client";

import * as React from "react";
import type { StoreSettings } from "./store-settings";

type StoreSettingsContextType = {
  settings: StoreSettings | null;
  isLoading: boolean;
  isMaintenanceMode: boolean;
};

const defaultSettings: StoreSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  store_name: "オンラインストア",
  store_status: "active",
  tax_rate: 10,
  tax_type: "exclusive",
  shipping_fee: 0,
  free_shipping_threshold: null,
  rounding_method: "round",
  minimum_order_amount: 0,
};

const StoreSettingsContext = React.createContext<StoreSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  isMaintenanceMode: false,
});

export function StoreSettingsProvider({ 
  children,
  initialSettings,
}: { 
  children: React.ReactNode;
  initialSettings?: StoreSettings | null;
}) {
  const [settings, setSettings] = React.useState<StoreSettings | null>(
    initialSettings ?? defaultSettings
  );
  const [isLoading, setIsLoading] = React.useState(!initialSettings);

  React.useEffect(() => {
    if (initialSettings) return;
    
    async function fetchSettings() {
      try {
        const res = await fetch("/api/store-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [initialSettings]);

  const isMaintenanceMode = settings?.store_status === "maintenance";

  const value = React.useMemo(
    () => ({
      settings,
      isLoading,
      isMaintenanceMode,
    }),
    [settings, isLoading, isMaintenanceMode]
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return React.useContext(StoreSettingsContext);
}

/**
 * Calculate tax amount based on store settings
 */
export function calculateTaxAmount(
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
