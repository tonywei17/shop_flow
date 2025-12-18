"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, Zap, FileCheck, Send, CircleDollarSign, Trash2, AlertTriangle, Eye, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HighlightText } from "@/components/ui/highlight-text";
import { Label } from "@/components/ui/label";
import { MonthPicker, getPreviousMonth, formatMonthDisplay } from "@/components/billing/month-picker";
import { ClientSortableTableHead, useClientSort } from "@/components/ui/client-sortable-table-head";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoice_number: string;
  billing_month: string;
  previous_balance: number;
  material_amount: number;
  membership_amount: number;
  other_expenses_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  paid_amount: number;
  created_at: string;
  departments?: {
    id: string;
    name: string;
    store_code: string;
    type: string;
  };
}

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string; color: string }> = {
  draft: { variant: "secondary", label: "下書き", color: "text-gray-500" },
  confirmed: { variant: "default", label: "確定", color: "text-blue-600" },
  sent: { variant: "outline", label: "送付済", color: "text-green-600" },
  paid: { variant: "default", label: "支払済", color: "text-emerald-600" },
  partial_paid: { variant: "outline", label: "一部支払", color: "text-orange-500" },
  overdue: { variant: "destructive", label: "期限超過", color: "text-red-600" },
  cancelled: { variant: "secondary", label: "キャンセル", color: "text-gray-400" },
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function InvoicesClient() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getPreviousMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [generateResult, setGenerateResult] = React.useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  // Clear data dialog state
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [clearPassword, setClearPassword] = React.useState("");
  const [clearOperatorName, setClearOperatorName] = React.useState("");
  const [clearing, setClearing] = React.useState(false);
  const [clearResult, setClearResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hasClearPermission, setHasClearPermission] = React.useState(false);

  // Check if user has permission to clear data
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch("/api/admin/clear-invoices");
        if (response.ok) {
          const data = await response.json();
          setHasClearPermission(data.hasPermission);
        }
      } catch {
        setHasClearPermission(false);
      }
    };
    checkPermission();
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invoices?billing_month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);

    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing_month: selectedMonth }),
      });

      const result = await response.json();

      if (response.ok) {
        setGenerateResult({
          success: true,
          message: `請求書を ${result.success_count} 件生成しました`,
          count: result.success_count,
        });
        fetchData();
      } else {
        setGenerateResult({
          success: false,
          message: result.error || "生成に失敗しました",
        });
      }
    } catch (error) {
      setGenerateResult({
        success: false,
        message: "生成中にエラーが発生しました",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handle clear data
  const handleClearData = async (clearAll: boolean) => {
    setClearing(true);
    setClearResult(null);

    try {
      const response = await fetch("/api/admin/clear-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: clearPassword,
          billing_month: clearAll ? null : selectedMonth,
          clear_all: clearAll,
          operator_name: clearOperatorName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setClearResult({
          success: true,
          message: result.message,
        });
        setClearPassword("");
        fetchData();
      } else {
        setClearResult({
          success: false,
          message: result.error || "削除に失敗しました",
        });
      }
    } catch {
      setClearResult({
        success: false,
        message: "削除中にエラーが発生しました",
      });
    } finally {
      setClearing(false);
    }
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const draft = invoices.filter((inv) => inv.status === "draft").length;
    const confirmed = invoices.filter((inv) => inv.status === "confirmed").length;
    const sent = invoices.filter((inv) => inv.status === "sent").length;
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    return { count: invoices.length, amount: totalAmount, draft, confirmed, sent, paid };
  }, [invoices]);

  // Filter invoices based on search term
  const filteredInvoices = React.useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const term = searchTerm.toLowerCase().trim();
    return invoices.filter((inv) => {
      const invoiceNumber = inv.invoice_number?.toLowerCase() || "";
      const departmentName = inv.departments?.name?.toLowerCase() || "";
      const storeCode = inv.departments?.store_code?.toLowerCase() || "";
      return invoiceNumber.includes(term) || departmentName.includes(term) || storeCode.includes(term);
    });
  }, [invoices, searchTerm]);

  // Sorting
  const { sortConfig, handleSort, sortedData: sortedInvoices } = useClientSort(filteredInvoices, "invoice_number", "asc");

  // Selection handlers
  const isAllSelected = sortedInvoices.length > 0 && sortedInvoices.every((inv) => selectedIds.has(inv.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
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
      {/* Month Picker & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">対象月分:</span>
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <p className="text-xs text-muted-foreground ml-1">
            ※「月分」は該当月内に発生したデータの請求期間を指します
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Clear Data Dialog - SuperAdmin Only */}
          {hasClearPermission && (
            <Dialog open={clearDialogOpen} onOpenChange={(open) => {
              setClearDialogOpen(open);
              if (!open) {
                setClearPassword("");
                setClearOperatorName("");
                setClearResult(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  データ削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    請求書データ削除（テスト用）
                  </DialogTitle>
                  <DialogDescription>
                    この操作は取り消せません。削除されたデータは復元できません。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>警告:</strong> この機能はシステムテスト期間中のみ使用してください。
                      本番運用開始後は使用しないでください。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clear-invoice-operator-name">操作者氏名（実名） <span className="text-red-500">*</span></Label>
                    <Input
                      id="clear-invoice-operator-name"
                      type="text"
                      placeholder="山田 太郎"
                      value={clearOperatorName}
                      onChange={(e) => setClearOperatorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clear-password">管理者パスワード <span className="text-red-500">*</span></Label>
                    <Input
                      id="clear-password"
                      type="password"
                      placeholder="パスワードを入力"
                      value={clearPassword}
                      onChange={(e) => setClearPassword(e.target.value)}
                    />
                  </div>
                  {clearResult && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        clearResult.success
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {clearResult.message}
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleClearData(false)}
                    disabled={clearing || !clearPassword || !clearOperatorName || clearOperatorName.trim().length < 2}
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      `${formatMonthDisplay(selectedMonth)} のみ削除`
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleClearData(true)}
                    disabled={clearing || !clearPassword || !clearOperatorName || clearOperatorName.trim().length < 2}
                    className="bg-red-700 hover:bg-red-800"
                  >
                    {clearing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      "全データ削除"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                一括生成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>請求書一括生成</DialogTitle>
                <DialogDescription>
                  {formatMonthDisplay(selectedMonth)} の請求書を全支局に対して一括生成します。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  以下の項目を集計して請求書を生成します：
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    前月未払残高
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    教材費（請求書払い分）
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    CC会員費（口座振替除く）
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    その他費用（承認済み）
                  </li>
                </ul>
                {generateResult && (
                  <div
                    className={`mt-4 p-3 rounded-md text-sm ${
                      generateResult.success
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {generateResult.message}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    "生成実行"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <p className="text-sm">総件数</p>
            </div>
            <p className="text-2xl font-bold">{totals.count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">下書き</p>
            <p className="text-2xl font-bold text-gray-500">{totals.draft}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Send className="h-4 w-4" />
              <p className="text-sm">送付済</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{totals.sent}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CircleDollarSign className="h-4 w-4" />
              <p className="text-sm">支払済</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{totals.paid}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">合計金額</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 px-6 py-3 text-sm text-foreground lg:flex-row lg:items-center lg:justify-between">
            <label htmlFor="invoices-select-all" className="flex items-center gap-3">
              <Checkbox
                id="invoices-select-all"
                aria-label="全て選択"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span>全て選択</span>
            </label>
            <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
              {/* Search Input */}
              <div className="relative w-full min-w-[260px] max-w-[360px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="請求書番号・支局名で検索"
                  className="pl-9 pr-9"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {selectedIds.size > 0 && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/invoices/generate-pdf-batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ invoice_ids: Array.from(selectedIds) }),
                      });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `invoices_${selectedMonth}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }
                    } catch (error) {
                      console.error("PDF download error:", error);
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  PDF一括ダウンロード ({selectedIds.size}件)
                </Button>
              )}
              <Button
                variant="outline"
                className="flex items-center gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold"
              >
                <Download className="h-4 w-4" />
                一括エクスポート
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <ClientSortableTableHead sortKey="invoice_number" sortConfig={sortConfig} onSort={handleSort} className="w-[160px]">
                  請求書番号
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="departments.name" sortConfig={sortConfig} onSort={handleSort} className="w-[200px]">
                  支局
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="total_amount" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  合計金額
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  ステータス
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="due_date" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  支払期限
                </ClientSortableTableHead>
                <TableHead className="w-[100px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : sortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    {formatMonthDisplay(selectedMonth)} の請求書がありません。
                    <br />
                    <span className="text-xs">「一括生成」ボタンで請求書を生成してください。</span>
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvoices.map((invoice) => {
                  const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.draft;
                  return (
                    <TableRow key={invoice.id} className="border-b border-border text-sm">
                      <TableCell className="pl-6 pr-3">
                        <Checkbox
                          aria-label={`${invoice.invoice_number} を選択`}
                          checked={selectedIds.has(invoice.id)}
                          onCheckedChange={(checked) => handleSelectOne(invoice.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <HighlightText text={invoice.invoice_number} searchTerm={searchTerm} />
                      </TableCell>
                      <TableCell className="text-foreground">
                        <HighlightText text={invoice.departments?.name || "-"} searchTerm={searchTerm} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.due_date || "-"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => {
                              window.open(`/api/invoices/${invoice.id}/preview`, "_blank");
                            }}
                            title="プレビュー"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                          >
                            詳細
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
            全 {invoices.length} 件{searchTerm && ` (検索結果: ${filteredInvoices.length} 件)`}
            {selectedIds.size > 0 && ` (${selectedIds.size} 件選択中)`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
