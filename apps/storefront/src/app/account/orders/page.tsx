import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@enterprise/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, ArrowLeft, ChevronRight } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "処理中", variant: "secondary" },
  confirmed: { label: "確認済み", variant: "default" },
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

export default async function OrdersPage(): Promise<ReactElement> {
  // Redirect to login if not authenticated
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account/orders");
  }

  const user = await getCurrentUser();
  const supabase = getSupabaseAdmin();

  let orders: any[] = [];
  try {
    const { data, error } = await supabase
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
        created_at
      `)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      orders = data;
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          マイページに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">注文履歴</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">注文履歴がありません</h2>
          <p className="text-muted-foreground mb-6">
            まだ注文がありません
          </p>
          <Link href="/products">
            <Button>商品を見る</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] ?? { label: order.status, variant: "secondary" as const };
            const paymentStatus = PAYMENT_STATUS_MAP[order.payment_status] ?? { label: order.payment_status, variant: "secondary" as const };

            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold">{order.order_number}</span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant={paymentStatus.variant}>{paymentStatus.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
