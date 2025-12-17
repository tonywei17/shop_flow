import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress, subtotal, taxAmount, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "カートが空です" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.addressLine1) {
      return NextResponse.json(
        { error: "配送先住所を入力してください" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Create order with stock adjustment in a single transaction
    const { data: result, error: txError } = await supabase.rpc(
      "create_order_with_stock_adjustment",
      {
        p_order_number: orderNumber,
        p_user_id: user.id,
        p_subtotal: subtotal,
        p_tax_amount: taxAmount,
        p_shipping_fee: 0,
        p_total_amount: total,
        p_price_type: user.priceType || "retail",
        p_shipping_address: shippingAddress,
        p_payment_method: "stripe",
        p_items: items,
      }
    );

    if (txError) {
      console.error("Failed to create order:", txError);
      
      // Check for specific error types
      if (txError.message?.includes("Insufficient stock")) {
        return NextResponse.json(
          { error: "在庫が不足しています。カートの内容を確認してください。" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "注文の作成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.order_number,
      orderUuid: result.order_id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "注文処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal,
        tax_amount,
        shipping_fee,
        total_amount,
        payment_status,
        created_at,
        shipped_at,
        delivered_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch orders:", error);
      return NextResponse.json(
        { error: "注文履歴の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "注文履歴の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
