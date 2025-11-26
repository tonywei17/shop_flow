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
    <div className="space-y-6">
      <DashboardHeader title="システム項目管理" actions={null} />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-border text-sm text-foreground">
                <TableHead className="w-[180px]">ID</TableHead>
                <TableHead className="w-[220px]">項目名</TableHead>
                <TableHead>説明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((f) => (
                <TableRow key={f.id} className="border-b border-border text-sm">
                  <TableCell className="font-mono text-xs text-muted-foreground">{f.id}</TableCell>
                  <TableCell className="text-foreground">{f.name}</TableCell>
                  <TableCell className="text-muted-foreground">{f.description}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="border-b border-border py-6 text-center text-sm text-muted-foreground"
                >
                  CSV からの項目追加や編集機能は今後追加予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
