import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";

const memberships = [
  { id: "CC-2025-01", center: "東京第一支局", members: 58, amount: "¥116,000", period: "2025年10月" },
  { id: "CC-2025-02", center: "名古屋支局", members: 34, amount: "¥68,000", period: "2025年10月" },
  { id: "CC-2025-03", center: "大阪支局", members: 42, amount: "¥84,000", period: "2025年10月" },
];

export default function CcFeesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="CC会費管理" />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="cc-select-all" className="flex items-center gap-3">
              <Checkbox id="cc-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                CSV エクスポート
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                会費計算を更新
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
            <TableHeader>
              <TableRow className="border-b border-border text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[180px]">会費ID</TableHead>
                <TableHead className="w-[240px]">支局</TableHead>
                <TableHead className="w-[140px]">会員数</TableHead>
                <TableHead className="w-[160px]">請求額</TableHead>
                <TableHead className="w-[160px]">対象期間</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((item) => (
                <TableRow key={item.id} className="border-b border-border">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${item.id} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="text-foreground">{item.center}</TableCell>
                  <TableCell className="text-muted-foreground">{item.members}</TableCell>
                  <TableCell className="text-foreground">{item.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{item.period}</TableCell>
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
                  Stripe 連携による自動課金と会費差異アラートは次フェーズで実装予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
