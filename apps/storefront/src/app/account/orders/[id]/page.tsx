import type { ReactElement } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@enterprise/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { CancelOrderButton } from "./cancel-order-button";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "処理中", variant: "secondary" },
  paid: { label: "支払済み", variant: "default" },
  processing: { label: "準備中", variant: "default" },
  shipped: { label: "発送済み", variant: "default" },
  delivered: { label: "配達完了", variant: "outline" },
  cancelled: { label: "キャンセル", variant: "destructive" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unpaid: { label: "未払い", variant: "secondary" },
  paid: { label: "支払済み", variant: "default" },
  refunded: { label: "返金済み", variant: "destructive" },
};

type OrderItem = {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
};

type Order = {
  id: string;
  order_number: string;
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
  };
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
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account/orders");
  }

  const { id } = await params;
  const user = await getCurrentUser();
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
    .eq("user_id", user?.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const typedOrder = order as Order;
  const status = STATUS_MAP[typedOrder.status] ?? { label: typedOrder.status, variant: "secondary" as const };
  const paymentStatus = PAYMENT_STATUS_MAP[typedOrder.payment_status] ?? { label: typedOrder.payment_status, variant: "secondary" as const };
  const canCancel = typedOrder.status === "pending";

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          注文履歴に戻る
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            注文 {typedOrder.order_number}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(typedOrder.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-sm">
            {status.label}
          </Badge>
          <Badge variant={paymentStatus.variant} className="text-sm">
            {paymentStatus.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                注文商品
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typedOrder.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        商品コード: {item.product_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                配送先
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{typedOrder.shipping_address.recipientName}</p>
                <p className="text-muted-foreground">
                  〒{typedOrder.shipping_address.postalCode}
                </p>
                <p className="text-muted-foreground">
                  {typedOrder.shipping_address.prefecture}
                  {typedOrder.shipping_address.city}
                  {typedOrder.shipping_address.addressLine1}
                  {typedOrder.shipping_address.addressLine2 && ` ${typedOrder.shipping_address.addressLine2}`}
                </p>
                <p className="text-muted-foreground">
                  TEL: {typedOrder.shipping_address.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                配送状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  label="注文受付"
                  date={typedOrder.created_at}
                  isCompleted={true}
                />
                <TimelineItem
                  label="支払い完了"
                  date={typedOrder.paid_at}
                  isCompleted={!!typedOrder.paid_at}
                />
                <TimelineItem
                  label="発送完了"
                  date={typedOrder.shipped_at}
                  isCompleted={!!typedOrder.shipped_at}
                />
                <TimelineItem
                  label="配達完了"
                  date={typedOrder.delivered_at}
                  isCompleted={!!typedOrder.delivered_at}
                />
                {typedOrder.cancelled_at && (
                  <TimelineItem
                    label="キャンセル"
                    date={typedOrder.cancelled_at}
                    isCompleted={true}
                    isError={true}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                お支払い
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">小計</span>
                  <span>{formatPrice(typedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">消費税</span>
                  <span>{formatPrice(typedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">送料</span>
                  <span>{typedOrder.shipping_fee > 0 ? formatPrice(typedOrder.shipping_fee) : "無料"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>合計</span>
                  <span>{formatPrice(typedOrder.total_amount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  お支払い方法: {typedOrder.payment_method === "stripe" ? "クレジットカード" : typedOrder.payment_method}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardContent className="pt-6">
                <CancelOrderButton orderId={typedOrder.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  isCompleted,
  isError = false,
}: {
  label: string;
  date: string | null;
  isCompleted: boolean;
  isError?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-3 w-3 rounded-full ${
          isError
            ? "bg-destructive"
            : isCompleted
            ? "bg-primary"
            : "bg-muted"
        }`}
      />
      <div className="flex-1">
        <p className={isCompleted ? "font-medium" : "text-muted-foreground"}>
          {label}
        </p>
        {date && (
          <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
        )}
      </div>
    </div>
  );
}
