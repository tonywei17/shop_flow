'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DepartmentWithParent } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Building2, Download, FolderTree, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { buildVisiblePages, updatePaginationSearchParams } from "@/lib/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { HighlightText } from "@/components/ui/highlight-text";
import {
  SortableTableHead,
  updateSortSearchParams,
  type SortOrder as SortOrderType,
} from "@/components/ui/sortable-table-head";

const DEPARTMENTS_SELECTION_STORAGE_KEY = "departments_selected_ids";

export type SortOrder = "asc" | "desc" | null;

export type DepartmentsPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  sortKey: string | null;
  sortOrder: SortOrder;
};

export function DepartmentsClient({
  departments,
  pagination,
}: {
  departments: DepartmentWithParent[];
  pagination: DepartmentsPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingCommissionId, setEditingCommissionId] = React.useState<string | null>(null);
  const [editingCommissionValue, setEditingCommissionValue] = React.useState<string>("");

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const pageSizeOptions = [20, 50, 100];

  const updateQuery = React.useCallback(
    (next: { page?: number; search?: string; limit?: number }) => {
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

  const handleSort = (key: string, order: SortOrderType) => {
    const params = updateSortSearchParams(searchParams, key, order);
    if (pagination.search) {
      params.set("q", pagination.search);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(DEPARTMENTS_SELECTION_STORAGE_KEY);
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
      window.sessionStorage.removeItem(DEPARTMENTS_SELECTION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(DEPARTMENTS_SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const allCurrentPageIds = React.useMemo(() => departments.map((dept) => dept.id), [departments]);

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

  const visiblePages = React.useMemo(
    () => buildVisiblePages(pagination.page, totalPages),
    [pagination.page, totalPages],
  );

  const handleExport = async (mode: "all" | "selected") => {
    if (isExporting) return;
    if (mode === "selected" && !selectedIds.length) return;
    setIsExporting(true);
    try {
      const body = mode === "selected" ? { ids: selectedIds } : {};
      const response = await fetch("/api/internal/departments/export", {
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

  const handleExportCsv = (mode: "all" | "selected") => {
    if (mode === "selected" && !selectedIds.length) return;
    const base = "/api/internal/departments/export-csv";
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
      const confirmed = window.confirm(`選択中の部署（${selectedIds.length}件）を削除しますか？`);
      if (!confirmed) return;
    }

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/internal/departments?id=${encodeURIComponent(id)}`, {
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

  const handleSaveCommissionRate = async (deptId: string) => {
    const rate = parseFloat(editingCommissionValue);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("マージンは0〜100の範囲で入力してください");
      setEditingCommissionId(null);
      return;
    }

    try {
      const response = await fetch("/api/internal/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deptId, commission_rate: rate }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "更新に失敗しました");
      }

      toast.success("マージンを更新しました");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "マージンの更新に失敗しました";
      toast.error(message);
    } finally {
      setEditingCommissionId(null);
    }
  };

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-3 text-sm text-foreground lg:flex-row lg:items-center lg:justify-between">
          <label htmlFor="dept-select-all" className="flex items-center gap-3">
            <Checkbox
              id="dept-select-all"
              aria-label="全て選択"
              checked={headerCheckboxChecked}
              onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
            />
            <span>全て選択</span>
          </label>
          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <SearchInput
              placeholder="店番・部署名・責任者・地域で検索"
              className="w-full max-w-xs"
            />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10"
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
                        className={!selectedIds.length ? "text-muted-foreground" : undefined}
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
                        className={!selectedIds.length || isExporting ? "text-muted-foreground" : undefined}
                        onClick={() => handleExport("selected")}
                      >
                        選択中のデータをエクスポート
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                組織構成を編集
              </Button>
            </div>
          </div>
        </div>

        <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
          <TableHeader>
            <TableRow className="border-b border-border text-foreground">
              <TableHead className="w-[36px] pl-6 pr-3">
                <Checkbox
                  aria-label="行を選択"
                  checked={headerCheckboxChecked}
                  onCheckedChange={(checked) => handleToggleSelectAllCurrentPage(checked === true)}
                />
              </TableHead>
              <SortableTableHead
                sortKey="code"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[100px]"
              >
                店番
              </SortableTableHead>
              <SortableTableHead
                sortKey="name"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[200px]"
              >
                部署名
              </SortableTableHead>
              <SortableTableHead
                sortKey="category"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[160px]"
              >
                区分
              </SortableTableHead>
              <TableHead className="w-[160px]">上位部署</TableHead>
              <SortableTableHead
                sortKey="manager_name"
                currentSortKey={pagination.sortKey}
                currentSortOrder={pagination.sortOrder}
                onSort={handleSort}
                className="w-[200px]"
              >
                責任者
              </SortableTableHead>
              <TableHead className="w-[160px]">電話番号</TableHead>
              <TableHead>所在地</TableHead>
              <TableHead className="w-[100px]">分成比例</TableHead>
              <TableHead className="w-[80px] pr-6 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id} className="border-b border-border">
                <TableCell className="pl-6 pr-3">
                  <Checkbox
                    aria-label={`${dept.name} を選択`}
                    checked={selectedIds.includes(dept.id)}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setSelectedIds((prev) => {
                        if (isChecked) {
                          if (prev.includes(dept.id)) return prev;
                          return [...prev, dept.id];
                        }
                        return prev.filter((id) => id !== dept.id);
                      });
                    }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <HighlightText text={dept.code ?? '--'} searchTerm={pagination.search} />
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <HighlightText text={dept.name} searchTerm={pagination.search} />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <HighlightText text={dept.category ?? '--'} searchTerm={pagination.search} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <HighlightText text={dept.parent_name ?? '—'} searchTerm={pagination.search} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <HighlightText text={dept.manager_name || '—'} searchTerm={pagination.search} />
                </TableCell>
                <TableCell className="text-muted-foreground">{dept.phone_primary || '—'}</TableCell>
                <TableCell className="text-muted-foreground">
                  <HighlightText 
                    text={[dept.prefecture, dept.city, dept.address_line1, dept.address_line2].filter(Boolean).join(' ') || '—'} 
                    searchTerm={pagination.search} 
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dept.type === '支局' ? (
                    editingCommissionId === dept.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editingCommissionValue}
                          onChange={(e) => setEditingCommissionValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveCommissionRate(dept.id);
                            } else if (e.key === 'Escape') {
                              setEditingCommissionId(null);
                            }
                          }}
                          onBlur={() => handleSaveCommissionRate(dept.id)}
                          className="w-16 h-7 text-xs px-2"
                          autoFocus
                        />
                        <span className="text-xs">%</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommissionId(dept.id);
                          setEditingCommissionValue(String((dept as any).commission_rate ?? 10));
                        }}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Percent className="h-3 w-3" />
                        <span>{(dept as any).commission_rate ?? 10}%</span>
                      </button>
                    )
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!departments.length ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                  部署データがありません。
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
  );
}
