import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rows = [
  { id: "role-admin", name: "管理者", type: "ロール", detail: "すべての機能へのフルアクセス" },
  { id: "role-approver", name: "承認者", type: "ロール", detail: "申請書の承認・差し戻し" },
  { id: "dept-sales", name: "営業部", type: "部門", detail: "営業関連の申請と商品閲覧" },
  { id: "user-sato", name: "佐藤 花子", type: "アカウント", detail: "営業部 / 承認者" },
];

export default function PermissionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="権限管理" actions={null} />
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>説明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.detail}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                    ロール・部門・アカウントの一括更新（CSV/Excel）と階層権限制御は今後実装予定です。
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
