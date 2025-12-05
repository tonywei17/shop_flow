import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Eye, Download } from "lucide-react";

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
    <div className="space-y-6">
      <DashboardHeader title="学習プラットフォーム注文一覧" />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* テーブルヘッダー */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <Checkbox id="learning-orders-select-all" aria-label="全て選択" />
              <span className="text-sm text-muted-foreground">全て選択</span>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="注文番号・メールで検索" className="w-[200px]" />
              <Select defaultValue="__all__">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="pending">保留</SelectItem>
                  <SelectItem value="canceled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">検索</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
            </div>
          </div>

          {error ? (
            <div className="px-6 py-10 text-sm text-destructive">{error}</div>
          ) : (
            <Table className="[&_th]:py-3 [&_td]:py-3">
              <TableHeader>
                <TableRow className="border-b border-border text-sm text-foreground">
                  <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[36px] pl-6 pr-3 cursor-default hover:bg-transparent">
                    <Checkbox aria-label="行を選択" />
                  </SortableTableHead>
                  <SortableTableHead sortKey="id" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[180px]">
                    ID
                  </SortableTableHead>
                  <SortableTableHead sortKey="displayId" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[140px]">
                    注文番号
                  </SortableTableHead>
                  <SortableTableHead sortKey="category" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[140px]">
                    注文分類
                  </SortableTableHead>
                  <SortableTableHead sortKey="status" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[140px]">
                    ステータス
                  </SortableTableHead>
                  <SortableTableHead sortKey="paymentStatus" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[160px]">
                    支払いステータス
                  </SortableTableHead>
                  <SortableTableHead sortKey="email" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[180px]">
                    顧客メール
                  </SortableTableHead>
                  <SortableTableHead sortKey="total" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[140px]">
                    金額
                  </SortableTableHead>
                  <SortableTableHead sortKey="createdAt" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[180px]">
                    注文日時
                  </SortableTableHead>
                  <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[120px] pr-6 text-right cursor-default hover:bg-transparent">
                    操作
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <TableRow key={o.id} className="border-b border-border text-sm hover:bg-muted/60">
                      <TableCell className="pl-6 pr-3">
                        <Checkbox aria-label={`${o.displayId || o.id} を選択`} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                      <TableCell className="text-foreground">{o.displayId || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{o.category || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatOrderStatus(o.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatPaymentStatus(o.paymentStatus)}</TableCell>
                      <TableCell className="text-muted-foreground">{o.email || "-"}</TableCell>
                      <TableCell className="text-foreground">
                        {formatAmountYen(o.total)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString("ja-JP")
                          : "-"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-1 px-2 py-1 text-primary hover:bg-primary/10"
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
                      className="border-b border-border py-10 text-center text-sm text-muted-foreground"
                    >
                      まだ学習プラットフォームに関連する注文データがありません。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* フッター */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
              一括削除
            </Button>
            <div className="text-sm text-muted-foreground">
              全 {orders.length} 件 (1/1ページ)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">表示件数:</span>
                <div className="flex gap-1">
                  {[20, 50, 100].map((size) => (
                    <Button key={size} variant={size === 20 ? "default" : "outline"} size="sm" className="h-7 px-2 text-xs">
                      {size}件
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled>前へ</Button>
                <span className="px-2 text-sm">1</span>
                <Button variant="ghost" size="sm" disabled>次へ</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
