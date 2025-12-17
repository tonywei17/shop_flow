"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { InventoryRow } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Minus } from "lucide-react";

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

type AdjustmentDialogState = {
  open: boolean;
  item: InventoryRow | null;
  type: "add" | "subtract";
};

const ADJUSTMENT_REASONS = [
  { value: "purchase", label: "仕入れ" },
  { value: "return", label: "返品" },
  { value: "damage", label: "破損・廃棄" },
  { value: "correction", label: "棚卸調整" },
  { value: "other", label: "その他" },
];

export function InventoryClient({ items, pagination }: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(pagination.search);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = React.useRef(pagination.search);

  // Adjustment dialog state
  const [adjustDialog, setAdjustDialog] = React.useState<AdjustmentDialogState>({
    open: false,
    item: null,
    type: "add",
  });
  const [adjustAmount, setAdjustAmount] = React.useState("");
  const [adjustReason, setAdjustReason] = React.useState("");
  const [adjustNote, setAdjustNote] = React.useState("");
  const [isAdjusting, setIsAdjusting] = React.useState(false);
  const [adjustError, setAdjustError] = React.useState<string | null>(null);

  const openAdjustDialog = (item: InventoryRow, type: "add" | "subtract") => {
    setAdjustDialog({ open: true, item, type });
    setAdjustAmount("");
    setAdjustReason("");
    setAdjustNote("");
    setAdjustError(null);
  };

  const closeAdjustDialog = () => {
    setAdjustDialog({ open: false, item: null, type: "add" });
  };

  const handleAdjustSubmit = async () => {
    if (!adjustDialog.item || !adjustAmount || !adjustReason) return;

    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setAdjustError("有効な数量を入力してください");
      return;
    }

    const delta = adjustDialog.type === "add" ? amount : -amount;

    // Check if subtracting more than available
    if (delta < 0 && Math.abs(delta) > adjustDialog.item.stock) {
      setAdjustError("在庫数を超える数量は減らせません");
      return;
    }

    setIsAdjusting(true);
    setAdjustError(null);

    try {
      const response = await fetch("/api/internal/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustDialog.item.id,
          delta,
          reason: adjustReason,
          note: adjustNote || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "在庫調整に失敗しました");
      }

      closeAdjustDialog();
      router.refresh();
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsAdjusting(false);
    }
  };

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
    <>
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
              <TableHead className="w-[100px] text-right pr-6">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openAdjustDialog(item, "add")}
                          title="在庫を増やす"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openAdjustDialog(item, "subtract")}
                          title="在庫を減らす"
                          disabled={item.stock === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
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

    {/* Adjustment Dialog */}
    <Dialog open={adjustDialog.open} onOpenChange={(open) => !open && closeAdjustDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {adjustDialog.type === "add" ? "在庫を増やす" : "在庫を減らす"}
          </DialogTitle>
          <DialogDescription>
            {adjustDialog.item?.name} ({adjustDialog.item?.code})
            <br />
            現在の在庫: {adjustDialog.item?.stock}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="adjust-amount">数量</Label>
            <Input
              id="adjust-amount"
              type="number"
              min="1"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="調整する数量を入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-reason">理由</Label>
            <Select value={adjustReason} onValueChange={setAdjustReason}>
              <SelectTrigger id="adjust-reason">
                <SelectValue placeholder="理由を選択" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-note">備考（任意）</Label>
            <Textarea
              id="adjust-note"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="備考を入力"
              rows={2}
            />
          </div>

          {adjustError && (
            <p className="text-sm text-destructive">{adjustError}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeAdjustDialog} disabled={isAdjusting}>
            キャンセル
          </Button>
          <Button
            onClick={handleAdjustSubmit}
            disabled={isAdjusting || !adjustAmount || !adjustReason}
          >
            {isAdjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {adjustDialog.type === "add" ? "増やす" : "減らす"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
