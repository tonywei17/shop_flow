import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMedusaClient } from "@enterprise/domain-commerce";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type AdminProduct = {
  id: string;
  title: string;
  status?: string | null;
};

export default async function CommerceListPage() {
  const medusa = createMedusaClient();
  let rows: AdminProduct[] = [];
  let errorMsg = "";
  try {
    const data = await medusa.listProducts({ limit: 20 });
    const list = (data as { products?: AdminProduct[] } | undefined)?.products;
    rows = Array.isArray(list) ? list : [];
    if (!rows.length) {
      errorMsg = "No products found.";
    }
  } catch {
    errorMsg = "Configure MEDUSA_BASE_URL and MEDUSA_ADMIN_TOKEN to view products.";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="オンラインストア管理"
        actions={(
          <div className="flex gap-2">
            <Button asChild><Link href="/commerce/new">商品を登録</Link></Button>
            <Button asChild variant="outline"><Link href="/commerce/orders">受注一覧</Link></Button>
          </div>
        )}
      />
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>商品名</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell className="capitalize">{p.status ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/commerce/${p.id}`}>詳細</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      {errorMsg ? errorMsg : "商品が見つかりません。"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
