import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockRequests = [
  { id: "2024-0001", period: "2024/04", status: "処理済", result: "CSV → Langflow 推論完了" },
  { id: "2024-0002", period: "2024/05", status: "未処理", result: "CSV アップロード待ち" },
];

export default function RequestFormsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="申請書管理" actions={null} />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[180px]">ID</TableHead>
                <TableHead className="w-[180px]">対象期間</TableHead>
                <TableHead className="w-[160px]">ステータス</TableHead>
                <TableHead>結果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRequests.map((row) => (
                <TableRow key={row.id} className="border-b border-border text-sm">
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="text-foreground">{row.period}</TableCell>
                  <TableCell className="text-muted-foreground">{row.status}</TableCell>
                  <TableCell className="text-muted-foreground">{row.result}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="border-b border-border py-6 text-center text-sm text-muted-foreground"
                >
                  CSV アップロード → Langflow API 推論 → 結果レビューの一連フローは近日公開予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
