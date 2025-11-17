import Link from "next/link";
import { Header } from "@/components/header";
import { createMedusaClient } from "@enterprise/domain-commerce";

type OrderDetail = {
  id: string;
  displayId: string;
  email: string;
  status: string;
  paymentStatus: string;
  currencyCode: string;
  subtotal: number;
  total: number;
  createdAt: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  payments: {
    id: string;
    providerId: string;
    amount: number;
    currencyCode: string;
    capturedAt?: string;
    status?: string;
  }[];
};

async function fetchOrder(id: string): Promise<{ order?: OrderDetail; error?: string }> {
  const client = createMedusaClient();

  try {
    const data: any = await client.retrieveOrder(id);
    const raw = data?.order ?? data;

    if (!raw || typeof raw !== "object") {
      return { error: "注文が見つかりませんでした。" };
    }

    const items = Array.isArray(raw.items)
      ? raw.items.map((item: any) => {
          const itemId = typeof item?.id === "string" ? item.id : "";
          if (!itemId) return null;
          const quantity = typeof item?.quantity === "number" ? item.quantity : 0;
          const unitPrice = typeof item?.unit_price === "number" ? item.unit_price : 0;
          const subtotal = typeof item?.subtotal === "number" ? item.subtotal : quantity * unitPrice;

          return {
            id: itemId,
            title: typeof item?.title === "string" ? item.title : "",
            quantity,
            unitPrice,
            subtotal,
          };
        }).filter((v: any) => v !== null)
      : [];

    const payments = Array.isArray(raw.payments)
      ? raw.payments
          .map((p: any) => {
            const paymentId = typeof p?.id === "string" ? p.id : "";
            if (!paymentId) return null;
            const amount = typeof p?.amount === "number" ? p.amount : 0;
            const currencyCode =
              typeof p?.currency_code === "string" ? p.currency_code : "jpy";

            return {
              id: paymentId,
              providerId: typeof p?.provider_id === "string" ? p.provider_id : "",
              amount,
              currencyCode,
              capturedAt:
                typeof p?.captured_at === "string" ? p.captured_at : undefined,
              status: typeof p?.status === "string" ? p.status : undefined,
            };
          })
          .filter((v: any) => v !== null)
      : [];

    const order: OrderDetail = {
      id: typeof raw.id === "string" ? raw.id : id,
      displayId:
        raw.display_id !== undefined && raw.display_id !== null
          ? String(raw.display_id)
          : "",
      email: typeof raw.email === "string" ? raw.email : "",
      status: typeof raw.status === "string" ? raw.status : "",
      paymentStatus:
        typeof raw.payment_status === "string" ? raw.payment_status : "",
      currencyCode:
        typeof raw.currency_code === "string" ? raw.currency_code : "jpy",
      subtotal: typeof raw.subtotal === "number" ? raw.subtotal : 0,
      total: typeof raw.total === "number" ? raw.total : 0,
      createdAt:
        typeof raw.created_at === "string" ? raw.created_at : "",
      items,
      payments,
    };

    return { order };
  } catch (error) {
    console.error("Failed to fetch Medusa order detail", error);
    return {
      error:
        "注文の詳細を取得できませんでした。注文ID や Medusa API の設定を確認してください。",
    };
  }
}

export default async function LearningPaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { order, error } = await fetchOrder(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">注文詳細</h1>
            <p className="text-sm text-muted-foreground">
              注文と支払いの詳細を確認できます。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/payments"
              className="text-sm text-primary hover:underline"
            >
              支払い履歴に戻る →
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border bg-white px-6 py-10 text-sm text-red-600">
            {error}
          </div>
        ) : !order ? (
          <div className="rounded-lg border bg-white px-6 py-10 text-sm text-muted-foreground">
            注文が見つかりませんでした。
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">注文情報</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">注文番号</dt>
                  <dd className="font-mono text-xs text-gray-800">
                    {order.displayId || order.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">ステータス</dt>
                  <dd className="capitalize text-gray-800">{order.status || "-"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">支払いステータス</dt>
                  <dd className="capitalize text-gray-800">
                    {order.paymentStatus || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">顧客メール</dt>
                  <dd className="text-gray-800">{order.email || "-"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">注文日時</dt>
                  <dd className="text-gray-800">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("ja-JP")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">合計金額</dt>
                  <dd className="text-gray-800">
                    {order.total > 0
                      ? `${(order.total / 100).toLocaleString()} ${order.currencyCode.toUpperCase()}`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">注文内容</h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  注文行がありません。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                      <tr>
                        <th className="px-4 py-3">商品名</th>
                        <th className="px-4 py-3">数量</th>
                        <th className="px-4 py-3">単価</th>
                        <th className="px-4 py-3">小計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 align-top text-gray-800">
                            {item.title || "-"}
                          </td>
                          <td className="px-4 py-3 align-top text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 align-top text-gray-800">
                            {item.unitPrice > 0
                              ? `${(item.unitPrice / 100).toLocaleString()} ${order.currencyCode.toUpperCase()}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 align-top text-gray-800">
                            {item.subtotal > 0
                              ? `${(item.subtotal / 100).toLocaleString()} ${order.currencyCode.toUpperCase()}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">支払い情報（Stripe 等）</h2>
              {order.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  支払い情報がありません。
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  {order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border px-4 py-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">
                          {p.amount > 0
                            ? `${(p.amount / 100).toLocaleString()} ${p.currencyCode.toUpperCase()}`
                            : "-"}
                        </span>
                        <span className="text-xs capitalize text-gray-500">
                          {p.status || "-"}
                        </span>
                      </div>
                      <dl className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="text-gray-500">決済ID</dt>
                          <dd className="font-mono text-[11px] text-gray-800">
                            {p.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">プロバイダー</dt>
                          <dd className="text-gray-800">
                            {p.providerId || "stripe"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">キャプチャ日時</dt>
                          <dd className="text-gray-800">
                            {p.capturedAt
                              ? new Date(p.capturedAt).toLocaleString("ja-JP")
                              : "-"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
