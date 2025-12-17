import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@enterprise/db";

type OrderItem = {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

type ShippingAddress = {
  recipientName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  phone?: string;
};

type CreateOrderRequest = {
  price_type: string;
  payment_method: "stripe_link" | "invoice";
  customer_email?: string;
  customer_name?: string;
  order_items: OrderItem[];
  shipping_address: ShippingAddress;
  subtotal: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  notes?: string;
};

function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validation
    if (!body.order_items || body.order_items.length === 0) {
      return NextResponse.json({ error: "商品を追加してください" }, { status: 400 });
    }

    if (body.payment_method === "stripe_link" && !body.customer_email) {
      return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
    }

    if (!body.shipping_address.recipientName || !body.shipping_address.postalCode) {
      return NextResponse.json({ error: "配送先住所を入力してください" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get a system user for manual orders (or use the first admin account)
    const { data: adminUser } = await supabase
      .from("admin_accounts")
      .select("id")
      .limit(1)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: "システムユーザーが見つかりません" }, { status: 500 });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Determine initial payment status
    const paymentStatus = body.payment_method === "invoice" ? "unpaid" : "unpaid";

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: adminUser.id,
        status: "pending",
        subtotal: body.subtotal,
        tax_amount: body.tax_amount,
        shipping_fee: body.shipping_fee,
        total_amount: body.total_amount,
        price_type: body.price_type,
        shipping_address: body.shipping_address,
        payment_status: paymentStatus,
        payment_method: body.payment_method === "stripe_link" ? "stripe" : "invoice",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json({ error: "注文の作成に失敗しました" }, { status: 500 });
    }

    // Create order items
    const orderItems = body.order_items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_code: item.product_code,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "注文商品の作成に失敗しました" }, { status: 500 });
    }

    // Handle payment method
    if (body.payment_method === "stripe_link" && body.customer_email) {
      // TODO: Create Stripe Payment Link and send email
      // For now, we'll just log and return success
      console.log(`[Stripe] Would create payment link for order ${orderNumber}`);
      console.log(`[Email] Would send payment link to ${body.customer_email}`);
      
      // In a real implementation:
      // 1. Create Stripe Payment Link using Stripe API
      // 2. Send email with the payment link using a mail service (e.g., Resend, SendGrid)
      
      // Example Stripe Payment Link creation (requires stripe package):
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // const paymentLink = await stripe.paymentLinks.create({
      //   line_items: orderItems.map(item => ({
      //     price_data: {
      //       currency: 'jpy',
      //       product_data: { name: item.product_name },
      //       unit_amount: item.unit_price,
      //     },
      //     quantity: item.quantity,
      //   })),
      //   metadata: { order_id: order.id, order_number: orderNumber },
      // });
      
      // Update order with stripe info
      // await supabase.from("orders").update({
      //   stripe_payment_intent_id: paymentLink.id,
      // }).eq("id", order.id);
    }

    if (body.payment_method === "invoice") {
      // TODO: Record in invoice system when it's ready
      console.log(`[Invoice] Order ${orderNumber} will be added to monthly invoice`);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        total_amount: body.total_amount,
        payment_method: body.payment_method,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "注文の作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
