import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { Download, Plus, Eye } from "lucide-react";
import { listProducts } from "@enterprise/db";

type SupabaseProduct = {
  id: string;
  sku: string;
  title: string;
  price_retail_cents?: number | null;
  stock?: number | null;
  created_at: string;
};

function formatPrice(cents?: number | null) {
  const value = typeof cents === "number" ? cents : 0;
  return (value / 100).toLocaleString("ja-JP", { style: "currency", currency: "JPY" });
}

export default async function CommerceListPage() {
  const { items } = await listProducts({ limit: 50 }).catch((error) => {
    console.error("Failed to load Supabase products for commerce page", error);
    return { items: [], count: 0 };
  });
  const rows = (items as SupabaseProduct[]) ?? [];
  const hasRows = rows.length > 0;

  return (
    <div className="space-y-6">
      <DashboardHeader title="オンラインストア管理" />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-foreground">
            <label htmlFor="products-select-all" className="flex items-center gap-3">
              <Checkbox id="products-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Button className="flex items-center gap-3 rounded-[4px] bg-primary px-4 py-[6px] text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-[14px] w-[14px]" />
                <Link href="/commerce/new" className="text-[12px] font-medium">
                  商品を登録
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/commerce/orders">受注一覧</Link>
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[200px]">SKU</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead className="w-[160px]">価格</TableHead>
                <TableHead className="w-[120px]">在庫数</TableHead>
                <TableHead className="w-[200px]">作成日時</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasRows ? (
                rows.map((p) => (
                  <TableRow key={p.id} className="border-b border-border text-sm">
                    <TableCell className="pl-6 pr-3">
                      <Checkbox aria-label={`${p.title} を選択`} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-foreground">{p.title}</TableCell>
                    <TableCell className="text-muted-foreground">{formatPrice(p.price_retail_cents ?? 0)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.stock ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1 px-2 py-1 text-primary hover:bg-primary/10"
                      >
                        <Link href={`/commerce/${p.id}`}>
                          <Eye className="h-4 w-4" />
                          詳細
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="border-b border-border py-10 text-center text-sm text-muted-foreground"
                  >
                    Supabase 上に商品データがありません。「商品を登録」から追加してください。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end border-t border-border px-6 py-4">
            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="px-2" />
                </PaginationItem>
                {[1, 2, 3].map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink href="#" isActive={page === 1} className="min-w-[36px]">
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">20</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="px-2" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
