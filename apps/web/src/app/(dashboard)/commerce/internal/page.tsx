import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listProducts } from "@enterprise/db";

export default async function InternalProductsPage() {
  const { products } = await listProducts({ limit: 50 }).catch((error) => {
    console.error("Failed to load Supabase products for internal commerce page", error);
    return { products: [], count: 0 };
  });
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="内部商品（Supabase）" />
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品コード</TableHead>
                  <TableHead>商品名</TableHead>
                  <TableHead>小売価格 (JPY)</TableHead>
                  <TableHead>在庫数</TableHead>
                  <TableHead>作成日時</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>¥{p.price_retail?.toLocaleString() ?? 0}</TableCell>
                      <TableCell>{p.stock ?? 0}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{p.created_at ? new Date(p.created_at).toLocaleString("ja-JP") : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                      Supabase 上に商品データがありません。「商品を登録」から追加してください。
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
