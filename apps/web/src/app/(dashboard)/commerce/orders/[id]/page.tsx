import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@enterprise/db";
import { OrderDetailClient } from "./order-detail-client";

export type OrderItem = {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
};

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
    recipientName: string;
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    phone: string;
  } | null;
  payment_status: string;
  payment_method: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  order_items: OrderItem[];
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
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
    notFound();
  }

  return <OrderDetailClient order={order as Order} />;
}
