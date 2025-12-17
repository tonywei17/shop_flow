"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Download, Eye, Mail, Users, UserCheck, UserPlus, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableTableHead, type SortOrder } from "@/components/ui/sortable-table-head";

type Member = {
  id: string;
  name: string;
  email: string;
  membershipType: "premium" | "trial";
  joinDate: string;
  lastActive: string;
  coursesEnrolled: number;
  qualifications: number;
  totalSpent: number;
};

// Mock data
const members: Member[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    membershipType: "premium",
    joinDate: "2024-06-15",
    lastActive: "2025-11-09",
    coursesEnrolled: 5,
    qualifications: 2,
    totalSpent: 45800,
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@example.com",
    membershipType: "trial",
    joinDate: "2024-09-20",
    lastActive: "2025-11-10",
    coursesEnrolled: 1,
    qualifications: 0,
    totalSpent: 0,
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    membershipType: "premium",
    joinDate: "2024-03-10",
    lastActive: "2025-11-08",
    coursesEnrolled: 8,
    qualifications: 3,
    totalSpent: 89600,
  },
  {
    id: "4",
    name: "田中美咲",
    email: "tanaka@example.com",
    membershipType: "trial",
    joinDate: "2025-10-01",
    lastActive: "2025-11-10",
    coursesEnrolled: 2,
    qualifications: 0,
    totalSpent: 8000,
  },
];

export default function MembersPage() {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: string, order: SortOrder) => {
    setSortKey(order ? key : null);
    setSortOrder(order);
  };

  const sortedMembers = useMemo(() => {
    if (!sortKey || !sortOrder) return members;
    return [...members].sort((a, b) => {
      const aVal = a[sortKey as keyof Member];
      const bVal = b[sortKey as keyof Member];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortOrder]);

  const totalMembers = members.length;
  const premiumMembers = members.filter((member) => member.membershipType === "premium").length;
  const trialMembers = members.filter((member) => member.membershipType === "trial").length;
  const pagination = { page: 1, limit: 20, count: 1234 };
  const totalPages = Math.ceil(pagination.count / pagination.limit);

  return (
    <div className="space-y-6">
      <DashboardHeader title="会員管理" />

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">総会員数</p>
                <p className="text-3xl font-bold">{totalMembers.toLocaleString()}名</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">プレミアム会員</p>
                <p className="text-3xl font-bold">{premiumMembers}名</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">仮会員</p>
                <p className="text-3xl font-bold">{trialMembers}名</p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <UserPlus className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の新規</p>
                <p className="text-3xl font-bold">89名</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* テーブル */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* テーブルヘッダー */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <Checkbox aria-label="全て選択" />
              <span className="text-sm text-muted-foreground">全て選択</span>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="会員名・メールで検索" className="w-[200px]" />
              <Select defaultValue="__all__">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="会員タイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  <SelectItem value="premium">プレミアム</SelectItem>
                  <SelectItem value="trial">仮会員</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">検索</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" size="sm" className="gap-1 border-primary text-primary bg-white hover:text-green-600 hover:font-bold">
                <Download className="h-4 w-4" />
                エクスポート
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <SortableTableHead sortKey="" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={() => {}} className="w-[40px] pl-6 cursor-default hover:bg-transparent">
                  <span className="sr-only">選択</span>
                </SortableTableHead>
                <SortableTableHead sortKey="name" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort}>
                  会員名
                </SortableTableHead>
                <SortableTableHead sortKey="email" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort}>
                  メールアドレス
                </SortableTableHead>
                <SortableTableHead sortKey="membershipType" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[120px]">
                  会員タイプ
                </SortableTableHead>
                <SortableTableHead sortKey="joinDate" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px]">
                  登録日
                </SortableTableHead>
                <SortableTableHead sortKey="coursesEnrolled" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[80px] text-center">
                  受講
                </SortableTableHead>
                <SortableTableHead sortKey="qualifications" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[80px] text-center">
                  資格
                </SortableTableHead>
                <SortableTableHead sortKey="totalSpent" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px] text-right">
                  総支払額
                </SortableTableHead>
                <SortableTableHead sortKey="" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={() => {}} className="w-[100px] text-right cursor-default hover:bg-transparent">
                  操作
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id} className="border-b border-border">
                  <TableCell className="pl-6">
                    <Checkbox aria-label={`${member.name} を選択`} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">最終: {member.lastActive}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${member.membershipType === "premium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {member.membershipType === "premium" ? "プレミアム" : "仮会員"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                  <TableCell className="text-center">{member.coursesEnrolled}</TableCell>
                  <TableCell className="text-center">{member.qualifications}</TableCell>
                  <TableCell className="text-right font-medium">¥{member.totalSpent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Link href={`/members/${member.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* フッター */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
              一括削除
            </Button>
            <div className="text-sm text-muted-foreground">
              全 {pagination.count} 件 ({pagination.page}/{totalPages}ページ)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">表示件数:</span>
                <div className="flex gap-1">
                  {[20, 50, 100].map((size) => (
                    <Button key={size} variant={pagination.limit === size ? "default" : "outline"} size="sm" className="h-7 px-2 text-xs">
                      {size}件
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled>前へ</Button>
                <span className="px-2 text-sm">{pagination.page}</span>
                <Button variant="ghost" size="sm">次へ</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 text-sm text-muted-foreground">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className={`text-sm font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
          {change}
        </div>
      </div>
    </div>
  );
}
