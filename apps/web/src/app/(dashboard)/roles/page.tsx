"use client";

import * as React from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const roleRows = [
  {
    id: 1,
    key: "admin",
    name: "スーパアドミン",
    tag: { label: "本社管理", className: "bg-[#e5f5ec] text-[#00ac4d]" },
    color: "グレー",
    permissions: ["すべて"],
  },
  {
    id: 2,
    key: "honbu-m",
    name: "本社管理",
    tag: { label: "本社管理", className: "bg-[#e5f5ec] text-[#00ac4d]" },
    color: "緑",
    permissions: ["すべて"],
  },
  {
    id: 3,
    key: "honbu-n",
    name: "木本一般",
    tag: { label: "木本一般", className: "bg-[#fff5e6] text-[#d9822b]" },
    color: "茶",
    permissions: ["商品管理", "注文管理", "顧客管理"],
  },
  {
    id: 4,
    key: "shikyoku",
    name: "支局",
    tag: { label: "支局", className: "bg-[#fff8db] text-[#d6a200]" },
    color: "黄",
    permissions: ["請求一覧"],
  },
  {
    id: 5,
    key: "kyoushitu",
    name: "教室",
    tag: { label: "教室", className: "bg-[#f2efff] text-[#6a4ce4]" },
    color: "紫",
    permissions: ["請求一覧"],
  },
];

export default function RolesPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <DashboardHeader title="ロール管理" />

      <Card className="rounded-xl border border-[#11111114] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#11111114] px-6 py-3 text-[14px] text-[#111111]">
            <label htmlFor="select-all" className="flex items-center gap-3">
              <Checkbox id="select-all" aria-label="全て選択" />
              <span>全て選択</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]"
              >
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
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-3 rounded-[4px] bg-[#00ac4d] px-4 py-[6px] text-sm font-medium text-white hover:bg-[#00943f]">
                    <Plus className="h-[14px] w-[14px]" />
                    <span className="text-[12px] font-medium">新規追加</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="fixed right-0 top-0 h-full max-h-full w-full max-w-[440px] translate-x-0 rounded-none border-l border-[#11111114] bg-white px-0 py-0 text-[#111111] shadow-[0_0_24px_rgba(17,17,17,0.08)] sm:w-[420px]">
                  <div className="flex h-full flex-col">
                    <DialogHeader className="border-b border-[#11111114] px-6 py-4">
                      <DialogTitle className="text-[18px] font-semibold text-[#111111]">新規ロール作成</DialogTitle>
                    </DialogHeader>
                    <form
                      className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        const payload = {
                          roleId: form.get("roleId"),
                          roleKey: form.get("roleKey"),
                          roleName: form.get("roleName"),
                          permissions: form.get("permissions"),
                        };
                        console.log("新規ロール", payload);
                        setOpen(false);
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="roleId">ロールID</Label>
                        <Input id="roleId" name="roleId" placeholder="6" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleKey">ロールキー</Label>
                        <Input id="roleKey" name="roleKey" placeholder="honbu-admin" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleName">ロール名</Label>
                        <Input id="roleName" name="roleName" placeholder="本社管理" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permissions">機能権限</Label>
                        <Textarea
                          id="permissions"
                          name="permissions"
                          rows={4}
                          placeholder="例：商品管理, 注文管理"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">備考</Label>
                        <Textarea id="notes" name="notes" rows={3} placeholder="任意のメモ" />
                      </div>
                      <DialogFooter className="mt-auto border-t border-[#11111114] px-0 pt-4">
                        <div className="flex w-full justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            キャンセル
                          </Button>
                          <Button type="submit" className="bg-[#00ac4d] text-white hover:bg-[#00943f]">
                            作成する
                          </Button>
                        </div>
                      </DialogFooter>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Table className="[&_th]:py-3 [&_td]:py-3">
            <TableHeader>
              <TableRow className="border-b border-[#11111114] text-[14px] text-[#111111]">
                <TableHead className="w-[36px] pl-6 pr-3">
                  <Checkbox aria-label="行を選択" />
                </TableHead>
                <TableHead className="w-[80px]">ロールID</TableHead>
                <TableHead className="w-[100px]">ロールキー</TableHead>
                <TableHead className="w-[160px]">ロール名</TableHead>
                <TableHead className="w-[80px]">表示色</TableHead>
                <TableHead className="w-[344px]">機能権限</TableHead>
                <TableHead className="w-[120px] pr-6 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleRows.map((role) => (
                <TableRow key={role.id} className="border-b border-[#11111114] text-[14px]">
                  <TableCell className="pl-6 pr-3">
                    <Checkbox aria-label={`${role.name} を選択`} />
                  </TableCell>
                  <TableCell className="font-medium text-[#111111]">{role.id}</TableCell>
                  <TableCell className="font-mono text-[#555555]">{role.key}</TableCell>
                  <TableCell>
                    <Badge className={`border-none px-3 py-1 text-[12px] ${role.tag.className}`}>{role.tag.label}</Badge>
                  </TableCell>
                  <TableCell className="text-[#555555]">{role.color}</TableCell>
                  <TableCell className="text-[#555555]">
                    {role.permissions.length === 1 ? (
                      <span>{role.permissions[0]}</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {role.permissions.map((permission) => (
                          <span key={permission}>・{permission}</span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="sm" className="gap-1 px-2 py-1 text-[#00ac4d] hover:bg-[#00ac4d14]">
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end border-t border-[#11111114] px-6 py-4">
            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="px-2" />
                </PaginationItem>
                {[1, 2, 3, 4].map((page) => (
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
                  <PaginationLink href="#">50</PaginationLink>
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
