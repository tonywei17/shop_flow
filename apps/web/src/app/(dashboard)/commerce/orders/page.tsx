import { DashboardHeader } from "@/components/dashboard/header";
import { getSupabaseAdmin } from "@enterprise/db";
import { OrdersClient } from "./orders-client";

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  price_type: string;
  shipping_address: {
    recipientName?: string;
    phone?: string;
    postalCode?: string;
    prefecture?: string;
    city?: string;
    addressLine1?: string;
    addressLine2?: string;
  } | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  customer_name?: string;
  customer_email?: string;
  item_count?: number;
};

async function getOrders(): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const sb = getSupabaseAdmin();

    // Fetch orders with customer info
    const { data: orders, error } = await sb
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
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[commerce/orders] Failed to fetch orders:", error);
      return { orders: [], error: "注文データの取得に失敗しました" };
    }

    // Fetch customer info for each order
    const userIds = [...new Set((orders || []).map((o: any) => o.user_id))];
    let customerMap: Record<string, { name: string; email: string }> = {};

    if (userIds.length > 0) {
      const { data: customers } = await sb
        .from("admin_accounts")
        .select("id, display_name, email")
        .in("id", userIds);

      if (customers) {
        customerMap = Object.fromEntries(
          customers.map((c: any) => [c.id, { name: c.display_name, email: c.email }])
        );
      }
    }

    // Fetch item counts for each order
    const orderIds = (orders || []).map((o: any) => o.id);
    let itemCountMap: Record<string, number> = {};

    if (orderIds.length > 0) {
      const { data: items } = await sb
        .from("order_items")
        .select("order_id, quantity");

      if (items) {
        itemCountMap = items.reduce((acc: Record<string, number>, item: any) => {
          acc[item.order_id] = (acc[item.order_id] || 0) + item.quantity;
          return acc;
        }, {});
      }
    }

    // Combine data
    const enrichedOrders: Order[] = (orders || []).map((o: any) => ({
      ...o,
      customer_name: customerMap[o.user_id]?.name || o.shipping_address?.recipientName || "不明",
      customer_email: customerMap[o.user_id]?.email || null,
      item_count: itemCountMap[o.id] || 0,
    }));

    return { orders: enrichedOrders, error: null };
  } catch (err) {
    console.error("[commerce/orders] Unexpected error:", err);
    return { orders: [], error: "予期しないエラーが発生しました" };
  }
}

export default async function OrdersListPage() {
  const { orders, error } = await getOrders();

  return (
    <div className="space-y-6">
      <DashboardHeader title="注文管理" />
      <OrdersClient orders={orders} error={error} />
    </div>
  );
}
