import { NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings } from "@enterprise/db";

export const runtime = "nodejs";

/**
 * GET /api/internal/store-settings
 * Get store settings
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();

    if (!settings) {
      return NextResponse.json(
        { error: "Store settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[store-settings] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/internal/store-settings
 * Update store settings
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const updateData: Record<string, unknown> = {};

    if (body.store_name !== undefined) {
      if (typeof body.store_name !== "string" || body.store_name.trim() === "") {
        return NextResponse.json(
          { error: "店舗名は必須です" },
          { status: 400 }
        );
      }
      updateData.store_name = body.store_name.trim();
    }

    if (body.store_status !== undefined) {
      if (!["active", "maintenance"].includes(body.store_status)) {
        return NextResponse.json(
          { error: "無効な店舗状態です" },
          { status: 400 }
        );
      }
      updateData.store_status = body.store_status;
    }

    if (body.tax_rate !== undefined) {
      const taxRate = Number(body.tax_rate);
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        return NextResponse.json(
          { error: "税率は0〜100の間で指定してください" },
          { status: 400 }
        );
      }
      updateData.tax_rate = taxRate;
    }

    if (body.tax_type !== undefined) {
      if (!["exclusive", "inclusive"].includes(body.tax_type)) {
        return NextResponse.json(
          { error: "無効な税計算方式です" },
          { status: 400 }
        );
      }
      updateData.tax_type = body.tax_type;
    }

    if (body.shipping_fee !== undefined) {
      const shippingFee = Number(body.shipping_fee);
      if (isNaN(shippingFee) || shippingFee < 0) {
        return NextResponse.json(
          { error: "送料は0以上で指定してください" },
          { status: 400 }
        );
      }
      updateData.shipping_fee = shippingFee;
    }

    if (body.free_shipping_threshold !== undefined) {
      if (body.free_shipping_threshold === null || body.free_shipping_threshold === "") {
        updateData.free_shipping_threshold = null;
      } else {
        const threshold = Number(body.free_shipping_threshold);
        if (isNaN(threshold) || threshold < 0) {
          return NextResponse.json(
            { error: "送料無料閾値は0以上で指定してください" },
            { status: 400 }
          );
        }
        updateData.free_shipping_threshold = threshold;
      }
    }

    if (body.rounding_method !== undefined) {
      if (!["round", "floor", "ceil"].includes(body.rounding_method)) {
        return NextResponse.json(
          { error: "無効な端数処理方法です" },
          { status: 400 }
        );
      }
      updateData.rounding_method = body.rounding_method;
    }

    if (body.minimum_order_amount !== undefined) {
      const minAmount = Number(body.minimum_order_amount);
      if (isNaN(minAmount) || minAmount < 0) {
        return NextResponse.json(
          { error: "最低注文金額は0以上で指定してください" },
          { status: 400 }
        );
      }
      updateData.minimum_order_amount = minAmount;
    }

    const settings = await updateStoreSettings(updateData);

    if (!settings) {
      return NextResponse.json(
        { error: "Failed to update store settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[store-settings] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update store settings" },
      { status: 500 }
    );
  }
}
