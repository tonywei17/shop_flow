import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { getCurrentUser } from "@/lib/auth/session";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
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
      .eq("user_id", user.id)
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const supabase = getSupabaseAdmin();

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
    }

    // Users can only cancel their own pending orders
    if (action === "cancel") {
      if (order.user_id !== user.id) {
        return NextResponse.json({ error: "この注文をキャンセルする権限がありません" }, { status: 403 });
      }

      if (order.status !== "pending") {
        return NextResponse.json({ error: "この注文はキャンセルできません" }, { status: 400 });
      }

      // Cancel order and restore stock
      const { error: cancelError } = await supabase.rpc("cancel_order_with_stock_restore", {
        p_order_id: id,
        p_user_id: user.id,
      });

      if (cancelError) {
        console.error("Failed to cancel order:", cancelError);
        return NextResponse.json({ error: "注文のキャンセルに失敗しました" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "注文がキャンセルされました" });
    }

    return NextResponse.json({ error: "無効な操作です" }, { status: 400 });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "注文の更新に失敗しました" }, { status: 500 });
  }
}
