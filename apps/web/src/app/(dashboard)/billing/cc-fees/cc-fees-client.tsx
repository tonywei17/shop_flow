"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";
import { MonthPicker, getCurrentMonth, formatMonthDisplay } from "@/components/billing/month-picker";

export type CcFee = {
  id: string;
  center: string;
  members: number;
  amount: string;
  period: string;
};

type CcFeesClientProps = {
  fees: CcFee[];
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function CcFeesClient({ fees }: CcFeesClientProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter fees by selected month
  const filteredFees = React.useMemo(() => {
    const targetPeriod = formatMonthDisplay(selectedMonth);
    return fees.filter((fee) => fee.period === targetPeriod);
  }, [fees, selectedMonth]);

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalMembers = filteredFees.reduce((sum, f) => sum + f.members, 0);
    const totalAmount = filteredFees.reduce((sum, f) => {
      const amount = parseInt(f.amount.replace(/[¥,]/g, ""), 10) || 0;
      return sum + amount;
    }, 0);
    return { count: filteredFees.length, members: totalMembers, amount: totalAmount };
  }, [filteredFees]);

  // Selection handlers
  const isAllSelected = filteredFees.length > 0 && filteredFees.every((f) => selectedIds.has(f.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredFees.map((f) => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Month Picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">対象月:</span>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatMonthDisplay(selectedMonth)} のデータを表示中
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">支局数</p>
            <p className="text-2xl font-bold">{totals.count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">総会員数</p>
            <p className="text-2xl font-bold">{totals.members}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">合計請求額</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="cc-select-all" className="flex items-center gap-3">
              <Checkbox
                id="cc-select-all"
                aria-label="全て選択"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold"
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
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
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
              {filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    {formatMonthDisplay(selectedMonth)} のデータがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map((item) => (
                  <TableRow key={item.id} className="border-b border-border">
                    <TableCell className="pl-6 pr-3">
                      <Checkbox
                        aria-label={`${item.id} を選択`}
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                      />
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
                ))
              )}
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

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
            全 {filteredFees.length} 件
            {selectedIds.size > 0 && ` (${selectedIds.size} 件選択中)`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
