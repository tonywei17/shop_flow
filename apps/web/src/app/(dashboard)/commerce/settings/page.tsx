import { getStoreSettings, initializeStoreSettings } from "@enterprise/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { StoreSettingsClient } from "./store-settings-client";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  // Get or initialize store settings
  let settings = await getStoreSettings();
  
  if (!settings) {
    settings = await initializeStoreSettings();
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <DashboardHeader title="商店設定" />
      <div className="px-9">
        <StoreSettingsClient initialSettings={settings} />
      </div>
    </div>
  );
}
