"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/header";
import { Plus, Eye, Edit, Trash2, Calendar, MapPin, Users, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead, type SortOrder } from "@/components/ui/sortable-table-head";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { trainingCategories, trainingCourses, flattenTrainings } from "../activities/data";

const TrainingVideoCard = ({ video }: { video: (typeof flattenTrainings)[number]["videos"][number] & { trainingTitle: string } }) => (
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
        <span>{video.trainingTitle}</span>
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

export default function TrainingsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(trainingCourses[0]?.id ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const selectedCourse = useMemo(
    () => trainingCourses.find((course) => course.id === selectedCourseId) ?? trainingCourses[0],
    [selectedCourseId],
  );

  const filteredTrainings = useMemo(() => {
    if (!selectedCourse) return [];
    if (selectedCategoryId === "all") return selectedCourse.trainings;
    return selectedCourse.trainings.filter((training) => training.categoryId === selectedCategoryId);
  }, [selectedCourse, selectedCategoryId]);

  const selectedParticipants = filteredTrainings.reduce((sum, training) => sum + training.enrolled, 0);
  const selectedRevenue = filteredTrainings.reduce((sum, training) => sum + training.price * training.enrolled, 0);
  const selectedPublished = filteredTrainings.filter((training) => training.status === "公開中").length;
  const selectedVideos = filteredTrainings.flatMap((training) =>
    training.videos.map((video) => ({ ...video, trainingTitle: training.title })),
  );

  const totalTrainings = flattenTrainings.length;
  const publishedTrainings = flattenTrainings.filter((training) => training.status === "公開中").length;
  const totalParticipants = flattenTrainings.reduce((sum, training) => sum + training.enrolled, 0);
  const totalRevenue = flattenTrainings.reduce((sum, training) => sum + training.price * training.enrolled, 0);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="研修管理"
        actions={
          <div className="flex gap-3">
            <Link
              href="/activities/categories"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              分類を管理
            </Link>
            <Link
              href="/activities/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              新規研修を作成
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <aside className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-bold tracking-wide text-foreground">研修コース</p>
            <p className="text-xs text-muted-foreground">コースを選択すると右側に紐づく研修が表示されます。</p>
          </div>
          <div className="divide-y">
            {trainingCourses.map((course) => {
              const isActive = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  className={`w-full px-4 py-3 text-left transition ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted/60"
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${isActive ? "text-primary-foreground" : "text-foreground"}`}>{course.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        course.status === "受付中"
                          ? isActive
                            ? "bg-primary/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                          : isActive
                            ? "bg-primary/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className={`text-xs ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {course.branch}・{course.periodLabel}
                  </p>
                  <p className={`mt-1 text-xs ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>{course.description}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-[15px] font-semibold uppercase tracking-wide text-primary">選択中のコース</p>
              <p className="text-lg font-bold text-foreground">{selectedCourse?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedCourse?.branch} / {selectedCourse?.periodLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">エクスポート</button>
              <button className="rounded-lg border border-primary/40 px-4 py-2 text-sm text-primary hover:bg-primary/10">コース設定</button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <StatCard title="コース全体の研修" value={`${selectedCourse?.trainings.length ?? 0}件`} subtitle={`全体: ${totalTrainings}件`} />
            <StatCard title="公開中" value={`${selectedPublished}件`} subtitle={`全体: ${publishedTrainings}件`} />
            <StatCard title="参加者" value={`${selectedParticipants}名`} subtitle={`全体: ${totalParticipants}名`} />
            <StatCard title="見込み収入" value={`¥${selectedRevenue.toLocaleString()}`} subtitle={`全体: ¥${totalRevenue.toLocaleString()}`} />
          </div>

          {/* テーブルヘッダー */}
          <div className="mt-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Checkbox aria-label="全て選択" />
                <span className="text-sm text-muted-foreground">全て選択</span>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="研修名で検索" className="w-[160px]" />
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {trainingCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="__all__">
                  <SelectTrigger className="w-[100px]">
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
                  エクスポート
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[40px] pl-4 cursor-default hover:bg-transparent">
                    <span className="sr-only">選択</span>
                  </SortableTableHead>
                  <SortableTableHead sortKey="title" currentSortKey={null} currentSortOrder={null} onSort={() => {}}>
                    研修名
                  </SortableTableHead>
                  <SortableTableHead sortKey="categoryId" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[80px]">
                    分類
                  </SortableTableHead>
                  <SortableTableHead sortKey="date" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[120px]">
                    日時
                  </SortableTableHead>
                  <SortableTableHead sortKey="location" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[80px]">
                    場所
                  </SortableTableHead>
                  <SortableTableHead sortKey="enrolled" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[100px]">
                    参加状況
                  </SortableTableHead>
                  <SortableTableHead sortKey="price" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[70px]">
                    価格
                  </SortableTableHead>
                  <SortableTableHead sortKey="status" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[70px]">
                    ステータス
                  </SortableTableHead>
                  <SortableTableHead sortKey="" currentSortKey={null} currentSortOrder={null} onSort={() => {}} className="w-[90px] text-right cursor-default hover:bg-transparent">
                    操作
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => {
                  const category = trainingCategories.find((c) => c.id === training.categoryId);
                  return (
                    <TableRow key={training.id} className="border-b border-border">
                      <TableCell className="pl-4">
                        <Checkbox aria-label={`${training.title} を選択`} />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{training.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {training.requiredMembership === "premium" ? "プレミアム限定" : "全会員"}
                        </div>
                        {training.videos.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            動画 {training.videos.length}件
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${category?.colorClass ?? "bg-muted text-muted-foreground"}`}>
                          {category?.name ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {training.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {training.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          {training.enrolled}/{training.capacity}名
                        </div>
                        <div className="mt-1 h-1 w-full rounded-full bg-muted">
                          <div className="h-1 rounded-full bg-primary" style={{ width: `${(training.enrolled / training.capacity) * 100}%` }} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {training.price === 0 ? "無料" : `¥${training.price.toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${training.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {training.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Link href={`/trainings/${training.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* フッター */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
                一括削除
              </Button>
              <div className="text-sm text-muted-foreground">
                全 {filteredTrainings.length} 件 (1/1ページ)
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
          </div>

          {selectedVideos.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">動画コンテンツ</p>
                  <p className="text-xs text-muted-foreground">選択中のコースに紐づく研修動画です。</p>
                </div>
                <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">動画を追加</button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedVideos.map((video) => (
                  <TrainingVideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
