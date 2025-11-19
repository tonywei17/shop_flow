"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";

import { trainingCategories, trainingCourses, flattenTrainings } from "../activities/data";

const TrainingVideoCard = ({ video }: { video: (typeof flattenTrainings)[number]["videos"][number] & { trainingTitle: string } }) => (
  <div className="rounded-xl border bg-white shadow-sm">
    <div className="relative h-40 overflow-hidden rounded-t-xl">
      <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
      <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{video.duration}</span>
    </div>
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{video.trainingTitle}</span>
        <span>{video.uploadDate}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{video.title}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{video.views}回再生</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            video.status === "公開中" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {video.status}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 rounded-lg border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">詳細</button>
        <button className="flex-1 rounded-lg border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">編集</button>
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
    <div className="p-8">
      <DashboardHeader
        title="研修管理"
        actions={
          <div className="flex gap-3">
            <Link
              href="/activities/categories"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              分類を管理
            </Link>
            <Link
              href="/activities/new"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              新規研修を作成
            </Link>
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <aside className="rounded-2xl border bg-white">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-bold text-gray-900 tracking-wide">研修コース</p>
            <p className="text-xs text-gray-500">コースを選択すると右側に紐づく研修が表示されます。</p>
          </div>
          <div className="divide-y">
            {trainingCourses.map((course) => {
              const isActive = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  className={`w-full px-4 py-3 text-left transition ${
                    isActive ? "bg-emerald-600 text-white" : "bg-white hover:bg-emerald-50"
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>{course.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        course.status === "受付中"
                          ? isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                          : isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>{course.branch}・{course.periodLabel}</p>
                  <p className={`mt-1 text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>{course.description}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div>
              <p className="text-[15px] font-semibold text-blue-600 uppercase tracking-wide">選択中のコース</p>
              <p className="text-lg font-bold text-gray-900">{selectedCourse?.name}</p>
              <p className="text-sm text-gray-500">
                {selectedCourse?.branch} / {selectedCourse?.periodLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">エクスポート</button>
              <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">コース設定</button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <StatCard title="コース全体の研修" value={`${selectedCourse?.trainings.length ?? 0}件`} subtitle={`全体: ${totalTrainings}件`} />
            <StatCard title="公開中" value={`${selectedPublished}件`} subtitle={`全体: ${publishedTrainings}件`} />
            <StatCard title="参加者" value={`${selectedParticipants}名`} subtitle={`全体: ${totalParticipants}名`} />
            <StatCard title="見込み収入" value={`¥${selectedRevenue.toLocaleString()}`} subtitle={`全体: ¥${totalRevenue.toLocaleString()}`} />
          </div>

          <div className="mt-6 rounded-xl border bg-gray-50/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="研修名で検索..."
                  className="w-full rounded-lg border border-gray-300 px-10 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <select
                className="rounded-lg border px-4 py-2 text-gray-900"
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
              <select className="rounded-lg border px-4 py-2 text-gray-900">
                <option>全てのステータス</option>
                <option>公開中</option>
                <option>下書き</option>
                <option>終了</option>
              </select>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-white">
                <Filter className="h-4 w-4" />
                フィルター
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">研修名</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">分類</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">日時</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">場所</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">参加状況</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">価格</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">ステータス</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainings.map((training) => {
                  const category = trainingCategories.find((c) => c.id === training.categoryId);
                  return (
                    <tr key={training.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{training.title}</p>
                        <p className="text-sm text-gray-500">
                          {training.requiredMembership === "premium" ? "プレミアム会員限定" : "全会員"}
                        </p>
                        {training.videos.length > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            動画 {training.videos.length}件
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${category?.colorClass ?? "bg-gray-100 text-gray-700"}`}>
                          {category?.name ?? "-"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {training.date}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {training.location}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          {training.enrolled}/{training.capacity}名
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(training.enrolled / training.capacity) * 100}%` }} />
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {training.price === 0 ? "無料" : `¥${training.price.toLocaleString()}`}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          training.status === "公開中" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {training.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/trainings/${training.id}`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900" title="詳細・チェックイン">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900" title="編集">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-red-600 hover:bg-gray-100 hover:text-red-700" title="削除">
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
                  <p className="text-sm font-semibold text-gray-900">動画コンテンツ</p>
                  <p className="text-xs text-gray-500">選択中のコースに紐づく研修動画です。</p>
                </div>
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">動画を追加</button>
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
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
