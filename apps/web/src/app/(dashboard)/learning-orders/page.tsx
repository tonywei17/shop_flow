import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Eye } from "lucide-react";

// Medusa Admin Order レスポンスのうち、必要なフィールドだけを表現した最小限の型
type MedusaOrderDTO = {
  id?: string;
  display_id?: string | number | null;
  email?: string | null;
  status?: string | null;
  payment_status?: string | null;
  total?: number | null;
  currency_code?: string | null;
  created_at?: string | null;
};
// ダッシュボード表示用に整形した行データ
interface LearningOrderRow {
  id: string;
  displayId: string;
  email: string;
  status: string;
  paymentStatus: string;
  total: number;
  currencyCode: string;
  category: string;
  createdAt: string;
}

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

async function fetchLearningOrders(): Promise<{ orders: LearningOrderRow[]; error?: string }> {
  // 一時的に Medusa ではなくモックデータを使用して UI を確認する
  const mockRawOrders: MedusaOrderDTO[] = [
    {
      id: "order_lms_1001",
      display_id: "LMS-1001",
      email: "student1@example.com",
      status: "completed",
      payment_status: "captured",
      total: 12000,
      currency_code: "jpy",
      created_at: new Date().toISOString(),
    },
    {
      id: "order_lms_1002",
      display_id: "LMS-1002",
      email: "student2@example.com",
      status: "pending",
      payment_status: "awaiting",
      total: 8000,
      currency_code: "jpy",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const orders: LearningOrderRow[] = mockRawOrders
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

      const category =
        id === "order_lms_1001"
          ? "会費"
          : id === "order_lms_1002"
          ? "試験受験料"
          : "その他";

      return {
        id,
        displayId,
        email,
        status,
        paymentStatus,
        total,
        currencyCode,
        category,
        createdAt,
      } as LearningOrderRow;
    })
    .filter((row): row is LearningOrderRow => row !== null);

  return { orders };
}

export default async function LearningOrdersListPage() {
  const { orders, error } = await fetchLearningOrders();

  return (
    <div className="space-y-6 p-8">
      <DashboardHeader title="学習プラットフォーム注文一覧" />
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="learning-orders-select-all" className="flex items-center gap-3">
              <Checkbox id="learning-orders-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6f6f6f]">
              <span>
                合計 {orders.length} 件
              </span>
            </div>
          </div>

          {error ? (
            <div className="px-6 py-10 text-sm text-red-600">{error}</div>
          ) : (
            <Table className="[&_th]:py-3 [&_td]:py-3">
              <TableHeader>
                <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                  <TableHead className="w-[36px] pl-6 pr-3">
                    <Checkbox aria-label="行を選択" />
                  </TableHead>
                  <TableHead className="w-[180px]">ID</TableHead>
                  <TableHead className="w-[140px]">注文番号</TableHead>
                  <TableHead className="w-[140px]">注文分類</TableHead>
                  <TableHead className="w-[140px]">ステータス</TableHead>
                  <TableHead className="w-[160px]">支払いステータス</TableHead>
                  <TableHead className="w-[180px]">顧客メール</TableHead>
                  <TableHead className="w-[140px]">金額</TableHead>
                  <TableHead className="w-[180px]">注文日時</TableHead>
                  <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <TableRow key={o.id} className="border-b border-[#11111114] text-[14px]">
                      <TableCell className="pl-6 pr-3">
                        <Checkbox aria-label={`${o.displayId || o.id} を選択`} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#555555]">{o.id}</TableCell>
                      <TableCell className="text-[#111111]">{o.displayId || "-"}</TableCell>
                      <TableCell className="text-[#555555]">{o.category || "-"}</TableCell>
                      <TableCell className="text-[#555555]">{formatOrderStatus(o.status)}</TableCell>
                      <TableCell className="text-[#555555]">{formatPaymentStatus(o.paymentStatus)}</TableCell>
                      <TableCell className="text-[#555555]">{o.email || "-"}</TableCell>
                      <TableCell className="text-[#111111]">
                        {formatAmountYen(o.total)}
                      </TableCell>
                      <TableCell className="text-xs text-[#555555]">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString("ja-JP")
                          : "-"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]"
                        >
                          <Link href={`/learning-orders/${o.id}`}>
                            <Eye className="h-4 w-4" />
                            詳細
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="border-b border-[#11111114] py-10 text-center text-sm text-[#6f6f6f]"
                    >
                      まだ学習プラットフォームに関連する注文データがありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
