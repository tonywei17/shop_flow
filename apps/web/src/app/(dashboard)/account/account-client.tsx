'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminAccount, RoleRecord, DepartmentWithParent } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Edit, Plus } from "lucide-react";
import { ManagementDrawer } from "@/components/dashboard/management-drawer";
import { buildVisiblePages, updatePaginationSearchParams } from "@/lib/pagination";
import {
  SortableTableHead,
  updateSortSearchParams,
  type SortOrder as SortOrderType,
} from "@/components/ui/sortable-table-head";

const ACCOUNTS_SELECTION_STORAGE_KEY = "accounts_selected_ids";

export type SortOrder = "asc" | "desc" | null;

export type AccountsPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  scope: string;
  status: string;
  sortKey: string | null;
  sortOrder: SortOrder;
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  有効: { label: "有効", className: "bg-[#e5f5ec] text-[#00ac4d]" },
  無効: { label: "無効", className: "bg-[#fff0f0] text-[#d82b2b]" },
  停止中: { label: "停止中", className: "bg-[#fff5e6] text-[#d9822b]" },
};

function getStatusBadge(status: string | null | undefined) {
  if (!status) return { label: "未設定", className: "bg-[#f4f4f5] text-[#6b7280]" };
  return statusBadgeMap[status] ?? { label: status, className: "bg-[#f4f4f5] text-[#6b7280]" };
}

type AccountFormState = {
  accountId: string;
  status: boolean;
  displayName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  department: string;
  delegateBilling: boolean;
  priceDisplay: string;
  facility: string;
  representative: string;
};


const priceDisplayOptions = [
  { value: "hq", label: "本部価格" },
  { value: "branch", label: "支局価格" },
  { value: "hidden", label: "非表示" },
];

function createFormState(account?: AdminAccount): AccountFormState {
  return {
    accountId: account?.account_id ?? "",
    status: account ? account.status === "有効" : true,
    displayName: account?.display_name ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    password: "",
    role: account?.role_code ?? "",
    department: account?.department_name ?? "",
    delegateBilling: account?.account_scope === "storefront" ? true : true,
    priceDisplay: priceDisplayOptions[0]!.value,
    facility: account?.department_name ?? "",
    representative: account?.display_name ?? "",
  };
}

export function AccountClient({
  accounts,
  roles,
  departments,
  pagination,
}: {
  accounts: AdminAccount[];
  roles: RoleRecord[];
  departments: DepartmentWithParent[];
  pagination: AccountsPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerState, setDrawerState] = React.useState<{
    open: boolean;
    mode: "create" | "edit";
    account: AdminAccount | null;
  }>({ open: false, mode: "create", account: null });
  const [formState, setFormState] = React.useState<AccountFormState>(() => createFormState());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const isEditing = drawerState.mode === "edit";

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const pageSizeOptions = [20, 50, 100];

  React.useEffect(() => {
    setFormState(createFormState(drawerState.account ?? undefined));
  }, [drawerState.account, drawerState.mode]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(ACCOUNTS_SELECTION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const safe = parsed
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0);
        setSelectedIds(safe);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedIds.length) {
      window.sessionStorage.removeItem(ACCOUNTS_SELECTION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(ACCOUNTS_SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);


  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string; scope?: string; status?: string }) => {
      const params = updatePaginationSearchParams(searchParams, {
        currentPage: pagination.page,
        totalPages,
        limit: pagination.limit,
        nextPage: next.page,
      });

      if (typeof next.search === "string") {
        if (next.search) {
          params.set("q", next.search);
        } else {
          params.delete("q");
        }
      }

      if (typeof next.scope === "string") {
        if (next.scope) {
          params.set("scope", next.scope);
        } else {
          params.delete("scope");
        }
      }

      if (typeof next.status === "string") {
        if (next.status) {
          params.set("status", next.status);
        } else {
          params.delete("status");
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pagination.limit, pagination.page, pathname, router, searchParams, totalPages],
  );

  const allCurrentPageIds = React.useMemo(() => accounts.map((account) => account.id), [accounts]);

  const allSelectedOnPage =
    allCurrentPageIds.length > 0 && allCurrentPageIds.every((id) => selectedIds.includes(id));
  const someSelectedOnPage =
    allCurrentPageIds.length > 0 && allCurrentPageIds.some((id) => selectedIds.includes(id));

  const headerCheckboxChecked: boolean | "indeterminate" = allSelectedOnPage
    ? true
    : someSelectedOnPage
      ? "indeterminate"
      : false;

  const handleToggleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedIds);
      allCurrentPageIds.forEach((id) => next.add(id));
      setSelectedIds(Array.from(next));
    } else {
      const remove = new Set(allCurrentPageIds);
      setSelectedIds((prev) => prev.filter((id) => !remove.has(id)));
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = (form.get("search") as string) ?? "";
    updateQuery({ page: 1, search: query.trim() });
  };

  const handleSort = (key: string, order: SortOrderType) => {
    const params = updateSortSearchParams(searchParams, key, order);
    if (pagination.search) params.set("q", pagination.search);
    if (pagination.scope) params.set("scope", pagination.scope);
    if (pagination.status) params.set("status", pagination.status);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDrawerOpen = (mode: "create" | "edit", account?: AdminAccount) => {
    setDrawerState({ open: true, mode, account: account ?? null });
  };

  const handleDrawerClose = () => {
    setDrawerState({ open: false, mode: "create", account: null });
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleDrawerClose();
    } else {
      setDrawerState((prev) => ({ ...prev, open }));
    }
  };

  const handleFormChange = (field: keyof AccountFormState) => (value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, unknown> = {
        mode: drawerState.mode,
        id: drawerState.account?.id,
        account_id: formState.accountId,
        display_name: formState.displayName,
        email: formState.email,
        phone: formState.phone,
        status: formState.status,
        role_code: formState.role,
        department_name: formState.department,
        account_scope: pagination.scope || "admin_portal",
      };

      const response = await fetch("/api/internal/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = data?.error || `Failed to save account (status ${response.status})`;
        throw new Error(message);
      }

      handleDrawerClose();

      const params = new URLSearchParams(searchParams?.toString());
      router.replace(`${pathname}?${params.toString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "アカウントの保存に失敗しました";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (mode: "all" | "selected") => {
    if (isExporting) return;
    if (mode === "selected" && !selectedIds.length) return;
    setIsExporting(true);
    try {
      const body = mode === "selected" ? { ids: selectedIds } : {};
      const response = await fetch("/api/internal/accounts/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; rowCount?: number }
        | null;
      if (!response.ok || !data?.ok) {
        const message =
          data?.error || `エクスポートに失敗しました (status ${response.status})`;
        alert(message);
        return;
      }
      const rowCount = typeof data.rowCount === "number" ? data.rowCount : 0;
      alert(`エクスポートが完了しました（${rowCount} 件）`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "エクスポートに失敗しました";
      alert(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && !selectedIds.length) return;
    const base = "/api/internal/accounts/export-csv";
    const url = mode === "selected" && selectedIds.length
      ? `${base}?ids=${encodeURIComponent(selectedIds.join(","))}`
      : base;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`選択中のアカウント（${selectedIds.length}件）を削除しますか？`);
      if (!confirmed) return;
    }

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/internal/accounts?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = data?.error || `削除に失敗しました (status ${response.status})`;
          if (typeof window !== "undefined") {
            window.alert(message);
          }
          return;
        }
      }
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "一括削除に失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  const handlePageSizeChange = (nextLimit: number) => {
    if (nextLimit === pagination.limit) return;
    const newTotalPages = Math.max(1, Math.ceil(pagination.count / nextLimit));
    const params = updatePaginationSearchParams(searchParams, {
      currentPage: 1,
      totalPages: newTotalPages,
      limit: nextLimit,
      nextPage: 1,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const visiblePages = React.useMemo(
    () => buildVisiblePages(pagination.page, totalPages),
    [pagination.page, totalPages],
  );

  return (
    <>
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
        {/* Card header, similar to shadcn Payments card */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium leading-none text-foreground">アカウント一覧</h2>
            <p className="text-xs text-muted-foreground">アカウントを検索・フィルタし、エクスポートできます。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-2 px-4 py-[6px] text-sm font-medium"
              onClick={() => handleDrawerOpen("create")}
            >
              <Plus className="h-[14px] w-[14px]" />
              新規追加
            </Button>
          </div>
        </div>

        {/* Toolbar: select all, search and filters */}
        <div className="flex flex-col gap-3 px-6 py-3 text-sm text-foreground lg:flex-row lg:items-center lg:justify-between">
          <label htmlFor="accounts-select-all" className="flex items-center gap-3">
            <Checkbox
              id="accounts-select-all"
              aria-label="全て選択"
              checked={headerCheckboxChecked}
              onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
            />
            <span>全て選択</span>
          </label>
          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <Input
                name="search"
                defaultValue={pagination.search}
                placeholder="氏名・メール・IDで検索"
                className="h-9 w-[220px]"
              />
              <Button type="submit" variant="outline">
                検索
              </Button>
            </form>
            <Button
              variant={pagination.scope === "storefront" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ scope: pagination.scope === "storefront" ? "" : "storefront", page: 1 })}
            >
              オンラインストア
            </Button>
            <Button
              variant={pagination.scope === "admin_portal" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ scope: pagination.scope === "admin_portal" ? "" : "admin_portal", page: 1 })}
            >
              管理画面
            </Button>
            <Button
              variant={pagination.status === "有効" ? "default" : "outline"}
              className="h-9"
              onClick={() => updateQuery({ status: pagination.status === "有効" ? "" : "有効", page: 1 })}
            >
              有効のみ
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>CSV でエクスポート</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleExportCsv("all")}>
                        全てのデータをエクスポート
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!selectedIds.length}
                        className={!selectedIds.length ? "text-[#9ca3af]" : undefined}
                        onClick={() => handleExportCsv("selected")}
                      >
                        選択中のデータをエクスポート
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {isExporting ? "Google Sheets にエクスポート中..." : "Google Sheets にエクスポート"}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleExport("all")} disabled={isExporting}>
                        全てのデータをエクスポート
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!selectedIds.length || isExporting}
                        className={!selectedIds.length || isExporting ? "text-[#9ca3af]" : undefined}
                        onClick={() => handleExport("selected")}
                      >
                        選択中のデータをエクスポート
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Table className="[&_th]:py-3 [&_td]:py-3">
          <TableHeader>
            <TableRow className="border-b border-border text-sm text-foreground">
              <TableHead className="w-[36px] pl-6 pr-3">
                <Checkbox
                  aria-label="行を選択"
                  checked={headerCheckboxChecked}
                  onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
                />
              </TableHead>
              <SortableTableHead
                sortKey="account_id"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[130px]"
              >
                アカウントID
              </SortableTableHead>
              <SortableTableHead
                sortKey="display_name"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[160px]"
              >
                氏名
              </SortableTableHead>
              <SortableTableHead
                sortKey="email"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[240px]"
              >
                メールアドレス
              </SortableTableHead>
              <SortableTableHead
                sortKey="department_name"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[180px]"
              >
                所属部署
              </SortableTableHead>
              <SortableTableHead
                sortKey="last_login_at"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[140px]"
              >
                最終ログイン
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[120px]"
              >
                ステータス
              </SortableTableHead>
              <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const statusBadge = getStatusBadge(account.status);
              return (
                <TableRow key={account.id} className="border-b border-border text-sm">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox
                      aria-label={`${account.display_name} を選択`}
                      checked={selectedIds.includes(account.id)}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setSelectedIds((prev) => {
                          if (isChecked) {
                            if (prev.includes(account.id)) return prev;
                            return [...prev, account.id];
                          }
                          return prev.filter((id) => id !== account.id);
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{account.account_id}</span>
                      <span className="text-[10px] text-muted-foreground">#{account.external_id ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{account.display_name}</TableCell>
                  <TableCell className="text-muted-foreground">{account.email ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{account.department_name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.last_login_at ? new Date(account.last_login_at).toLocaleString('ja-JP') : '未ログイン'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-none px-3 py-1 text-[12px] ${statusBadge.className}`}>{statusBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 py-1 text-primary hover:bg-primary/10"
                      onClick={() => handleDrawerOpen("edit", account)}
                    >
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!accounts.length ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  アカウントデータがありません。
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs text-destructive border-destructive/40"
            disabled={!selectedIds.length}
            onClick={handleBulkDelete}
          >
            一括削除
          </Button>
          <p className="text-xs text-muted-foreground">
            全 {pagination.count} 件（{pagination.page} / {totalPages} ページ）
          </p>
          <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              <span>表示件数:</span>
              <div className="flex items-center gap-1">
                {pageSizeOptions.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    size="sm"
                    variant={pagination.limit === size ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handlePageSizeChange(size)}
                  >
                    {size}行
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
                  aria-disabled={pagination.page <= 1}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page > 1) {
                      updateQuery({ page: pagination.page - 1 });
                    }
                  }}
                />
              </PaginationItem>
              {visiblePages.map((pageNumber, index) => {
                const isActive = pageNumber === pagination.page;
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
                            updateQuery({ page: pageNumber });
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
                  aria-disabled={pagination.page >= totalPages}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.page < totalPages) {
                      updateQuery({ page: pagination.page + 1 });
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

      <ManagementDrawer
        open={drawerState.open}
        onOpenChange={handleDrawerOpenChange}
        title={isEditing ? "アカウント編集" : "アカウント新規追加"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-3">
          {submitError ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-account-id" className="text-xs font-medium text-foreground">
                アカウントID
              </Label>
              <Input
                id="form-account-id"
                value={formState.accountId}
                onChange={(event) => handleFormChange("accountId")(event.target.value)}
                placeholder="example"
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">ステータス</Label>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div className="text-xs text-muted-foreground">利用可否を切り替え</div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formState.status}
                    onCheckedChange={(checked) => handleFormChange("status")(checked)}
                  />
                  <span className="text-sm text-foreground">{formState.status ? "有効" : "無効"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-display-name" className="text-xs font-medium text-foreground">
                アカウント名
              </Label>
              <Input
                id="form-display-name"
                value={formState.displayName}
                onChange={(event) => handleFormChange("displayName")(event.target.value)}
                placeholder="山田 太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-password" className="text-xs font-medium text-foreground">
                パスワード
              </Label>
              <Input
                id="form-password"
                type="password"
                value={formState.password}
                onChange={(event) => handleFormChange("password")(event.target.value)}
                placeholder="example"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-role" className="text-xs font-medium text-foreground">
                ロール
              </Label>
              <Select value={formState.role || "__none__"} onValueChange={(value) => handleFormChange("role")(value === "__none__" ? "" : value)}>
                <SelectTrigger id="form-role">
                  <SelectValue placeholder="ロールを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未設定</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.code}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-department" className="text-xs font-medium text-foreground">
                部署
              </Label>
              <Select
                value={formState.department || "__none__"}
                onValueChange={(value) => handleFormChange("department")(value === "__none__" ? "" : value)}
              >
                <SelectTrigger id="form-department">
                  <SelectValue placeholder="部署を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未設定</SelectItem>
                  {Array.from(new Set(departments.map((d) => d.name))).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <Label className="text-xs font-medium text-foreground">代行請求</Label>
                <p className="text-xs text-muted-foreground">代理店向け請求を許可</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formState.delegateBilling}
                  onCheckedChange={(checked) => handleFormChange("delegateBilling")(checked)}
                />
                <span className="text-sm text-foreground">{formState.delegateBilling ? "有効" : "無効"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-price" className="text-xs font-medium text-foreground">
                価格表示
              </Label>
              <Select
                value={formState.priceDisplay}
                onValueChange={(value) => handleFormChange("priceDisplay")(value)}
              >
                <SelectTrigger id="form-price">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {priceDisplayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-email" className="text-xs font-medium text-foreground">
              メールアドレス
            </Label>
            <Input
              id="form-email"
              type="email"
              value={formState.email}
              onChange={(event) => handleFormChange("email")(event.target.value)}
              placeholder="example@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-phone" className="text-xs font-medium text-foreground">
              電話番号
            </Label>
            <Input
              id="form-phone"
              value={formState.phone}
              onChange={(event) => handleFormChange("phone")(event.target.value)}
              placeholder="090-0000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-facility" className="text-xs font-medium text-foreground">
              施設名・宛先
            </Label>
            <Input
              id="form-facility"
              value={formState.facility}
              onChange={(event) => handleFormChange("facility")(event.target.value)}
              placeholder="example"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-representative" className="text-xs font-medium text-foreground">
              代表者名
            </Label>
            <Input
              id="form-representative"
              value={formState.representative}
              onChange={(event) => handleFormChange("representative")(event.target.value)}
              placeholder="example"
            />
          </div>
          </div>
        </div>
      </ManagementDrawer>
    </>
  );
}
