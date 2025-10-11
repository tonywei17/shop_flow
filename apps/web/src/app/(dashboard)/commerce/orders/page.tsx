import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMedusaClient } from "@enterprise/domain-commerce";
import Link from "next/link";

type AdminOrder = {
  id: string;
  status?: string | null;
  email?: string | null;
  display_id?: number | null;
};

export default async function OrdersListPage() {
  const medusa = createMedusaClient();
  let rows: AdminOrder[] = [];
  let errorMsg = "";
  try {
    const data = await medusa.listOrders({ limit: 20 });
    const list = (data as { orders?: AdminOrder[] } | undefined)?.orders;
    rows = Array.isArray(list) ? list : [];
    if (!rows.length) errorMsg = "受注データが存在しません。";
  } catch {
    errorMsg = "MEDUSA_BASE_URL と MEDUSA_ADMIN_TOKEN を設定してください。";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="受注一覧"
        actions={(
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/commerce">商品管理に戻る</Link></Button>
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
                  <TableHead>注文番号</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>顧客メール</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell>{o.display_id ?? "-"}</TableCell>
                      <TableCell className="capitalize">{o.status ?? "-"}</TableCell>
                      <TableCell>{o.email ?? "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      {errorMsg || "受注データがありません。"}
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
