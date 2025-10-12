import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Download, Eye } from "lucide-react";

type OrderRow = {
  id: string;
  status?: string | null;
  email?: string | null;
  display_id?: string | number | null;
};

export default async function OrdersListPage() {
  const rows: OrderRow[] = [];
  const errorMsg = "Supabase の受注テーブルは未実装です。今後のスプリントで対応予定です。";

  return (
    <div className="space-y-6">
      <DashboardHeader title="受注一覧" />
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="orders-select-all" className="flex items-center gap-3">
              <Checkbox id="orders-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]"
              >
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#4190ff] text-[#4190ff] hover:bg-[#e7f0ff]"
              >
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/commerce">商品管理に戻る</Link>
              </Button>
            </div>
          </div>

          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[200px]">ID</TableHead>
                <TableHead className="w-[160px]">注文番号</TableHead>
                <TableHead className="w-[160px]">ステータス</TableHead>
                <TableHead className="w-[220px]">顧客メール</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((o) => (
                  <TableRow key={o.id} className="border-b border-[#11111114] text-[14px]">
                    <TableCell className="pl-6 pr-3">
                      <Checkbox aria-label={`${o.display_id ?? o.id} を選択`} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#555555]">{o.id}</TableCell>
                    <TableCell className="text-[#111111]">{o.display_id ?? "-"}</TableCell>
                    <TableCell className="text-[#555555] capitalize">{o.status ?? "-"}</TableCell>
                    <TableCell className="text-[#555555]">{o.email ?? "-"}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button asChild variant="ghost" size="sm" className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                        <Link href={`/commerce/orders/${o.id}`}>
                          <Eye className="h-4 w-4" />
                          詳細
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="border-b border-[#11111114] py-10 text-center text-sm text-[#6f6f6f]">
                    {errorMsg || "受注データがありません。"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end border-t border-[#11111114] px-6 py-4">
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
                  <PaginationLink href="#">32</PaginationLink>
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
