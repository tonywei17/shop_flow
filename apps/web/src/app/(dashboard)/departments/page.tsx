import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, Building2, FolderTree } from "lucide-react";

const departments = [
  { id: "dept-hq", name: "本部", parent: "-", manager: "吉田 直樹", stores: 18 },
  { id: "dept-tokyo", name: "東京支局", parent: "本部", manager: "山田 太郎", stores: 26 },
  { id: "dept-osaka", name: "大阪支局", parent: "本部", manager: "佐藤 花子", stores: 19 },
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="部署管理" />
      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-sm text-[#111111]">
            <label htmlFor="dept-select-all" className="flex items-center gap-3">
              <Checkbox id="dept-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                組織図エクスポート
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                組織構成を編集
              </Button>
            </div>
          </div>
          <Table className="[&_th]:py-3 [&_td]:py-3 text-sm">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[180px]">部署ID</TableHead>
                <TableHead className="w-[200px]">部署名</TableHead>
                <TableHead className="w-[160px]">上位部署</TableHead>
                <TableHead className="w-[200px]">責任者</TableHead>
                <TableHead className="w-[140px]">所属教室数</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id} className="border-b border-[#11111114]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${dept.name} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#555555]">{dept.id}</TableCell>
                  <TableCell className="text-[#111111] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#6b7280]" />
                    {dept.name}
                  </TableCell>
                  <TableCell className="text-[#555555]">{dept.parent}</TableCell>
                  <TableCell className="text-[#555555]">{dept.manager}</TableCell>
                  <TableCell className="text-[#111111]">{dept.stores}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" className="text-[#00ac4d] hover:bg-[#00ac4d14]">
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7} className="border-b border-[#11111114] py-6 text-center text-sm text-[#6f6f6f]">
                  多階層組織のドラッグ&ドロップ編集や支局別 KPI 連携は今後のリリースで提供予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
