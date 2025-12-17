"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, PlusCircle, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { CreateExpenseDialog } from "./create-expense-dialog";
import { ImportExpenseDialog } from "./import-expense-dialog";
import { MonthPicker, getCurrentMonth, formatMonthDisplay } from "@/components/billing/month-picker";
import { buildVisiblePages } from "@/lib/pagination";
import { ClientSortableTableHead, useClientSort } from "@/components/ui/client-sortable-table-head";
import { useUser } from "@/contexts/user-context";

type Reviewer = {
  id: string;
  account_id: string;
  display_name: string;
  department_name: string | null;
  is_admin: boolean;
};

export type Expense = {
  id: string;
  store_code: string;
  store_name: string;
  expense_date: string;
  account_item_code: string;
  description: string;
  expense_type: string;
  amount: number;
  review_status: string;
  reviewer_account_id: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  import_source: string | null;
  invoice_month: string | null;
  created_at: string;
};

export type AccountItem = {
  id: string;
  code: string;
  name: string;
};

type ExpensesClientProps = {
  expenses: Expense[];
  accountItems: AccountItem[];
  error: string | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "審査待ち", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "承認済み", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "差し戻し", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export function ExpensesClient({ expenses, accountItems, error }: ExpensesClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(20);

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);

  // Edit sheet state
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    store_code: "",
    store_name: "",
    expense_date: "",
    account_item_code: "",
    description: "",
    expense_type: "課税分",
    amount: "",
    reviewer_account_id: "",
  });

  // Edit form - store lookup state
  const [editIsLoadingStore, setEditIsLoadingStore] = React.useState(false);
  const [editStoreNotFound, setEditStoreNotFound] = React.useState(false);

  // Edit form - reviewer state
  const [editReviewers, setEditReviewers] = React.useState<Reviewer[]>([]);
  const [editIsLoadingReviewers, setEditIsLoadingReviewers] = React.useState(false);

  // Edit form - account item input state
  const [editAccountItemInput, setEditAccountItemInput] = React.useState("");
  const [editShowAccountItemDropdown, setEditShowAccountItemDropdown] = React.useState(false);
  const editAccountItemInputRef = React.useRef<HTMLInputElement>(null);

  // Filter account items for edit form
  const editFilteredAccountItems = React.useMemo(() => {
    if (!editAccountItemInput.trim()) return accountItems;
    const query = editAccountItemInput.toLowerCase();
    return accountItems.filter(
      (item) =>
        item.code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
  }, [accountItems, editAccountItemInput]);

  // Get selected account item for edit form
  const editSelectedAccountItem = React.useMemo(() => {
    return accountItems.find((item) => item.code === editForm.account_item_code);
  }, [accountItems, editForm.account_item_code]);


  // Filter expenses
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          expense.store_code.toLowerCase().includes(query) ||
          expense.store_name.toLowerCase().includes(query) ||
          expense.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && expense.review_status !== statusFilter) {
        return false;
      }

      // Month filter - always filter by selected month
      const expenseMonth = expense.invoice_month || 
        (expense.expense_date ? new Date(expense.expense_date).toISOString().slice(0, 7) : null);
      if (expenseMonth !== selectedMonth) return false;

      return true;
    });
  }, [expenses, searchQuery, statusFilter, selectedMonth]);

  // Selection handlers
  const isAllSelected = filteredExpenses.length > 0 && filteredExpenses.every((e) => selectedIds.has(e.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
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

  // Calculate totals
  const totals = React.useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const pending = filteredExpenses.filter((e) => e.review_status === "pending").length;
    const approved = filteredExpenses.filter((e) => e.review_status === "approved").length;
    const rejected = filteredExpenses.filter((e) => e.review_status === "rejected").length;
    return { total, pending, approved, rejected, count: filteredExpenses.length };
  }, [filteredExpenses]);

  // Sorting
  const { sortConfig, handleSort, sortedData: sortedExpenses } = useClientSort(filteredExpenses, "expense_date", "desc");

  // Pagination calculations
  const totalPages = Math.ceil(sortedExpenses.length / pageSize);
  const paginatedExpenses = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedExpenses.slice(startIndex, startIndex + pageSize);
  }, [sortedExpenses, currentPage, pageSize]);

  const visiblePages = buildVisiblePages(currentPage, totalPages);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedMonth]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmed = window.confirm(`${selectedIds.size} 件のデータを削除しますか？`);
    if (!confirmed) return;

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/expenses/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = data?.error || `削除に失敗しました (status ${response.status})`;
          toast.error(message);
          return;
        }
      }
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} 件のデータを削除しました`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "一括削除に失敗しました";
      toast.error(message);
    }
  };

  // Review handlers
  const handleBulkReview = async (action: "approve" | "reject") => {
    if (selectedIds.size === 0) return;

    // Get only pending items from selection
    const pendingIds = Array.from(selectedIds).filter((id) => {
      const expense = expenses.find((e) => e.id === id);
      return expense?.review_status === "pending";
    });

    if (pendingIds.length === 0) {
      toast.error("審査待ちの項目を選択してください");
      return;
    }

    const actionLabel = action === "approve" ? "承認" : "差し戻し";
    const confirmed = window.confirm(`${pendingIds.length} 件のデータを${actionLabel}しますか？`);
    if (!confirmed) return;

    try {
      if (!user?.id) {
        toast.error("ログインが必要です");
        return;
      }

      const response = await fetch("/api/expenses/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_ids: pendingIds,
          action: action,
          reviewer_account_id: user.id,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || `${actionLabel}に失敗しました`;
        toast.error(message);
        return;
      }

      setSelectedIds(new Set());
      toast.success(`${pendingIds.length} 件のデータを${actionLabel}しました`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : `${actionLabel}に失敗しました`;
      toast.error(message);
    }
  };

  // Check if any selected items are pending (for enabling review buttons)
  const hasPendingSelected = React.useMemo(() => {
    return Array.from(selectedIds).some((id) => {
      const expense = expenses.find((e) => e.id === id);
      return expense?.review_status === "pending";
    });
  }, [selectedIds, expenses]);

  // Single item review status change handler
  const handleSingleReviewStatusChange = async (expenseId: string, newStatus: string) => {
    if (!user?.id) {
      toast.error("ログインが必要です");
      return;
    }

    // Map status to action
    const action = newStatus === "approved" ? "approve" : newStatus === "rejected" ? "reject" : null;
    if (!action && newStatus !== "pending") {
      return;
    }

    // If changing to pending, we need a different approach - reset the status
    if (newStatus === "pending") {
      try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_status: "pending",
            reviewer_account_id: null,
            reviewed_at: null,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          toast.error(data?.error || "ステータスの変更に失敗しました");
          return;
        }

        toast.success("ステータスを審査待ちに変更しました");
        router.refresh();
      } catch (error) {
        toast.error("ステータスの変更に失敗しました");
      }
      return;
    }

    try {
      const response = await fetch("/api/expenses/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_ids: [expenseId],
          action: action,
          reviewer_account_id: user.id,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error || "ステータスの変更に失敗しました");
        return;
      }

      const statusLabel = newStatus === "approved" ? "承認済み" : "差し戻し";
      toast.success(`ステータスを${statusLabel}に変更しました`);
      router.refresh();
    } catch (error) {
      toast.error("ステータスの変更に失敗しました");
    }
  };

  // Export handlers
  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && selectedIds.size === 0) return;
    const base = "/api/expenses/export-csv";
    const params = new URLSearchParams();
    
    if (mode === "selected" && selectedIds.size > 0) {
      params.set("ids", Array.from(selectedIds).join(","));
    } else {
      // Export all filtered data for current month
      params.set("month", selectedMonth);
    }
    
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  // Detail view handler
  const handleViewDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetailDialogOpen(true);
  };

  // Edit form - store lookup effect
  React.useEffect(() => {
    if (!editSheetOpen) return;
    if (!editForm.store_code.trim()) {
      setEditStoreNotFound(false);
      return;
    }

    // Skip lookup if store_name is already set (initial load)
    if (editingExpense && editForm.store_code === editingExpense.store_code && editForm.store_name) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setEditIsLoadingStore(true);
      setEditStoreNotFound(false);
      try {
        const response = await fetch(`/api/departments/lookup?code=${encodeURIComponent(editForm.store_code.trim())}`);
        const data = await response.json();
        if (data.department) {
          setEditForm((prev) => ({ ...prev, store_name: data.department.name }));
          setEditStoreNotFound(false);
        } else {
          setEditForm((prev) => ({ ...prev, store_name: "" }));
          setEditStoreNotFound(true);
        }
      } catch (error) {
        console.error("Failed to lookup store:", error);
        setEditStoreNotFound(true);
      } finally {
        setEditIsLoadingStore(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editForm.store_code, editSheetOpen, editingExpense]);

  // Edit form - account item handlers
  const handleEditSelectAccountItem = (item: AccountItem) => {
    setEditForm((prev) => ({ ...prev, account_item_code: item.code }));
    setEditAccountItemInput(item.code);
    setEditShowAccountItemDropdown(false);
  };

  const handleEditAccountItemInputChange = (value: string) => {
    setEditAccountItemInput(value);
    setEditShowAccountItemDropdown(true);
    
    const exactMatch = accountItems.find((item) => item.code === value.trim());
    if (exactMatch) {
      setEditForm((prev) => ({ ...prev, account_item_code: exactMatch.code }));
    } else {
      setEditForm((prev) => ({ ...prev, account_item_code: "" }));
    }
  };

  // Edit form - fetch reviewers effect
  React.useEffect(() => {
    if (editSheetOpen && editReviewers.length === 0) {
      setEditIsLoadingReviewers(true);
      fetch("/api/expenses/reviewers")
        .then((res) => res.json())
        .then((data) => {
          if (data.reviewers) {
            setEditReviewers(data.reviewers);
          }
        })
        .catch((err) => console.error("Failed to fetch reviewers:", err))
        .finally(() => setEditIsLoadingReviewers(false));
    }
  }, [editSheetOpen, editReviewers.length]);

  // Edit handlers
  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      store_code: expense.store_code,
      store_name: expense.store_name,
      expense_date: expense.expense_date,
      account_item_code: expense.account_item_code,
      description: expense.description,
      expense_type: expense.expense_type,
      amount: String(expense.amount),
      reviewer_account_id: expense.reviewer_account_id || "",
    });
    setEditAccountItemInput(expense.account_item_code);
    setEditStoreNotFound(false);
    setEditSheetOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingExpense) return;
    if (isSubmitting) return;

    // Validation
    if (!editForm.store_code.trim()) {
      toast.error("店番を入力してください");
      return;
    }
    if (!editForm.store_name.trim()) {
      toast.error("店名を入力してください");
      return;
    }
    if (!editForm.expense_date) {
      toast.error("費用発生日を選択してください");
      return;
    }
    if (!editForm.account_item_code) {
      toast.error("勘定項目を選択してください");
      return;
    }
    if (!editForm.description.trim()) {
      toast.error("項目名を入力してください");
      return;
    }
    if (!editForm.amount || isNaN(parseFloat(editForm.amount))) {
      toast.error("有効な金額を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_code: editForm.store_code.trim(),
          store_name: editForm.store_name.trim(),
          expense_date: editForm.expense_date,
          account_item_code: editForm.account_item_code,
          description: editForm.description.trim(),
          expense_type: editForm.expense_type,
          amount: parseFloat(editForm.amount),
          reviewer_account_id: editForm.reviewer_account_id || null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "更新に失敗しました");
      }

      toast.success("費用を更新しました");
      setEditSheetOpen(false);
      setEditingExpense(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single delete handler
  const handleSingleDelete = async (expense: Expense) => {
    const confirmed = window.confirm(`「${expense.description}」を削除しますか？`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error || "削除に失敗しました");
        return;
      }

      toast.success("費用を削除しました");
      router.refresh();
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  if (error) {
    return (
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Picker */}
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
            <p className="text-sm text-muted-foreground">審査待ち</p>
            <p className="text-2xl font-bold text-yellow-600">{totals.pending}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">承認済み</p>
            <p className="text-2xl font-bold text-green-600">{totals.approved}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">差し戻し</p>
            <p className="text-2xl font-bold text-red-600">{totals.rejected}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">合計金額</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="expenses-select-all"
                aria-label="全て選択"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">全て選択</span>
              <Input
                placeholder="店番・店名・項目名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[280px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="pending">審査待ち</SelectItem>
                  <SelectItem value="approved">承認済み</SelectItem>
                  <SelectItem value="rejected">差し戻し</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold">
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportCsv("all")}>
                    {selectedMonth} のデータをエクスポート (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={selectedIds.size === 0}
                    className={selectedIds.size === 0 ? "text-muted-foreground opacity-50 cursor-not-allowed" : undefined}
                    onClick={() => handleExportCsv("selected")}
                  >
                    選択中のデータをエクスポート ({selectedIds.size}件)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ImportExpenseDialog 
                accountItems={accountItems}
                onImportComplete={() => router.refresh()}
              />
              <CreateExpenseDialog
                accountItems={accountItems}
                onExpenseCreated={() => router.refresh()}
              />
            </div>
          </div>

          {/* Table */}
          <Table stickyHeader maxHeight="calc(100vh - 380px)" className="[&_th]:py-3 [&_td]:py-3 text-sm">
            <TableHeader sticky>
              <TableRow className="border-b border-border">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <ClientSortableTableHead sortKey="store_code" sortConfig={sortConfig} onSort={handleSort} className="w-[240px] text-sm">
                  店番/店名
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="expense_date" sortConfig={sortConfig} onSort={handleSort} className="w-[85px] text-sm">
                  発生日
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="account_item_code" sortConfig={sortConfig} onSort={handleSort} className="w-[240px] text-sm">
                  勘定項目/項目名
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="expense_type" sortConfig={sortConfig} onSort={handleSort} className="w-[70px] text-sm">
                  費用タイプ
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="amount" sortConfig={sortConfig} onSort={handleSort} className="w-[100px] text-right text-sm">
                  金額
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="review_status" sortConfig={sortConfig} onSort={handleSort} className="w-[100px] text-sm">
                  ステータス
                </ClientSortableTableHead>
                <TableHead className="w-[60px] pr-3 text-right text-sm">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                paginatedExpenses.map((expense) => {
                  const status = STATUS_MAP[expense.review_status] || STATUS_MAP.pending;
                  return (
                    <TableRow key={expense.id} className="border-b border-border">
                      <TableCell className="pl-6 pr-3 py-2">
                        <Checkbox
                          aria-label={`${expense.store_code} を選択`}
                          checked={selectedIds.has(expense.id)}
                          onCheckedChange={(checked) => handleSelectOne(expense.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="py-2 text-sm max-w-[240px]">
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <div className="font-mono text-sm text-muted-foreground">{expense.store_code}</div>
                          <div className="truncate text-sm" title={expense.store_name}>{expense.store_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(expense.expense_date)}</TableCell>
                      <TableCell className="py-2 text-sm max-w-[240px]">
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <div className="font-mono text-sm text-muted-foreground">{expense.account_item_code}</div>
                          <div className="truncate text-sm" title={expense.description}>{expense.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="text-sm px-2 py-0.5">
                          {expense.expense_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono text-sm ${expense.amount < 0 ? "text-red-600" : ""}`}>
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge 
                              variant={status.variant} 
                              className="gap-0.5 text-sm px-2 py-0.5 cursor-pointer hover:opacity-80"
                            >
                              {status.icon}
                              {status.label}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => handleSingleReviewStatusChange(expense.id, "pending")}
                              disabled={expense.review_status === "pending"}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              審査待ち
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSingleReviewStatusChange(expense.id, "approved")}
                              disabled={expense.review_status === "approved"}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              承認済み
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSingleReviewStatusChange(expense.id, "rejected")}
                              disabled={expense.review_status === "rejected"}
                              className="text-orange-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              差し戻し
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="pr-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(expense)}>
                              <Eye className="mr-2 h-4 w-4" />
                              詳細
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleSingleDelete(expense)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Footer with Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs text-destructive border-destructive/40"
                disabled={selectedIds.size === 0}
                onClick={handleBulkDelete}
              >
                一括削除
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs text-green-600 border-green-600/40 hover:bg-green-50"
                disabled={!hasPendingSelected}
                onClick={() => handleBulkReview("approve")}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                一括承認
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs text-orange-600 border-orange-600/40 hover:bg-orange-50"
                disabled={!hasPendingSelected}
                onClick={() => handleBulkReview("reject")}
              >
                <XCircle className="mr-1 h-3 w-3" />
                一括差し戻し
              </Button>
              <p className="text-xs text-muted-foreground">
                全 {filteredExpenses.length} 件（{currentPage} / {totalPages || 1} ページ）
                {selectedIds.size > 0 && ` - ${selectedIds.size} 件選択中`}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
              <div className="flex items-center gap-2">
                <span>表示件数:</span>
                <div className="flex items-center gap-1">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      size="sm"
                      variant={pageSize === size ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageSizeChange(size)}
                    >
                      {size}件
                    </Button>
                  ))}
                </div>
              </div>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className="px-2"
                      aria-disabled={currentPage <= 1}
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                    />
                  </PaginationItem>
                  {visiblePages.map((pageNumber, index) => {
                    const isActive = pageNumber === currentPage;
                    const prevPage = visiblePages[index - 1];
                    const showEllipsis = index > 0 && pageNumber - (prevPage ?? 0) > 1;
                    return (
                      <React.Fragment key={`page-${pageNumber}`}>
                        {showEllipsis ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            aria-current={isActive ? "page" : undefined}
                            className="min-w-[36px]"
                            onClick={(event) => {
                              event.preventDefault();
                              if (!isActive) {
                                setCurrentPage(pageNumber);
                              }
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="px-2"
                      aria-disabled={currentPage >= totalPages}
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>費用詳細</DialogTitle>
            <DialogDescription>
              費用の詳細情報を表示しています。
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">店番</Label>
                  <p className="font-mono">{selectedExpense.store_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">店名</Label>
                  <p>{selectedExpense.store_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">費用発生日</Label>
                  <p>{formatDate(selectedExpense.expense_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">請求月</Label>
                  <p>{selectedExpense.invoice_month || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">勘定項目</Label>
                  <p className="font-mono">{selectedExpense.account_item_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">費用タイプ</Label>
                  <p>{selectedExpense.expense_type}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">項目名</Label>
                <p>{selectedExpense.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">金額</Label>
                  <p className={`text-lg font-bold ${selectedExpense.amount < 0 ? "text-red-600" : ""}`}>
                    {formatCurrency(selectedExpense.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">審査ステータス</Label>
                  <Badge variant={STATUS_MAP[selectedExpense.review_status]?.variant || "secondary"} className="mt-1">
                    {STATUS_MAP[selectedExpense.review_status]?.icon}
                    {STATUS_MAP[selectedExpense.review_status]?.label || selectedExpense.review_status}
                  </Badge>
                </div>
              </div>
              {selectedExpense.reviewed_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">審査日時</Label>
                    <p className="text-sm">{new Date(selectedExpense.reviewed_at).toLocaleString("ja-JP")}</p>
                  </div>
                  {selectedExpense.review_note && (
                    <div>
                      <Label className="text-muted-foreground text-xs">審査メモ</Label>
                      <p className="text-sm">{selectedExpense.review_note}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">インポート元</Label>
                  <p className="text-sm">{selectedExpense.import_source || "手動入力"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">作成日時</Label>
                  <p className="text-sm">{new Date(selectedExpense.created_at).toLocaleString("ja-JP")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="flex w-full max-w-[480px] flex-col overflow-y-auto p-0 sm:w-[480px]">
          <div className="flex flex-1 flex-col">
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle className="text-[18px] font-semibold text-foreground">
                費用の編集
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="edit-store-code">店番 <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="edit-store-code"
                    value={editForm.store_code}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, store_code: e.target.value, store_name: "" }))}
                    placeholder="例: 1110004"
                    className={cn(editStoreNotFound && "border-orange-500")}
                  />
                  {editIsLoadingStore && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {editStoreNotFound && (
                  <p className="text-xs text-orange-500">該当する店舗が見つかりません</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-store-name">店名</Label>
                <Input
                  id="edit-store-name"
                  value={editForm.store_name}
                  readOnly
                  placeholder="店番を入力すると自動入力されます"
                  className="bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expense-date">費用発生日 <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-expense-date"
                    type="date"
                    value={editForm.expense_date}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-account-item">勘定項目 <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="edit-account-item"
                      ref={editAccountItemInputRef}
                      placeholder="例: 700"
                      value={editAccountItemInput}
                      onChange={(e) => handleEditAccountItemInputChange(e.target.value)}
                      onFocus={() => setEditShowAccountItemDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setEditShowAccountItemDropdown(false), 200);
                      }}
                      className={cn(
                        editForm.account_item_code && "border-green-500",
                        !editForm.account_item_code && editAccountItemInput && "border-orange-500"
                      )}
                    />
                    {editShowAccountItemDropdown && editFilteredAccountItems.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                        {editFilteredAccountItems.slice(0, 10).map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                              editForm.account_item_code === item.code && "bg-accent"
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleEditSelectAccountItem(item);
                            }}
                          >
                            <span className="font-mono text-muted-foreground">{item.code}</span>
                            <span className="ml-2">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {editForm.account_item_code && editSelectedAccountItem && (
                    <p className="text-xs text-green-600">
                      {editSelectedAccountItem.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">項目名 <span className="text-destructive">*</span></Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="勘定項目名が自動入力されますが、自由に編集できます"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">勘定項目名が自動入力されますが、自由に編集できます</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expense-type">費用タイプ <span className="text-destructive">*</span></Label>
                  <Select
                    value={editForm.expense_type}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, expense_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="課税分">課税分</SelectItem>
                      <SelectItem value="非課税分">非課税分</SelectItem>
                      <SelectItem value="調整・返金">調整・返金</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">金額 <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="例: -3960"
                  />
                  <p className="text-xs text-muted-foreground">マイナス値も入力可能</p>
                </div>
              </div>

              {/* Reviewer Selection */}
              <div className="space-y-2">
                <Label>審査者（任意）</Label>
                <Select value={editForm.reviewer_account_id || "none"} onValueChange={(val) => setEditForm((prev) => ({ ...prev, reviewer_account_id: val === "none" ? "" : val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={editIsLoadingReviewers ? "読み込み中..." : "審査者を選択..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">指定なし</SelectItem>
                    {editReviewers.map((reviewer) => (
                      <SelectItem key={reviewer.id} value={reviewer.id}>
                        {reviewer.display_name}
                        {reviewer.department_name && ` (${reviewer.department_name})`}
                        {reviewer.is_admin && " [管理者]"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">本部または管理者アカウントを審査者として指定できます</p>
              </div>
            </div>
            <SheetFooter className="mt-auto border-t border-border px-6 py-4">
              <div className="flex w-full justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditSheetOpen(false)}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button onClick={handleEditSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存する"}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
