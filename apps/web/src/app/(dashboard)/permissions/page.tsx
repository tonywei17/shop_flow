import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, Edit } from "lucide-react";

const rows = [
  { id: "role-admin", name: "管理者", type: "ロール", detail: "すべての機能へのフルアクセス" },
  { id: "role-approver", name: "承認者", type: "ロール", detail: "申請書の承認・差し戻し" },
  { id: "dept-sales", name: "営業部", type: "部門", detail: "営業関連の申請と商品閲覧" },
  { id: "user-sato", name: "佐藤 花子", type: "アカウント", detail: "営業部 / 承認者" },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="権限管理" actions={null} />
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="permissions-select-all" className="flex items-center gap-3">
              <Checkbox id="permissions-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
              <Download className="h-4 w-4" />
              一括操作
            </Button>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[180px]">ID</TableHead>
                <TableHead className="w-[200px]">名称</TableHead>
                <TableHead className="w-[160px]">種別</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-b border-[#11111114] text-[14px]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${row.name} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#555555]">{row.id}</TableCell>
                  <TableCell className="text-[#111111]">{row.name}</TableCell>
                  <TableCell className="text-[#555555]">{row.type}</TableCell>
                  <TableCell className="text-[#555555]">{row.detail}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} className="border-b border-[#11111114] py-6 text-center text-sm text-[#6f6f6f]">
                  ロール・部門・アカウントの一括更新（CSV/Excel）と階層権限制御は今後実装予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
