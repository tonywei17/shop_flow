import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const invoices = [
  { id: "INV-2025-001", customer: "全国教室会費", amount: "¥45,000", status: "発行済み", issueDate: "2025-10-05" },
  { id: "INV-2025-002", customer: "教材販売", amount: "¥128,800", status: "下書き", issueDate: "2025-10-07" },
  { id: "INV-2025-003", customer: "研修受講料", amount: "¥72,000", status: "送付済み", issueDate: "2025-10-09" },
];

export default function BillingInvoicesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="請求一覧" />
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="invoices-select-all" className="flex items-center gap-3">
              <Checkbox id="invoices-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                一括エクスポート
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                新規請求書
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[180px]">請求書番号</TableHead>
                <TableHead className="w-[240px]">顧客/項目</TableHead>
                <TableHead className="w-[140px]">金額</TableHead>
                <TableHead className="w-[140px]">ステータス</TableHead>
                <TableHead className="w-[160px]">発行日</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-b border-[#11111114] text-[14px]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${invoice.id} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#555555]">{invoice.id}</TableCell>
                  <TableCell className="text-[#111111]">{invoice.customer}</TableCell>
                  <TableCell className="text-[#111111]">{invoice.amount}</TableCell>
                  <TableCell className="text-[#555555]">{invoice.status}</TableCell>
                  <TableCell className="text-[#555555]">{invoice.issueDate}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" className="text-[#00ac4d] hover:bg-[#00ac4d14]">
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7} className="border-b border-[#11111114] py-6 text-center text-sm text-[#6f6f6f]">
                  Stripe / Supabase との請求連携は今後スプリントで接続予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
