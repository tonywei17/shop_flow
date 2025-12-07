import { NextResponse } from "next/server";
import { getStoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";

export const runtime = "nodejs";

/**
 * GET /api/store-settings
 * Get store settings for the storefront
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();

    return NextResponse.json({
      settings: settings ?? DEFAULT_STORE_SETTINGS,
    });
  } catch (error) {
    console.error("[store-settings] GET error:", error);
    // Return default settings on error
    return NextResponse.json({
      settings: DEFAULT_STORE_SETTINGS,
    });
  }
}
