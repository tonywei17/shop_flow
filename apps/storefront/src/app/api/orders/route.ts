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

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: "pending",
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_fee: 0,
        total_amount: total,
        price_type: user.priceType,
        shipping_address: shippingAddress,
        payment_status: "unpaid",
        payment_method: "stripe",
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "注文の作成に失敗しました" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_code: item.productCode,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.taxRate,
      subtotal: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "注文商品の登録に失敗しました" },
        { status: 500 }
      );
    }

    // TODO: Create Stripe checkout session and redirect
    // For now, just return success

    return NextResponse.json({
      success: true,
      orderId: order.order_number,
      orderUuid: order.id,
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
