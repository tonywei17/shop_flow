"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/header";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";

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

          <div className="mt-6 rounded-xl border border-border bg-muted/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  type="text"
                  placeholder="研修名で検索..."
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <select
                className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                <option value="all">すべての種類</option>
                {trainingCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <option>全てのステータス</option>
                <option>公開中</option>
                <option>下書き</option>
                <option>終了</option>
              </select>
              <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
                <Filter className="h-4 w-4" />
                フィルター
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">研修名</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">分類</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">日時</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">場所</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">参加状況</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">価格</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">ステータス</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainings.map((training) => {
                  const category = trainingCategories.find((c) => c.id === training.categoryId);
                  return (
                    <tr key={training.id} className="border-b border-border last:border-b-0 hover:bg-muted/60">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{training.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {training.requiredMembership === "premium" ? "プレミアム会員限定" : "全会員"}
                        </p>
                        {training.videos.length > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            動画 {training.videos.length}件
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${category?.colorClass ?? "bg-muted text-muted-foreground"}`}>
                          {category?.name ?? "-"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {training.date}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {training.location}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {training.enrolled}/{training.capacity}名
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(training.enrolled / training.capacity) * 100}%` }} />
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">
                        {training.price === 0 ? "無料" : `¥${training.price.toLocaleString()}`}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          training.status === "公開中" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {training.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/trainings/${training.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="詳細・チェックイン">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="編集">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-destructive hover:bg-destructive/10 hover:text-destructive" title="削除">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
