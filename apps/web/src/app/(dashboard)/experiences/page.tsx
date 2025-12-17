"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, Edit, Trash2, Calendar, MapPin, Users, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead, type SortOrder } from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ExperienceVideo = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: number;
  status: "公開中" | "下書き";
  requiredMembership: "free" | "premium";
  uploadDate: string;
};

type Experience = {
  id: string;
  title: string;
  type: "体験" | "見学";
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  status: "公開中" | "下書き" | "終了";
  requiredMembership: "free" | "premium";
  videos: ExperienceVideo[];
};

const experiences: Experience[] = [
  {
    id: "exp-1",
    title: "リトミック体験会（無料）",
    type: "体験",
    date: "2025-11-20 14:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
    videos: [
      {
        id: "vid-exp-1",
        title: "体験会ダイジェスト",
        duration: "06:40",
        thumbnail: "https://placehold.co/320x180/22c55e/ffffff?text=Video",
        views: 128,
        status: "公開中",
        requiredMembership: "free",
        uploadDate: "2025-09-30",
      },
    ],
  },
  {
    id: "exp-2",
    title: "リトミック見学会",
    type: "見学",
    date: "2025-12-05 13:00",
    location: "オンライン",
    capacity: 50,
    enrolled: 35,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
    videos: [
      {
        id: "vid-exp-2",
        title: "オンライン参加ガイド",
        duration: "08:15",
        thumbnail: "https://placehold.co/320x180/2563eb/ffffff?text=Video",
        views: 212,
        status: "公開中",
        requiredMembership: "free",
        uploadDate: "2025-10-05",
      },
    ],
  },
  {
    id: "exp-3",
    title: "幼児クラス体験レッスン",
    type: "体験",
    date: "2025-12-12 10:00",
    location: "大阪支部",
    capacity: 25,
    enrolled: 18,
    price: 2000,
    status: "下書き",
    requiredMembership: "premium",
    videos: [],
  },
];

const totalExperiences = experiences.length;
const publishedExperiences = experiences.filter((exp) => exp.status === "公開中").length;
const monthlyParticipants = experiences.reduce((sum, exp) => sum + exp.enrolled, 0);
const monthlyRevenue = experiences.reduce((sum, exp) => sum + exp.price * exp.enrolled, 0);
const allVideos = experiences.flatMap((exp) => exp.videos.map((video) => ({ ...video, experienceTitle: exp.title })));

export default function ExperiencesManagementPage() {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: string, order: SortOrder) => {
    setSortKey(order ? key : null);
    setSortOrder(order);
  };

  const sortedExperiences = useMemo(() => {
    if (!sortKey || !sortOrder) return experiences;
    return [...experiences].sort((a, b) => {
      const aVal = a[sortKey as keyof Experience];
      const bVal = b[sortKey as keyof Experience];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortOrder]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="見学・体験管理" />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="総イベント数" value={`${totalExperiences}件`} />
        <StatCard title="公開中" value={`${publishedExperiences}件`} />
        <StatCard title="今月の参加者" value={`${monthlyParticipants}名`} />
        <StatCard title="今月の収入" value={`¥${monthlyRevenue.toLocaleString()}`} />
      </div>

      {/* Experiences Table */}
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          {/* テーブルヘッダー */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <Checkbox aria-label="全て選択" />
              <span className="text-sm text-muted-foreground">全て選択</span>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="イベント名で検索" className="w-[180px]" />
              <Select defaultValue="__all__">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="種類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  <SelectItem value="体験">体験</SelectItem>
                  <SelectItem value="見学">見学</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="__all__">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">すべて</SelectItem>
                  <SelectItem value="公開中">公開中</SelectItem>
                  <SelectItem value="下書き">下書き</SelectItem>
                  <SelectItem value="終了">終了</SelectItem>
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
              <Button asChild size="sm" className="gap-1">
                <Link href="/experiences/new">
                  <Plus className="h-4 w-4" />
                  新規作成
                </Link>
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
                  イベント名
                </SortableTableHead>
                <SortableTableHead sortKey="type" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[80px]">
                  種類
                </SortableTableHead>
                <SortableTableHead sortKey="date" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[140px]">
                  日時
                </SortableTableHead>
                <SortableTableHead sortKey="location" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[100px]">
                  場所
                </SortableTableHead>
                <SortableTableHead sortKey="enrolled" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[120px]">
                  参加状況
                </SortableTableHead>
                <SortableTableHead sortKey="price" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[80px]">
                  価格
                </SortableTableHead>
                <SortableTableHead sortKey="status" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="w-[80px]">
                  ステータス
                </SortableTableHead>
                <SortableTableHead sortKey="" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={() => {}} className="w-[100px] text-right cursor-default hover:bg-transparent">
                  操作
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {sortedExperiences.map((experience) => (
              <TableRow key={experience.id} className="border-b border-border">
                <TableCell className="pl-6">
                  <Checkbox aria-label={`${experience.title} を選択`} />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{experience.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {experience.requiredMembership === "premium" ? "プレミアム限定" : "全会員"}
                  </div>
                  {experience.videos.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      動画 {experience.videos.length}件
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${experience.type === "体験" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground"}`}>
                    {experience.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {experience.date}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {experience.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {experience.enrolled}/{experience.capacity}名
                  </div>
                  <div className="mt-1 h-1 w-full rounded-full bg-muted">
                    <div className="h-1 rounded-full bg-primary" style={{ width: `${(experience.enrolled / experience.capacity) * 100}%` }} />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {experience.price === 0 ? "無料" : `¥${experience.price.toLocaleString()}`}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${experience.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {experience.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Link href={`/experiences/${experience.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
              全 {experiences.length} 件 (1/1ページ)
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

      {allVideos.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">動画コンテンツ</p>
              <p className="text-xs text-muted-foreground">見学・体験イベントに紐づく動画一覧です。</p>
            </div>
            <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">動画を追加</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allVideos.map((video) => (
              <ExperienceVideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function ExperienceVideoCard({ video }: { video: ExperienceVideo & { experienceTitle: string } }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="relative h-40 overflow-hidden rounded-t-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={320}
          height={180}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{video.duration}</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.experienceTitle}</span>
          <span>{video.uploadDate}</span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{video.title}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.views}回再生</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              video.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {video.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">詳細</button>
          <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">編集</button>
        </div>
      </div>
    </div>
  );
}
