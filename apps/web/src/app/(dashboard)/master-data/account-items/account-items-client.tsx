'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AccountItem } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildVisiblePages, updatePaginationSearchParams } from "@/lib/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { HighlightText } from "@/components/ui/highlight-text";
import {
  SortableTableHead,
  updateSortSearchParams,
  type SortOrder as SortOrderType,
} from "@/components/ui/sortable-table-head";

import { getStatusBadge } from "@/lib/constants/status-badges";

export type SortOrder = "asc" | "desc" | null;

export type MasterPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  sortKey: string | null;
  sortOrder: SortOrder;
};

type FormMode = "create" | "edit";

type FormState = {
  id: string | null;
  accountItemId: string;
  name: string;
  status: string;
};

export function AccountItemsClient({
  items,
  pagination,
}: {
  items: AccountItem[];
  pagination: MasterPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<FormMode>("create");
  const [formState, setFormState] = React.useState<FormState>({
    id: null,
    accountItemId: "",
    name: "",
    status: "有効",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const pageSizeOptions = [20, 50, 100];

  const visiblePages = React.useMemo(
    () => buildVisiblePages(pagination.page, totalPages),
    [pagination.page, totalPages],
  );

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string }) => {
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

      router.push(`${pathname}?${params.toString()}`);
    },
    [pagination.limit, pagination.page, pathname, router, searchParams, totalPages],
  );

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

  const handleSort = (key: string, order: SortOrderType) => {
    const params = updateSortSearchParams(searchParams, key, order);
    // Preserve search query
    if (pagination.search) {
      params.set("q", pagination.search);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const allCurrentPageIds = React.useMemo(() => items.map((item) => item.id), [items]);

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

  const openCreate = () => {
    setMode("create");
    setFormState({ id: null, accountItemId: "", name: "", status: "有効" });
    setSubmitError(null);
    setDialogOpen(true);
  };

  const openEdit = (item: AccountItem) => {
    setMode("edit");
    setFormState({
      id: item.id,
      accountItemId: String(item.account_item_id),
      name: item.name,
      status: item.status ?? "有効",
    });
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleDelete = async (item: AccountItem) => {
    if (!window.confirm(`勘定項目「${item.name}」を削除しますか？`)) return;

    try {
      const response = await fetch(`/api/internal/account-items?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || `削除に失敗しました (status ${response.status})`;
        alert(message);
        return;
      }
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "削除に失敗しました";
      alert(message);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`選択中の勘定項目（${selectedIds.length}件）を削除しますか？`);
      if (!confirmed) return;
    }

    try {
      const response = await fetch("/api/internal/account-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || `一括削除に失敗しました (status ${response.status})`;
        if (typeof window !== "undefined") {
          window.alert(message);
        }
        return;
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "一括削除に失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  };

  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && !selectedIds.length) return;
    const base = "/api/internal/account-items/export-csv";
    const url =
      mode === "selected" && selectedIds.length
        ? `${base}?ids=${encodeURIComponent(selectedIds.join(","))}`
        : base;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const handleExportSheets = async (mode: "all" | "selected") => {
    if (isExporting) return;
    if (mode === "selected" && !selectedIds.length) return;

    setIsExporting(true);
    try {
      const body = mode === "selected" ? { ids: selectedIds } : {};
      const response = await fetch("/api/internal/account-items/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; rowCount?: number }
        | null;

      if (!response.ok || !data?.ok) {
        const message =
          data?.error || `Google Sheets へのエクスポートに失敗しました (status ${response.status})`;
        if (typeof window !== "undefined") {
          window.alert(message);
        }
        return;
      }

      const rowCount = typeof data.rowCount === "number" ? data.rowCount : 0;
      if (typeof window !== "undefined") {
        window.alert(`Google Sheets へのエクスポートが完了しました（${rowCount} 件）`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google Sheets へのエクスポートに失敗しました";
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, unknown> = {
        mode,
        id: formState.id ?? undefined,
        account_item_id: formState.accountItemId,
        name: formState.name,
        status: formState.status,
      };

      const response = await fetch("/api/internal/account-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || `保存に失敗しました (status ${response.status})`;
        throw new Error(message);
      }

      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存に失敗しました";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium leading-none text-foreground">勘定項目一覧</h2>
            <p className="text-xs text-muted-foreground">勘定項目マスタの一覧・編集・追加ができます。</p>
          </div>
          <Button size="sm" className="px-4 py-[6px] text-sm font-medium" onClick={openCreate}>
            新規追加
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-6 py-3 text-sm text-foreground md:flex-row md:items-center md:justify-between">
          <label htmlFor="account-items-select-all" className="flex items-center gap-3">
            <Checkbox
              id="account-items-select-all"
              aria-label="全て選択"
              checked={headerCheckboxChecked}
              onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
            />
            <span>全て選択</span>
          </label>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
            <SearchInput
              placeholder="勘定項目ID・名称で検索"
              className="w-[220px]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
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
                        className={!selectedIds.length ? "text-muted-foreground opacity-50 cursor-not-allowed" : undefined}
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
                      <DropdownMenuItem onClick={() => handleExportSheets("all")} disabled={isExporting}>
                        全てのデータをエクスポート
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!selectedIds.length || isExporting}
                        className={!selectedIds.length || isExporting ? "text-muted-foreground" : undefined}
                        onClick={() => handleExportSheets("selected")}
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
                sortKey="account_item_id"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[120px]"
              >
                勘定項目ID
              </SortableTableHead>
              <SortableTableHead
                sortKey="name"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[260px]"
              >
                勘定項目名
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
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: AccountItem) => (
              <TableRow key={item.id} className="border-b border-border text-sm">
                <TableCell className="pl-6 pr-3">
                  <Checkbox
                    aria-label={`${item.name} を選択`}
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setSelectedIds((prev) => {
                        if (isChecked) {
                          if (prev.includes(item.id)) return prev;
                          return [...prev, item.id];
                        }
                        return prev.filter((id) => id !== item.id);
                      });
                    }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <HighlightText text={String(item.account_item_id)} searchTerm={pagination.search} />
                </TableCell>
                <TableCell className="text-foreground">
                  <HighlightText text={item.name} searchTerm={pagination.search} />
                </TableCell>
                <TableCell>
                  {(() => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <Badge className={`border-none px-3 py-1 text-[12px] hover:bg-transparent ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 text-primary hover:bg-primary/10"
                    onClick={() => openEdit(item)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(item)}
                  >
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!items.length ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  勘定項目データがありません。
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
                          if (!isActive) updateQuery({ page: pageNumber });
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

        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetContent className="flex w-full max-w-[440px] flex-col overflow-y-auto p-0 sm:w-[420px]">
            <div className="flex flex-1 flex-col">
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle className="text-[18px] font-semibold text-foreground">
                  {mode === "create" ? "勘定項目の新規追加" : "勘定項目の編集"}
                </SheetTitle>
              </SheetHeader>
              <form className="flex flex-col gap-5 px-6 py-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="account-item-id">勘定項目ID</Label>
                  <Input
                    id="account-item-id"
                    value={formState.accountItemId}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, accountItemId: event.target.value }))
                    }
                    placeholder="101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-item-name">勘定項目名</Label>
                  <Input
                    id="account-item-name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="現金"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <RadioGroup
                    value={formState.status}
                    onValueChange={(value) =>
                      setFormState((prev) => ({ ...prev, status: value }))
                    }
                    className="flex flex-row gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="status-active" value="有効" />
                      <Label htmlFor="status-active" className="text-sm font-normal cursor-pointer">
                        有効
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="status-inactive" value="無効" />
                      <Label htmlFor="status-inactive" className="text-sm font-normal cursor-pointer">
                        無効
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                {submitError ? (
                  <p className="text-sm text-destructive">{submitError}</p>
                ) : null}
                <SheetFooter className="mt-auto border-t border-border px-0 pt-4">
                  <div className="flex w-full justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "保存中..." : mode === "edit" ? "保存する" : "作成する"}
                    </Button>
                  </div>
                </SheetFooter>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
