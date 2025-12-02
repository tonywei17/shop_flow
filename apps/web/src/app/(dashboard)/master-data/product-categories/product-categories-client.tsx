'use client';

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductCategory } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { MasterPagination } from "../account-items/account-items-client";

type FormMode = "create" | "edit";

type FormState = {
  id: string | null;
  code: string;
  name: string;
  status: string;
};

export function ProductCategoriesClient({
  items,
  pagination,
}: {
  items: ProductCategory[];
  pagination: MasterPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<FormMode>("create");
  const [formState, setFormState] = React.useState<FormState>({
    id: null,
    code: "",
    name: "",
    status: "有効",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = (formData.get("search") as string) ?? "";
    updateQuery({ page: 1, search: q.trim() });
  };

  const openCreate = () => {
    setMode("create");
    setFormState({ id: null, code: "", name: "", status: "有効" });
    setSubmitError(null);
    setDialogOpen(true);
  };

  const openEdit = (item: ProductCategory) => {
    setMode("edit");
    setFormState({
      id: item.id,
      code: item.code,
      name: item.name,
      status: item.status ?? "有効",
    });
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleDelete = async (item: ProductCategory) => {
    if (!window.confirm(`商品区分「${item.name}」を削除しますか？`)) return;

    try {
      const response = await fetch(`/api/internal/product-categories?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || `削除に失敗しました (status ${response.status})`;
        alert(message);
        return;
      }
      const params = new URLSearchParams(searchParams?.toString());
      router.replace(`${pathname}?${params.toString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "削除に失敗しました";
      alert(message);
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
        code: formState.code,
        name: formState.name,
        status: formState.status,
      };

      const response = await fetch("/api/internal/product-categories", {
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
      const params = new URLSearchParams(searchParams?.toString());
      router.replace(`${pathname}?${params.toString()}`);
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
            <h2 className="text-sm font-medium leading-none text-foreground">商品区分一覧</h2>
            <p className="text-xs text-muted-foreground">商品区分マスタの一覧・編集・追加ができます。</p>
          </div>
          <Button size="sm" className="px-4 py-[6px] text-sm font-medium" onClick={openCreate}>
            新規追加
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border px-6 py-3 text-sm text-foreground md:flex-row md:items-center md:justify-between">
          <form className="flex items-center gap-2" onSubmit={handleSearch}>
            <Input
              name="search"
              defaultValue={pagination.search}
              placeholder="商品区分ID・名称で検索"
              className="h-9 w-[220px]"
            />
            <Button type="submit" variant="outline" className="h-9 px-4 text-xs">
              検索
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            全 {pagination.count} 件（{pagination.page} / {totalPages} ページ）
          </p>
        </div>

        <Table className="[&_th]:py-3 [&_td]:py-3">
          <TableHeader>
            <TableRow className="border-b border-border text-sm text-foreground">
              <TableHead className="w-[120px]">商品区分ID</TableHead>
              <TableHead className="w-[260px]">商品区分名</TableHead>
              <TableHead className="w-[120px]">ステータス</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: ProductCategory) => (
              <TableRow key={item.id} className="border-b border-border text-sm">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.code}
                </TableCell>
                <TableCell className="text-foreground">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.status}</TableCell>
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
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  商品区分データがありません。
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                {mode === "create" ? "商品区分の新規追加" : "商品区分の編集"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="product-category-code">商品区分ID</Label>
                <Input
                  id="product-category-code"
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, code: event.target.value }))
                  }
                  placeholder="0001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category-name">商品区分名</Label>
                <Input
                  id="product-category-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="図書"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category-status">ステータス</Label>
                <Input
                  id="product-category-status"
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, status: event.target.value }))
                  }
                  placeholder="有効"
                />
              </div>
              {submitError ? (
                <p className="text-xs text-destructive">{submitError}</p>
              ) : null}
              <DialogFooter className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="px-4"
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-4">
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
