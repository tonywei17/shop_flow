"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { InventoryRow } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InventoryPagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  status: string;
};

type InventoryClientProps = {
  items: InventoryRow[];
  pagination: InventoryPagination;
};

export function InventoryClient({ items, pagination }: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(pagination.search);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = React.useRef(pagination.search);

  const totalPages = Math.max(1, Math.ceil(pagination.count / pagination.limit));
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  const updateQuery = React.useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const query = params.toString();
      router.push(query ? `/inventory?${query}` : "/inventory");
    },
    [router, searchParams],
  );

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const trimmed = value.trim();

      // 允许清空；非空时，长度小于 2 不触发搜索，避免噪音
      if (trimmed.length > 0 && trimmed.length < 2) {
        return;
      }

      if (trimmed === lastSearchRef.current) {
        return;
      }

      searchTimeoutRef.current = setTimeout(() => {
        lastSearchRef.current = trimmed;
        updateQuery({ q: trimmed || null, page: 1 });
      }, 400);
    },
    [updateQuery],
  );

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const sortedItems = React.useMemo(() => {
    const priority = {
      out_of_stock: 0,
      low_stock: 1,
      ok: 2,
    } as const;

    return [...items].sort((a, b) => {
      const pa = priority[a.stock_status] ?? 2;
      const pb = priority[b.stock_status] ?? 2;
      if (pa !== pb) return pa - pb;
      return a.code.localeCompare(b.code, "ja");
    });
  }, [items]);

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardContent className="p-0">
        {/* ヘッダー：検索 + 件数 */}
        <div className="flex flex-col gap-3 border-b border-border px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">在庫一覧</p>
            <p className="text-xs text-muted-foreground">
              在庫なし・在庫警告の商品が上部に表示されます。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="商品コード・商品名で検索"
              className="w-full min-w-[260px] max-w-[360px]"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              全 {pagination.count} 件
            </span>
          </div>
        </div>

        {/* テーブル */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">商品コード</TableHead>
              <TableHead>商品名</TableHead>
              <TableHead className="w-[140px]">商品区分</TableHead>
              <TableHead className="w-[120px] text-right">在庫数</TableHead>
              <TableHead className="w-[140px] text-right">在庫警告閾値</TableHead>
              <TableHead className="w-[120px] text-center">在庫ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  在庫データがありません。
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => {
                const statusLabel =
                  item.stock_status === "out_of_stock"
                    ? "在庫なし"
                    : item.stock_status === "low_stock"
                      ? "在庫わずか"
                      : "在庫あり";

                const statusClass =
                  item.stock_status === "out_of_stock"
                    ? "bg-red-500/10 text-red-500 border-red-500/30"
                    : item.stock_status === "low_stock"
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";

                return (
                  <TableRow key={item.id} className="border-b border-border">
                    <TableCell className="font-mono text-xs">{item.code}</TableCell>
                    <TableCell className="text-sm font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.category_name || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span
                        className={cn(
                          item.stock_status !== "ok" && "text-destructive font-semibold",
                        )}
                      >
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.stock_alert_threshold ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn("px-2 py-0.5 text-[11px] font-medium", statusClass)}
                      >
                        {statusLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* フッター：ページネーション */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm text-muted-foreground">
          <div>
            ページ {pagination.page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasPrevPage}
              onClick={() => updateQuery({ page: pagination.page - 1 })}
            >
              前へ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => updateQuery({ page: pagination.page + 1 })}
            >
              次へ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
