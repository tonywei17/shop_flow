import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fields = [
  { id: "counterparty", name: "相手先", description: "請求・支払先を選択するためのマスタ" },
  { id: "account-item", name: "勘定項目", description: "経費処理に利用する勘定科目" },
  { id: "project", name: "案件名", description: "プロジェクトやワークフローの紐付け" },
];

export default function SystemFieldPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="システム項目管理"
        actions={null}
      />
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>項目名</TableHead>
                  <TableHead>説明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.id}</TableCell>
                    <TableCell>{f.name}</TableCell>
                    <TableCell>{f.description}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                    CSV からの項目追加や編集機能は今後追加予定です。
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
