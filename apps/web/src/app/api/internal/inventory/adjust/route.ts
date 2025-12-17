import { NextRequest, NextResponse } from "next/server";
import { adjustInventory } from "@enterprise/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, delta, reason, note } = body;

    if (!productId || typeof delta !== "number" || !reason) {
      return NextResponse.json(
        { error: "productId, delta, reason は必須です" },
        { status: 400 }
      );
    }

    if (delta === 0) {
      return NextResponse.json(
        { error: "調整数量は0以外を指定してください" },
        { status: 400 }
      );
    }

    const result = await adjustInventory({
      productId,
      delta,
      reason,
      note,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[inventory/adjust] Error:", error);
    const message = error instanceof Error ? error.message : "在庫調整に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
