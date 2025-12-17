import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = getSupabaseAdmin();

    const { data: order, error } = await sb
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
        shipping_address,
        payment_status,
        payment_method,
        created_at,
        paid_at,
        shipped_at,
        delivered_at,
        cancelled_at,
        order_items (
          id,
          product_id,
          product_code,
          product_name,
          quantity,
          unit_price,
          tax_rate,
          subtotal
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status) {
      return NextResponse.json({ error: "ステータスを指定してください" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();

    // Use the stored procedure for status updates
    const { data: result, error } = await sb.rpc("update_order_status", {
      p_order_id: id,
      p_new_status: status,
      p_payment_status: paymentStatus || null,
    });

    if (error) {
      console.error("Failed to update order status:", error);
      
      if (error.message?.includes("Invalid status transition")) {
        return NextResponse.json({ error: "無効なステータス遷移です" }, { status: 400 });
      }
      
      return NextResponse.json({ error: "注文ステータスの更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "注文の更新に失敗しました" }, { status: 500 });
  }
}
