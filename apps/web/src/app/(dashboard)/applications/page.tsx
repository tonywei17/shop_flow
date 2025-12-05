"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Download, Calendar, MapPin, Award, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead, type SortOrder } from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const applicationTypes = [
  { value: "all", label: "全ての種類" },
  { value: "研修", label: "研修" },
  { value: "見学", label: "見学" },
  { value: "体験", label: "体験" },
  { value: "試験", label: "試験" },
];

const statusOptions = [
  { value: "all", label: "全てのステータス" },
  { value: "申込済", label: "申込済" },
  { value: "支払待ち", label: "支払待ち" },
  { value: "承認待ち", label: "承認待ち" },
  { value: "キャンセル", label: "キャンセル" },
];

const applications: Application[] = [
  {
    id: "app-001",
    title: "幼児指導法ワークショップ",
    eventType: "研修",
    category: "基礎研修",
    schedule: "2025-11-25 10:00",
    location: "東京本部",
    applicantName: "山田太郎",
    applicantEmail: "yamada@example.com",
    membershipType: "premium",
    paymentStatus: "支払済",
    status: "申込済",
    price: 8800,
  },
  {
    id: "app-002",
    title: "リトミック見学会",
    eventType: "見学",
    category: "オンライン",
    schedule: "2025-12-05 13:00",
    location: "オンライン",
    applicantName: "佐藤花子",
    applicantEmail: "sato@example.com",
    membershipType: "trial",
    paymentStatus: "不要",
    status: "承認待ち",
    price: 0,
  },
  {
    id: "app-003",
    title: "幼児クラス体験レッスン",
    eventType: "体験",
    category: "大阪支部",
    schedule: "2025-12-12 10:00",
    location: "大阪支部",
    applicantName: "鈴木一郎",
    applicantEmail: "suzuki@example.com",
    membershipType: "premium",
    paymentStatus: "支払待ち",
    status: "支払待ち",
    price: 2000,
  },
  {
    id: "app-004",
    title: "中級指導者認定試験",
    eventType: "試験",
    category: "資格更新",
    schedule: "2025-12-20 09:00",
    location: "名古屋支部",
    applicantName: "田中美咲",
    applicantEmail: "tanaka@example.com",
    membershipType: "trial",
    paymentStatus: "支払済",
    status: "申込済",
    price: 15000,
  },
  {
    id: "app-005",
    title: "基礎指導者コース",
    eventType: "研修",
    category: "コースパッケージ",
    schedule: "2025-12-01 09:30",
    location: "東京本部",
    applicantName: "高橋健太",
    applicantEmail: "takahashi@example.com",
    membershipType: "premium",
    paymentStatus: "返金済",
    status: "キャンセル",
    price: 0,
  },
];

export default function ApplicationsPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: string, order: SortOrder) => {
    setSortKey(order ? key : null);
    setSortOrder(order);
  };

  const filteredApplications = useMemo(() => {
    let result = applications.filter((application) => {
      const matchesKeyword = keyword
        ? application.title.includes(keyword) || application.applicantName.includes(keyword)
        : true;
      const matchesType = selectedType === "all" || application.eventType === selectedType;
      const matchesStatus = selectedStatus === "all" || application.status === selectedStatus;
      return matchesKeyword && matchesType && matchesStatus;
    });
    if (sortKey && sortOrder) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey as keyof Application];
        const bVal = b[sortKey as keyof Application];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [keyword, selectedType, selectedStatus, sortKey, sortOrder]);

  const stats = useMemo(() => {
    const totalRevenue = filteredApplications.reduce((sum, application) => sum + application.price, 0);
    return {
      total: filteredApplications.length,
      trainings: filteredApplications.filter((app) => app.eventType === "研修").length,
      experiences: filteredApplications.filter((app) => app.eventType === "見学" || app.eventType === "体験").length,
      exams: filteredApplications.filter((app) => app.eventType === "試験").length,
      revenue: totalRevenue,
    };
  }, [filteredApplications]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="申込一覧" />
      <p className="mt-2 text-sm text-muted-foreground">研修・見学/体験・試験の申込を一元管理できます</p>

      <div className="mb-4 grid gap-6 md:grid-cols-4">
        <StatCard title="総申込" value={`${stats.total}件`} accent="text-primary" />
        <StatCard title="研修" value={`${stats.trainings}件`} accent="text-primary" />
        <StatCard title="見学/体験" value={`${stats.experiences}件`} accent="text-primary" />
        <StatCard title="試験" value={`${stats.exams}件`} accent="text-primary" subtitle={`見込み売上 ¥${stats.revenue.toLocaleString()}`} />
      </div>

      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* テーブルヘッダー */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <Checkbox aria-label="全て選択" />
              <span className="text-sm text-muted-foreground">全て選択</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="申込対象・申込者で検索"
                className="w-[200px]"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="種類" />
                </SelectTrigger>
                <SelectContent>
                  {applicationTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">検索</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                一括操作
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
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
                <SortableTableHead sortKey="title" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort}>
                  申込対象
                </SortableTableHead>
                <SortableTableHead sortKey="category" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px]">
                  カテゴリ
                </SortableTableHead>
                <SortableTableHead sortKey="schedule" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[140px]">
                  開催日時
                </SortableTableHead>
                <SortableTableHead sortKey="applicantName" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort}>
                  申込者
                </SortableTableHead>
                <SortableTableHead sortKey="paymentStatus" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px]">
                  支払
                </SortableTableHead>
                <SortableTableHead sortKey="status" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px]">
                  ステータス
                </SortableTableHead>
                <SortableTableHead sortKey="" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={() => {}} className="w-[100px] text-right cursor-default hover:bg-transparent">
                  操作
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id} className="border-b border-border">
                <TableCell className="pl-6">
                  <Checkbox aria-label={`${application.title} を選択`} />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{application.title}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {iconByType(application.eventType)}
                    {application.eventType}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{application.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {application.schedule}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {application.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{application.applicantName}</div>
                  <p className="text-xs text-muted-foreground">{application.applicantEmail}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${application.membershipType === "premium" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {application.membershipType === "premium" ? "プレミアム" : "仮会員"}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium">{application.paymentStatus}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(application.status)}`}>
                    {application.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <Link href={`/${application.eventType === "試験" ? "exams" : application.eventType === "研修" ? "trainings" : "experiences"}/${application.id}`}>
                        詳細
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">更新</Button>
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
              全 {filteredApplications.length} 件 (1/1ページ)
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">表示件数:</span>
                <div className="flex gap-1">
                  {[20, 50, 100].map((size) => (
                    <Button key={size} variant={size === 20 ? "default" : "outline"} size="sm" className="h-7 px-2 text-xs">
                      {size}件
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled>前へ</Button>
                <span className="px-2 text-sm">1</span>
                <Button variant="ghost" size="sm" disabled>次へ</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type Application = {
  id: string;
  title: string;
  eventType: "研修" | "見学" | "体験" | "試験";
  category: string;
  schedule: string;
  location: string;
  applicantName: string;
  applicantEmail: string;
  membershipType: "premium" | "trial";
  paymentStatus: string;
  status: "申込済" | "承認待ち" | "支払待ち" | "キャンセル";
  price: number;
};

function StatCard({ title, value, subtitle, accent }: { title: string; value: string; subtitle?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className={`mt-1 text-xs font-medium ${accent ?? "text-muted-foreground"}`}>{subtitle}</p>}
    </div>
  );
}

function statusBadgeClass(status: Application["status"]) {
  switch (status) {
    case "申込済":
      return "bg-primary/10 text-primary";
    case "承認待ち":
      return "bg-secondary/10 text-secondary-foreground";
    case "支払待ち":
      return "bg-muted text-muted-foreground";
    case "キャンセル":
    default:
      return "bg-destructive/10 text-destructive";
  }
}

function iconByType(type: Application["eventType"]) {
  switch (type) {
    case "試験":
      return <Award className="h-3.5 w-3.5 text-primary" />;
    case "研修":
      return <Users className="h-3.5 w-3.5 text-primary" />;
    case "体験":
      return <Users className="h-3.5 w-3.5 text-secondary-foreground" />;
    case "見学":
    default:
      return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}
