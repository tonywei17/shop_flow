import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const mockRequests = [
  { id: "2024-0001", period: "2024/04", status: "処理済", result: "CSV → Langflow 推論完了" },
  { id: "2024-0002", period: "2024/05", status: "未処理", result: "CSV アップロード待ち" },
];

export default function RequestFormsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="申請書管理" actions={null} />
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>対象期間</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.result}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                    CSV アップロード → Langflow API 推論 → 結果レビューの一連フローは近日公開予定です。
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
