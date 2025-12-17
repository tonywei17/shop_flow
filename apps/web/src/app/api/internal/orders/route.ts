import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("q") || undefined;
  const offset = (page - 1) * limit;

  try {
    const sb = getSupabaseAdmin();

    let query = sb
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        status,
        subtotal,
        tax_amount,
        shipping_fee,
        total_amount,
        price_type,
        payment_status,
        payment_method,
        created_at,
        paid_at,
        shipped_at,
        delivered_at,
        cancelled_at
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("order_number", `%${search}%`);
    }

    const { data: orders, count, error } = await query;

    if (error) {
      console.error("[orders] Failed to fetch orders", error);
      return NextResponse.json({ error: "注文一覧の取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ orders, count, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
