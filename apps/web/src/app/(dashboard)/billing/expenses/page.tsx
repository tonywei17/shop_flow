import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle } from "lucide-react";

const expenses = [
  { id: "EXP-2025-01", category: "教材制作費", amount: "¥52,300", requestedBy: "山田 太郎", status: "承認済み" },
  { id: "EXP-2025-02", category: "会場費", amount: "¥88,000", requestedBy: "佐藤 花子", status: "承認待ち" },
  { id: "EXP-2025-03", category: "交通費", amount: "¥12,400", requestedBy: "高橋 健", status: "差し戻し" },
];

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="その他費用管理" />

      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="expenses-select-all" className="flex items-center gap-3">
              <Checkbox id="expenses-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                精算一覧を出力
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                新規申請
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
            <TableHeader>
              <TableRow className="border-b border-border text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[200px]">申請ID</TableHead>
                <TableHead className="w-[240px]">費目</TableHead>
                <TableHead className="w-[140px]">金額</TableHead>
                <TableHead className="w-[200px]">申請者</TableHead>
                <TableHead className="w-[160px]">ステータス</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id} className="border-b border-border">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${exp.id} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{exp.id}</TableCell>
                  <TableCell className="text-foreground">{exp.category}</TableCell>
                  <TableCell className="text-foreground">{exp.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{exp.requestedBy}</TableCell>
                  <TableCell className="text-muted-foreground">{exp.status}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                    >
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="border-b border-border py-6 text-center text-sm text-muted-foreground"
                >
                  承認フローや領収書画像アップロードは次フェーズで実装予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
