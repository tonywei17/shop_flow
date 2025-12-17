"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LocalSearchInput } from "@/components/ui/local-search-input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import type { Order, Product } from "./page";
import { CreateOrderDialog } from "./create-order-dialog";
import { MonthPicker, getCurrentMonth, formatMonthDisplay } from "@/components/billing/month-picker";
import { ClientSortableTableHead, useClientSort } from "@/components/ui/client-sortable-table-head";

type OrdersClientProps = {
  orders: Order[];
  error: string | null;
  products: Product[];
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "処理中", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  processing: { label: "準備中", variant: "default", icon: <Package className="h-3 w-3" /> },
  shipped: { label: "発送済", variant: "default", icon: <Truck className="h-3 w-3" /> },
  delivered: { label: "配達完了", variant: "outline", icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: "キャンセル", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unpaid: { label: "未払い", variant: "destructive" },
  paid: { label: "支払済", variant: "default" },
  refunded: { label: "返金済", variant: "secondary" },
};

const PRICE_TYPE_MAP: Record<string, string> = {
  hq: "本部",
  branch: "支局",
  classroom: "教室",
  retail: "一般",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function OrdersClient({ orders, error, products }: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [paymentFilter, setPaymentFilter] = React.useState<string>("all");
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getCurrentMonth());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      // Month filter
      if (selectedMonth) {
        const orderDate = new Date(order.created_at);
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
        if (orderMonth !== selectedMonth) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name?.toLowerCase().includes(query) ||
          order.customer_email?.toLowerCase().includes(query) ||
          order.shipping_address?.recipientName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, selectedMonth]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
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

  const isAllSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;

  // Sorting
  const { sortConfig, handleSort, sortedData: sortedOrders } = useClientSort(filteredOrders, "created_at", "desc");

  // Stats - based on month-filtered orders
  const monthFilteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      if (selectedMonth) {
        const orderDate = new Date(order.created_at);
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
        if (orderMonth !== selectedMonth) return false;
      }
      return true;
    });
  }, [orders, selectedMonth]);

  const stats = React.useMemo(() => {
    const total = monthFilteredOrders.length;
    const pending = monthFilteredOrders.filter((o) => o.status === "pending").length;
    const processing = monthFilteredOrders.filter((o) => o.status === "processing").length;
    const shipped = monthFilteredOrders.filter((o) => o.status === "shipped").length;
    const totalAmount = monthFilteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return { total, pending, processing, shipped, totalAmount };
  }, [monthFilteredOrders]);

  return (
    <div className="space-y-6">
      {/* Month Picker */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">対象月分:</span>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          <span className="text-sm text-muted-foreground">
            {formatMonthDisplay(selectedMonth)} のデータを表示中
          </span>
        </div>
        <p className="text-xs text-muted-foreground ml-1">
          ※「月分」は該当月内に発生したデータの請求期間を指します
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">総注文数</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">処理中</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">準備中</div>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">発送済</div>
            <div className="text-2xl font-bold text-green-600">{stats.shipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">総売上</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <label htmlFor="orders-select-all" className="flex items-center gap-2">
                <Checkbox
                  id="orders-select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全て選択"
                />
                <span className="text-sm">全て選択</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LocalSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="注文番号・顧客名で検索"
                className="w-[240px]"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="pending">処理中</SelectItem>
                  <SelectItem value="processing">準備中</SelectItem>
                  <SelectItem value="shipped">発送済</SelectItem>
                  <SelectItem value="delivered">配達完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="支払状況" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="unpaid">未払い</SelectItem>
                  <SelectItem value="paid">支払済</SelectItem>
                  <SelectItem value="refunded">返金済</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 border-primary text-primary bg-white hover:text-green-600 hover:font-bold">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <CreateOrderDialog 
                products={products} 
                onOrderCreated={() => window.location.reload()} 
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-[40px] pl-6">
                  <Checkbox aria-label="行を選択" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <ClientSortableTableHead sortKey="order_number" sortConfig={sortConfig} onSort={handleSort} className="w-[160px]">
                  注文番号
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="customer_name" sortConfig={sortConfig} onSort={handleSort} className="w-[180px]">
                  顧客名
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="item_count" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  商品数
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="total_amount" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  合計金額
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="price_type" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  価格タイプ
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="w-[120px]">
                  ステータス
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="payment_status" sortConfig={sortConfig} onSort={handleSort} className="w-[100px]">
                  支払状況
                </ClientSortableTableHead>
                <ClientSortableTableHead sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} className="w-[160px]">
                  注文日時
                </ClientSortableTableHead>
                <TableHead className="w-[80px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : sortedOrders.length > 0 ? (
                sortedOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, variant: "secondary" as const, icon: null };
                  const paymentInfo = PAYMENT_STATUS_MAP[order.payment_status || "unpaid"] || { label: order.payment_status || "-", variant: "secondary" as const };

                  return (
                    <TableRow key={order.id} className="border-b border-border">
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedIds.has(order.id)}
                          onCheckedChange={(checked) => handleSelectOne(order.id, !!checked)}
                          aria-label={`${order.order_number} を選択`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/commerce/orders/${order.id}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          {order.customer_email && (
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{order.item_count}点</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {PRICE_TYPE_MAP[order.price_type] || order.price_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/commerce/orders/${order.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                詳細を見る
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              ステータス変更
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    注文データがありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <div className="text-sm text-muted-foreground">
              全 {filteredOrders.length} 件
              {selectedIds.size > 0 && ` (${selectedIds.size}件選択中)`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
