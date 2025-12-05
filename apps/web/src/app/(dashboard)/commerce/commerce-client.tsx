"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory, ProductImage } from "@enterprise/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import {
  SortableTableHead,
  updateSortSearchParams,
  type SortOrder,
} from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Download, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImageManager } from "@/components/product-image-manager";

// ============================================================
// 类型定义
// ============================================================

type ProductFormState = {
  code: string;
  name: string;
  description: string;
  category_id: string;
  price_hq: number;
  price_branch: number;
  price_classroom: number;
  price_retail: number;
  stock: number;
  stock_alert_threshold: number;
  is_active: boolean;
  is_taxable: boolean;
  tax_rate: number;
  min_order_quantity: number;
  max_order_quantity: number | null;
  order_unit: string;
  display_order: number;
};

type DrawerState = {
  open: boolean;
  mode: "create" | "edit";
  product: Product | null;
};

type Pagination = {
  page: number;
  limit: number;
  count: number;
  search: string;
  category: string;
  status: string;
  sortKey: string | null;
  sortOrder: string | null;
};

// ============================================================
// 辅助函数
// ============================================================

function createFormState(product?: Product | null): ProductFormState {
  return {
    code: product?.code ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? "",
    price_hq: product?.price_hq ?? 0,
    price_branch: product?.price_branch ?? 0,
    price_classroom: product?.price_classroom ?? 0,
    price_retail: product?.price_retail ?? 0,
    stock: product?.stock ?? 0,
    stock_alert_threshold: product?.stock_alert_threshold ?? 10,
    is_active: product?.is_active ?? true,
    is_taxable: product?.is_taxable ?? true,
    tax_rate: product?.tax_rate ?? 10,
    min_order_quantity: product?.min_order_quantity ?? 1,
    max_order_quantity: product?.max_order_quantity ?? null,
    order_unit: product?.order_unit ?? "個",
    display_order: product?.display_order ?? 0,
  };
}

function formatPrice(price: number): string {
  return price.toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
}

// ============================================================
// 组件
// ============================================================

type ProductStats = {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
};

type CommerceClientProps = {
  products: Product[];
  categories: ProductCategory[];
  pagination: Pagination;
  stats: ProductStats;
};

export function CommerceClient({
  products,
  categories,
  pagination,
  stats,
}: CommerceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState(pagination.search);
  const [drawerState, setDrawerState] = React.useState<DrawerState>({
    open: false,
    mode: "create",
    product: null,
  });
  const [formState, setFormState] = React.useState<ProductFormState>(createFormState());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [productImages, setProductImages] = React.useState<ProductImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = React.useState(false);

  // 分页计算
  const totalPages = Math.ceil(pagination.count / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  // 更新 URL 参数
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
      router.push(`/commerce?${params.toString()}`);
    },
    [router, searchParams],
  );

  // 搜索处理
  const handleSearch = React.useCallback(() => {
    updateQuery({ q: searchTerm, page: 1 });
  }, [searchTerm, updateQuery]);

  // 排序处理
  const handleSort = React.useCallback(
    (key: string, order: SortOrder) => {
      const params = updateSortSearchParams(searchParams, key, order);
      // 保留其他参数
      if (pagination.search) params.set("q", pagination.search);
      if (pagination.category) params.set("category", pagination.category);
      if (pagination.status) params.set("status", pagination.status);
      router.push(`/commerce?${params.toString()}`);
    },
    [router, searchParams, pagination.search, pagination.category, pagination.status],
  );

  // 抽屉处理
  const handleDrawerOpen = async (mode: "create" | "edit", product?: Product) => {
    setDrawerState({ open: true, mode, product: product ?? null });
    setFormState(createFormState(product));
    setSubmitError(null);
    setProductImages([]);

    // 编辑模式下加载图片
    if (mode === "edit" && product) {
      setIsLoadingImages(true);
      try {
        const response = await fetch(`/api/internal/products/images?product_id=${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setProductImages(data.images || []);
        }
      } catch (error) {
        console.error("Failed to load product images:", error);
      } finally {
        setIsLoadingImages(false);
      }
    }
  };

  const handleDrawerClose = () => {
    setDrawerState({ open: false, mode: "create", product: null });
    setFormState(createFormState());
    setSubmitError(null);
    setProductImages([]);
  };

  // 表单提交
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        mode: drawerState.mode,
        id: drawerState.product?.id,
        code: formState.code,
        name: formState.name,
        description: formState.description || null,
        category_id: formState.category_id || null,
        price_hq: formState.price_hq,
        price_branch: formState.price_branch,
        price_classroom: formState.price_classroom,
        price_retail: formState.price_retail,
        stock: formState.stock,
        stock_alert_threshold: formState.stock_alert_threshold,
        is_active: formState.is_active,
        is_taxable: formState.is_taxable,
        tax_rate: formState.tax_rate,
        min_order_quantity: formState.min_order_quantity,
        max_order_quantity: formState.max_order_quantity,
        order_unit: formState.order_unit,
        display_order: formState.display_order,
      };

      const response = await fetch("/api/internal/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Failed to save product (status ${response.status})`);
      }

      handleDrawerClose();
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除处理
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/internal/products?id=${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "削除に失敗しました");
      }

      setDeleteDialogOpen(false);
      setProductToDelete(null);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  // 全选处理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // 切换販売中状态
  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/internal/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "edit",
          id: productId,
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "更新に失敗しました");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新に失敗しました");
    }
  };

  return (
    <>
      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">総商品数</p>
                <p className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">販売中</p>
                <p className="text-3xl font-bold">{stats.activeProducts.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">在庫警告</p>
                <p className="text-3xl font-bold">{stats.lowStockProducts.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">在庫総額</p>
                <p className="text-3xl font-bold">{formatPrice(stats.totalStockValue)}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* テーブルヘッダー（全選択 + 検索 + 操作ボタン） */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            {/* 左側：全選択 */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="全て選択"
              />
              <span className="text-sm text-muted-foreground">全て選択</span>
            </div>

            {/* 中央：検索とフィルター */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="商品コード・商品名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-[240px]"
              />
              <Select
                value={pagination.category || "__all__"}
                onValueChange={(value) => updateQuery({ category: value === "__all__" ? null : value, page: 1 })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="商品区分" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={pagination.status || "__all__"}
                onValueChange={(value) => updateQuery({ status: value === "__all__" ? null : value, page: 1 })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="状態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  <SelectItem value="active">販売中</SelectItem>
                  <SelectItem value="inactive">非公開</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                検索
              </Button>
            </div>

            {/* 右側：操作ボタン */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Button size="sm" className="gap-1" onClick={() => handleDrawerOpen("create")}>
                <Plus className="h-4 w-4" />
                新規追加
              </Button>
            </div>
          </div>

          {/* テーブル */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <SortableTableHead
                  sortKey=""
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={() => {}}
                  className="w-[40px] pl-6 cursor-default hover:bg-transparent"
                >
                  <span className="sr-only">選択</span>
                </SortableTableHead>
                <SortableTableHead
                  sortKey="code"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[120px]"
                >
                  商品コード
                </SortableTableHead>
                <SortableTableHead
                  sortKey="name"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                >
                  商品名
                </SortableTableHead>
                <SortableTableHead
                  sortKey="category_id"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[100px]"
                >
                  商品区分
                </SortableTableHead>
                <SortableTableHead
                  sortKey="price_hq"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[100px] text-right"
                >
                  本部価格
                </SortableTableHead>
                <SortableTableHead
                  sortKey="price_branch"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[100px] text-right"
                >
                  支局価格
                </SortableTableHead>
                <SortableTableHead
                  sortKey="price_classroom"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[100px] text-right"
                >
                  教室価格
                </SortableTableHead>
                <SortableTableHead
                  sortKey="price_retail"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[100px] text-right"
                >
                  一般価格
                </SortableTableHead>
                <SortableTableHead
                  sortKey="stock"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[80px] text-right"
                >
                  在庫
                </SortableTableHead>
                <SortableTableHead
                  sortKey="is_active"
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={handleSort}
                  className="w-[80px] text-center whitespace-nowrap"
                >
                  販売中
                </SortableTableHead>
                <SortableTableHead
                  sortKey=""
                  currentSortKey={pagination.sortKey}
                  currentSortOrder={pagination.sortOrder as SortOrder}
                  onSort={() => {}}
                  className="w-[60px] pr-6 text-right cursor-default hover:bg-transparent"
                >
                  操作
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-16 text-center text-muted-foreground">
                    <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>商品がありません</p>
                    <p className="mt-1 text-sm">「新規追加」から商品を登録してください</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="border-b border-border">
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectOne(product.id, !!checked)}
                        aria-label={`${product.name} を選択`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {product.category_name || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPrice(product.price_hq)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPrice(product.price_branch)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPrice(product.price_classroom)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPrice(product.price_retail)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "font-mono text-sm",
                        product.stock <= (product.stock_alert_threshold ?? 10) && "text-destructive"
                      )}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                        aria-label={product.is_active ? "販売中" : "非公開"}
                      />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDrawerOpen("edit", product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* フッター（一括削除 + ページネーション） */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            {/* 左側：一括削除ボタン */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  // TODO: 一括削除処理
                  alert(`${selectedIds.length}件の商品を削除しますか？`);
                }}
              >
                一括削除
              </Button>
            </div>

            {/* 中央：ページ情報 */}
            <div className="text-sm text-muted-foreground">
              全 {pagination.count} 件 ({pagination.page}/{totalPages || 1}ページ)
            </div>

            {/* 右側：表示件数 + ページネーション */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">表示件数:</span>
                <div className="flex gap-1">
                  {[20, 50, 100].map((size) => (
                    <Button
                      key={size}
                      variant={pagination.limit === size ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => updateQuery({ limit: size, page: 1 })}
                    >
                      {size}件
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrevPage}
                  onClick={() => updateQuery({ page: pagination.page - 1 })}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <span className="px-2 text-sm">{pagination.page}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => updateQuery({ page: pagination.page + 1 })}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 編集シート */}
      <Sheet open={drawerState.open} onOpenChange={(open) => !open && handleDrawerClose()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerState.mode === "create" ? "商品を追加" : "商品を編集"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            {/* 商品画像 - 最上部に配置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">商品画像</h3>
              {drawerState.mode === "create" ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center text-muted-foreground">
                  <p className="text-sm">商品を保存した後、画像をアップロードできます</p>
                  <p className="text-xs mt-1">最大10枚、各5MBまで</p>
                </div>
              ) : drawerState.product ? (
                isLoadingImages ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    読み込み中...
                  </div>
                ) : (
                  <ProductImageManager
                    productId={drawerState.product.id}
                    images={productImages}
                    onImagesChange={setProductImages}
                    maxImages={10}
                    maxFileSize={5 * 1024 * 1024}
                  />
                )
              ) : null}
            </div>

            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">基本情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">商品コード *</Label>
                  <Input
                    id="code"
                    value={formState.code}
                    onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">商品区分</Label>
                  <Select
                    value={formState.category_id || "__none__"}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, category_id: value === "__none__" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">未設定</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">商品名 *</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* 価格設定 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">価格設定</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_hq">本部価格 (円)</Label>
                  <Input
                    id="price_hq"
                    type="number"
                    min="0"
                    value={formState.price_hq}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price_hq: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_branch">支局価格 (円)</Label>
                  <Input
                    id="price_branch"
                    type="number"
                    min="0"
                    value={formState.price_branch}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price_branch: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_classroom">教室価格 (円)</Label>
                  <Input
                    id="price_classroom"
                    type="number"
                    min="0"
                    value={formState.price_classroom}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price_classroom: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_retail">一般価格 (円)</Label>
                  <Input
                    id="price_retail"
                    type="number"
                    min="0"
                    value={formState.price_retail}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price_retail: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* 在庫・注文設定 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">在庫・注文設定</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">在庫数</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formState.stock}
                    onChange={(e) => setFormState((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_alert">在庫警告閾値</Label>
                  <Input
                    id="stock_alert"
                    type="number"
                    min="0"
                    value={formState.stock_alert_threshold}
                    onChange={(e) => setFormState((prev) => ({ ...prev, stock_alert_threshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_qty">最小注文数</Label>
                  <Input
                    id="min_qty"
                    type="number"
                    min="1"
                    value={formState.min_order_quantity}
                    onChange={(e) => setFormState((prev) => ({ ...prev, min_order_quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_unit">注文単位</Label>
                  <Input
                    id="order_unit"
                    value={formState.order_unit}
                    onChange={(e) => setFormState((prev) => ({ ...prev, order_unit: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* 税・表示設定 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">その他設定</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">税率 (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formState.tax_rate}
                    onChange={(e) => setFormState((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">表示順</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formState.display_order}
                    onChange={(e) => setFormState((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>税込み</Label>
                  <p className="text-xs text-muted-foreground">価格に税が含まれているかどうか</p>
                </div>
                <Switch
                  checked={formState.is_taxable}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, is_taxable: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>販売中</Label>
                  <p className="text-xs text-muted-foreground">オンにするとストアに表示されます</p>
                </div>
                <Switch
                  checked={formState.is_active}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleDrawerClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>商品を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{productToDelete?.name}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
