import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Edit, Plus } from "lucide-react";

const accounts = [
  {
    id: "acct-001",
    name: "山田 太郎",
    email: "taro@example.com",
    department: "営業部",
    role: { label: "承認者", className: "bg-[#e5f5ec] text-[#00ac4d]" },
    status: "有効",
  },
  {
    id: "acct-002",
    name: "佐藤 花子",
    email: "hanako@example.com",
    department: "総務部",
    role: { label: "管理者", className: "bg-[#f2efff] text-[#6a4ce4]" },
    status: "有効",
  },
  {
    id: "acct-003",
    name: "高橋 健",
    email: "ken@example.com",
    department: "経理部",
    role: { label: "閲覧者", className: "bg-[#fff5e6] text-[#d9822b]" },
    status: "停止中",
  },
];

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="アカウント管理" />

      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="accounts-select-all" className="flex items-center gap-3">
              <Checkbox id="accounts-select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#4190ff] text-[#4190ff] hover:bg-[#e7f0ff]"
              >
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
              <Button className="flex items-center gap-3 rounded-[4px] bg-[#00ac4d] px-4 py-[6px] text-sm font-medium text-white hover:bg-[#00943f]">
                <Plus className="h-[14px] w-[14px]" />
                <span className="text-[12px] font-medium">新規追加</span>
              </Button>
            </div>
          </div>

          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[160px]">アカウントID</TableHead>
                <TableHead className="w-[180px]">氏名</TableHead>
                <TableHead className="w-[240px]">メールアドレス</TableHead>
                <TableHead className="w-[160px]">所属部署</TableHead>
                <TableHead className="w-[160px]">ロール</TableHead>
                <TableHead className="w-[120px]">ステータス</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="border-b border-[#11111114] text-[14px]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${account.name} を選択`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#555555]">{account.id}</TableCell>
                  <TableCell className="text-[#111111]">{account.name}</TableCell>
                  <TableCell className="text-[#555555]">{account.email}</TableCell>
                  <TableCell className="text-[#555555]">{account.department}</TableCell>
                  <TableCell>
                    <Badge className={`border-none px-3 py-1 text-[12px] ${account.role.className}`}>
                      {account.role.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#555555]">{account.status}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={8} className="border-b border-[#11111114] py-6 text-center text-sm text-[#6f6f6f]">
                  CSV インポートや複数アカウントの一括操作機能は近日提供予定です。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-end border-t border-[#11111114] px-6 py-4">
            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="px-2" />
                </PaginationItem>
                {[1, 2, 3].map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink href="#" isActive={page === 1} className="min-w-[36px]">
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">15</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="px-2" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
