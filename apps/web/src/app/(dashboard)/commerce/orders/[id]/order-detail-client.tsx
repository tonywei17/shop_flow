"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  User,
  Loader2,
} from "lucide-react";
import type { Order } from "./page";

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

const PRICE_TYPE_MAP: Record<string, string> = {
  hq: "本部価格",
  branch: "支局価格",
  classroom: "教室価格",
  retail: "一般価格",
};

const VALID_NEXT_STATUS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const status = STATUS_MAP[order.status] ?? { label: order.status, variant: "secondary" as const };
  const paymentStatus = PAYMENT_STATUS_MAP[order.payment_status] ?? { label: order.payment_status, variant: "secondary" as const };
  const nextStatuses = VALID_NEXT_STATUS[order.status] || [];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/internal/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newStatus === "paid" ? "paid" : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "ステータスの更新に失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/commerce/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          注文一覧に戻る
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            注文 {order.order_number}
          </h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-sm">
            {status.label}
          </Badge>
          <Badge variant={paymentStatus.variant} className="text-sm">
            {paymentStatus.label}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {PRICE_TYPE_MAP[order.price_type] || order.price_type}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

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
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        商品コード: {item.product_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                        {item.tax_rate > 0 && ` (税率: ${item.tax_rate}%)`}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  配送先
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shipping_address.recipientName}</p>
                  <p className="text-muted-foreground">
                    〒{order.shipping_address.postalCode}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.prefecture}
                    {order.shipping_address.city}
                    {order.shipping_address.addressLine1}
                    {order.shipping_address.addressLine2 && ` ${order.shipping_address.addressLine2}`}
                  </p>
                  <p className="text-muted-foreground">
                    TEL: {order.shipping_address.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                <TimelineItem label="注文受付" date={order.created_at} isCompleted={true} />
                <TimelineItem label="支払い完了" date={order.paid_at} isCompleted={!!order.paid_at} />
                <TimelineItem label="発送完了" date={order.shipped_at} isCompleted={!!order.shipped_at} />
                <TimelineItem label="配達完了" date={order.delivered_at} isCompleted={!!order.delivered_at} />
                {order.cancelled_at && (
                  <TimelineItem label="キャンセル" date={order.cancelled_at} isCompleted={true} isError={true} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
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
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">消費税</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">送料</span>
                  <span>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : "無料"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>合計</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  お支払い方法: {order.payment_method === "stripe" ? "クレジットカード" : order.payment_method}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                顧客情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ユーザーID: {order.user_id}
              </p>
            </CardContent>
          </Card>

          {/* Status Update */}
          {nextStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ステータス更新</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_MAP[s]?.label || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isUpdating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    更新中...
                  </div>
                )}
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
