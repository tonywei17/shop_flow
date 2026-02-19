export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/header";

type OrderRow = {
  id: string;
  displayId: string;
  email: string;
  status: string;
  paymentStatus: string;
  total: number;
  currencyCode: string;
  createdAt: string;
};

async function fetchOrders(): Promise<{ orders: OrderRow[]; error?: string }> {
  try {
    // TODO: Implement order fetching from Supabase or other data source
    const rawOrders: any[] = [];

    const orders: OrderRow[] = rawOrders
      .map((o) => {
        const id = typeof o?.id === "string" ? o.id : "";
        if (!id) return null;

        const displayId =
          o?.display_id !== undefined && o?.display_id !== null
            ? String(o.display_id)
            : "";

        const email = typeof o?.email === "string" ? o.email : "";
        const status = typeof o?.status === "string" ? o.status : "";
        const paymentStatus =
          typeof o?.payment_status === "string" ? o.payment_status : "";
        const total = typeof o?.total === "number" ? o.total : 0;
        const currencyCode =
          typeof o?.currency_code === "string" ? o.currency_code : "jpy";
        const createdAt =
          typeof o?.created_at === "string" ? o.created_at : "";

        return {
          id,
          displayId,
          email,
          status,
          paymentStatus,
          total,
          currencyCode,
          createdAt,
        } satisfies OrderRow;
      })
      .filter((row): row is OrderRow => row !== null);

    return { orders };
  } catch (error) {
    console.error("Failed to fetch orders for learning payments", error);
    return {
      orders: [],
      error:
        "注文システムから受注データを取得できませんでした。",
    };
  }
}

export default async function LearningPaymentsPage() {
  const { orders, error } = await fetchOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">支払い履歴</h1>
            <p className="text-sm text-muted-foreground">
              学習プラットフォームに関連する注文と支払い状況を確認できます。
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            マイページに戻る →
          </Link>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <span className="text-sm font-medium">注文一覧</span>
            <span className="text-xs text-muted-foreground">
              {orders.length} 件の注文
            </span>
          </div>

          {error ? (
            <div className="px-6 py-10 text-sm text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">
              まだ購入履歴がありません。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <tr>
                    <th className="px-6 py-3">注文番号</th>
                    <th className="px-4 py-3">ステータス</th>
                    <th className="px-4 py-3">支払いステータス</th>
                    <th className="px-4 py-3">金額</th>
                    <th className="px-4 py-3">顧客メール</th>
                    <th className="px-4 py-3">注文日時</th>
                    <th className="px-4 py-3 text-right">詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 align-top font-mono text-xs text-gray-700">
                        {order.displayId || order.id}
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-gray-700">
                        {order.status || "-"}
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-gray-700">
                        {order.paymentStatus || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-900">
                        {order.total > 0
                          ? `${(order.total / 100).toLocaleString()} ${order.currencyCode.toUpperCase()}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {order.email || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("ja-JP")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <Link
                          href={`/dashboard/payments/${order.id}`}
                          className="text-primary hover:underline"
                        >
                          詳細を見る
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

