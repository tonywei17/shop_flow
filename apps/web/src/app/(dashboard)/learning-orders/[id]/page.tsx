import { DashboardHeader } from "@/components/dashboard/header";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type LearningOrderDetail = {
  id: string;
  displayId: string;
  email: string;
  status: string;
  paymentStatus: string;
  currencyCode: string;
  subtotal: number;
  total: number;
  createdAt: string;
  category: string;
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

const ORDER_STATUS_LABEL: Record<string, string> = {
  completed: "完了",
  pending: "保留",
  canceled: "キャンセル",
  requires_action: "要対応",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  captured: "支払い済み",
  awaiting: "支払い待ち",
  pending: "支払い待ち",
  refunded: "返金済み",
  canceled: "キャンセル",
  requires_action: "要対応",
};

function formatOrderStatus(status: string): string {
  if (!status) return "-";
  const key = status.toLowerCase();
  return ORDER_STATUS_LABEL[key] ?? status;
}

function formatPaymentStatus(status: string): string {
  if (!status) return "-";
  const key = status.toLowerCase();
  return PAYMENT_STATUS_LABEL[key] ?? status;
}

function formatAmountYen(amount: number): string {
  if (!amount || amount <= 0) return "-";
  return `¥${(amount / 100).toLocaleString("ja-JP")}`;
}

async function fetchLearningOrder(id: string): Promise<{ order?: LearningOrderDetail; error?: string }> {
  // 一時的に Medusa ではなくモックデータを使用して UI を確認する
  const mockOrders: LearningOrderDetail[] = [
    {
      id: "order_lms_1001",
      displayId: "LMS-1001",
      email: "student1@example.com",
      status: "completed",
      paymentStatus: "captured",
      currencyCode: "jpy",
      subtotal: 12000,
      total: 12000,
      createdAt: new Date().toISOString(),
      category: "会費",
      items: [
        {
          id: "item_course_1",
          title: "リトミック基礎コース",
          quantity: 1,
          unitPrice: 12000,
          subtotal: 12000,
        },
      ],
      payments: [
        {
          id: "pay_1",
          providerId: "stripe",
          amount: 12000,
          currencyCode: "jpy",
          capturedAt: new Date().toISOString(),
          status: "captured",
        },
      ],
    },
    {
      id: "order_lms_1002",
      displayId: "LMS-1002",
      email: "student2@example.com",
      status: "pending",
      paymentStatus: "awaiting",
      currencyCode: "jpy",
      subtotal: 8000,
      total: 8000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      category: "試験受験料",
      items: [
        {
          id: "item_course_2",
          title: "リトミック指導法 中級",
          quantity: 1,
          unitPrice: 8000,
          subtotal: 8000,
        },
      ],
      payments: [],
    },
  ];

  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return { error: "注文が見つかりませんでした。" };
  }

  return { order };
}

export default async function LearningOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { order, error } = await fetchLearningOrder(id);

  return (
    <div className="space-y-6 p-8">
      <DashboardHeader title="学習プラットフォーム注文詳細" />

      {error ? (
        <Card className="rounded-xl border border-[#11111114] bg-white p-6 text-sm text-red-600">
          {error}
        </Card>
      ) : !order ? (
        <Card className="rounded-xl border border-[#11111114] bg-white p-6 text-sm text-[#6f6f6f]">
          注文が見つかりませんでした。
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左側：注文情報 + 支払い情報 */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-xl border border-[#11111114] bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">注文情報</h2>
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-[#6f6f6f]">注文番号</dt>
                  <dd className="font-mono text-xs text-[#111111]">
                    {order.displayId || order.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">注文分類</dt>
                  <dd className="text-[#111111]">{order.category || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">ステータス</dt>
                  <dd className="text-[#111111]">{formatOrderStatus(order.status)}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">支払いステータス</dt>
                  <dd className="text-[#111111]">{formatPaymentStatus(order.paymentStatus)}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">顧客メール</dt>
                  <dd className="text-[#111111]">{order.email || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">注文日時</dt>
                  <dd className="text-[#111111]">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("ja-JP")
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6f6f6f]">合計金額</dt>
                  <dd className="text-[#111111]">
                    {formatAmountYen(order.total)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-xs text-[#6f6f6f]">
                <Link href="/learning-orders" className="text-[#00ac4d] hover:underline">
                  ← 学習プラットフォーム注文一覧に戻る
                </Link>
              </div>
            </Card>

            <Card className="rounded-xl border border-[#11111114] bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">注文内容</h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-[#6f6f6f]">注文行がありません。</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b bg-[#f9fafb] text-left text-xs font-medium text-[#6f6f6f]">
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
                          className="border-b last:border-b-0 hover:bg-[#fafafa]"
                        >
                          <td className="px-4 py-3 align-top text-[#111111]">
                            {item.title || "-"}
                          </td>
                          <td className="px-4 py-3 align-top text-[#111111]">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 align-top text-[#111111]">
                            {formatAmountYen(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 align-top text-[#111111]">
                            {formatAmountYen(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* 右側：支払い情報（Stripe 等） */}
          <div className="space-y-6">
            <Card className="rounded-xl border border-[#11111114] bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-[#111111]">支払い情報（Stripe 等）</h2>
              {order.payments.length === 0 ? (
                <p className="text-sm text-[#6f6f6f]">支払い情報がありません。</p>
              ) : (
                <div className="space-y-4 text-sm">
                  {order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-[#1111111A] px-4 py-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-[#111111]">
                          {formatAmountYen(p.amount)}
                        </span>
                        <span className="text-xs capitalize text-[#6f6f6f]">
                          {formatPaymentStatus(p.status ?? "")}
                        </span>
                      </div>
                      <dl className="grid gap-2 text-xs md:grid-cols-2">
                        <div>
                          <dt className="text-[#6f6f6f]">決済ID</dt>
                          <dd className="font-mono text-[11px] text-[#111111]">
                            {p.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#6f6f6f]">プロバイダー</dt>
                          <dd className="text-[#111111]">
                            {p.providerId || "stripe"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#6f6f6f]">キャプチャ日時</dt>
                          <dd className="text-[#111111]">
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
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
