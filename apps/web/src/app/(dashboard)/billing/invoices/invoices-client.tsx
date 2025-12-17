"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { MonthPicker, getCurrentMonth, formatMonthDisplay } from "@/components/billing/month-picker";

export type Invoice = {
  id: string;
  customer: string;
  amount: string;
  status: string;
  issueDate: string;
};

type InvoicesClientProps = {
  invoices: Invoice[];
};

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  "発行済み": { variant: "default", label: "発行済み" },
  "下書き": { variant: "secondary", label: "下書き" },
  "送付済み": { variant: "outline", label: "送付済み" },
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function InvoicesClient({ invoices }: InvoicesClientProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter invoices by selected month
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((invoice) => {
      if (!invoice.issueDate) return false;
      const invoiceMonth = invoice.issueDate.slice(0, 7); // YYYY-MM
      return invoiceMonth === selectedMonth;
    });
  }, [invoices, selectedMonth]);

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.replace(/[¥,]/g, ""), 10) || 0;
      return sum + amount;
    }, 0);
    const draft = filteredInvoices.filter((inv) => inv.status === "下書き").length;
    const issued = filteredInvoices.filter((inv) => inv.status === "発行済み").length;
    const sent = filteredInvoices.filter((inv) => inv.status === "送付済み").length;
    return { count: filteredInvoices.length, amount: totalAmount, draft, issued, sent };
  }, [filteredInvoices]);

  // Selection handlers
  const isAllSelected = filteredInvoices.length > 0 && filteredInvoices.every((inv) => selectedIds.has(inv.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)));
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
      <div className="grid grid-cols-5 gap-4">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">総件数</p>
            <p className="text-2xl font-bold">{totals.count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">下書き</p>
            <p className="text-2xl font-bold text-gray-500">{totals.draft}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">発行済み</p>
            <p className="text-2xl font-bold text-blue-600">{totals.issued}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">送付済み</p>
            <p className="text-2xl font-bold text-green-600">{totals.sent}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">合計金額</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="invoices-select-all" className="flex items-center gap-3">
              <Checkbox
                id="invoices-select-all"
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
                一括エクスポート
              </Button>
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                新規請求書
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
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
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    {formatMonthDisplay(selectedMonth)} のデータがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusStyle = STATUS_STYLES[invoice.status] || { variant: "secondary" as const, label: invoice.status };
                  return (
                    <TableRow key={invoice.id} className="border-b border-border text-sm">
                      <TableCell className="pl-6 pr-3">
                        <Checkbox
                          aria-label={`${invoice.id} を選択`}
                          checked={selectedIds.has(invoice.id)}
                          onCheckedChange={(checked) => handleSelectOne(invoice.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{invoice.id}</TableCell>
                      <TableCell className="text-foreground">{invoice.customer}</TableCell>
                      <TableCell className="text-foreground">{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{invoice.issueDate}</TableCell>
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
                  );
                })
              )}
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="border-b border-border py-6 text-center text-sm text-muted-foreground"
                >
                  Stripe / Supabase との請求連携は今後スプリントで接続予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
            全 {filteredInvoices.length} 件
            {selectedIds.size > 0 && ` (${selectedIds.size} 件選択中)`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
