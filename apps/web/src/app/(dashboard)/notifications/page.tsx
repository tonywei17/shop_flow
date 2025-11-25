"use client";

import React, { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Users, CheckCircle, Clock, Send } from "lucide-react";

type NotificationCategory = {
  id: string;
  name: string;
  colorClass?: string;
};

// Mock data
const notificationCategories: NotificationCategory[] = [
  { id: "general", name: "お知らせ", colorClass: "bg-blue-100 text-blue-700" },
  { id: "exam", name: "資格試験", colorClass: "bg-purple-100 text-purple-700" },
  { id: "system", name: "システム", colorClass: "bg-amber-100 text-amber-700" },
  { id: "campaign", name: "キャンペーン", colorClass: "bg-emerald-100 text-emerald-700" },
];

const notifications = [
  {
    id: "1",
    title: "新コース公開のお知らせ",
    message: "リトミック上級指導者養成コースが公開されました。",
    targetType: "all",
    targetLabel: "全会員",
    categoryId: "general",
    sentAt: "2025-11-10 14:30",
    sentBy: "東京花子",
    readCount: 856,
    totalRecipients: 1234,
    status: "sent",
  },
  {
    id: "2",
    title: "中級資格試験のご案内",
    message: "12月の中級資格試験の申し込みを開始しました。",
    targetType: "qualification",
    targetLabel: "初級指導者資格保持者",
    categoryId: "exam",
    sentAt: "2025-11-09 10:00",
    sentBy: "東京花子",
    readCount: 142,
    totalRecipients: 156,
    status: "sent",
  },
  {
    id: "3",
    title: "システムメンテナンスのお知らせ",
    message: "11月15日 2:00-4:00にシステムメンテナンスを実施します。",
    targetType: "membership",
    targetLabel: "プレミアム会員",
    categoryId: "system",
    sentAt: "2025-11-08 16:00",
    sentBy: "東京花子",
    readCount: 398,
    totalRecipients: 456,
    status: "sent",
  },
  {
    id: "4",
    title: "特別ワークショップのご案内",
    message: "年末特別ワークショップの参加者を募集しています。",
    targetType: "individual",
    targetLabel: "山田太郎",
    categoryId: "campaign",
    sentAt: null,
    sentBy: "東京花子",
    readCount: 0,
    totalRecipients: 1,
    status: "draft",
  },
];

export default function NotificationsManagementPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        selectedCategoryId === "all" ? true : notification.categoryId === selectedCategoryId,
      ),
    [selectedCategoryId],
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="通知管理"
        actions={
          <div className="flex gap-3">
            <Link
              href="/notifications/categories"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              分類を管理
            </Link>
            <Link
              href="/notifications/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              新規通知を作成
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="総送信数" value="248" icon={<Send className="h-5 w-5" />} />
        <StatCard title="今月の送信" value="12" icon={<Clock className="h-5 w-5" />} />
        <StatCard title="平均開封率" value="68.4%" icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="総受信者数" value="1,846" icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="通知を検索..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>全ての送信先</option>
            <option>全会員</option>
            <option>プレミアム会員</option>
            <option>無料会員</option>
            <option>資格保持者</option>
            <option>個別送信</option>
          </select>
          <select
            className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="all">全ての分類</option>
            {notificationCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>全てのステータス</option>
            <option>送信済み</option>
            <option>下書き</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">タイトル</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">送信先</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">分類</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">送信日時</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">送信者</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">開封状況</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">ステータス</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => {
              const category = notificationCategories.find((c) => c.id === notification.categoryId);
              return (
                <tr key={notification.id} className="border-b border-border hover:bg-muted/60">
                  <td className="p-4">
                    <div className="font-medium text-foreground">{notification.title}</div>
                    <div className="line-clamp-1 text-sm text-muted-foreground">
                      {notification.message}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          notification.targetType === "all"
                            ? "bg-primary/10 text-primary"
                            : notification.targetType === "qualification"
                              ? "bg-secondary/10 text-secondary-foreground"
                              : notification.targetType === "membership"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {notification.targetLabel}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {notification.totalRecipients}名
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        category?.colorClass ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {category?.name ?? "未分類"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {notification.sentAt || "-"}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {notification.sentBy}
                  </td>
                  <td className="p-4">
                    {notification.status === "sent" ? (
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {notification.readCount}/{notification.totalRecipients}
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-primary"
                            style={{ width: `${(notification.readCount / notification.totalRecipients) * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Math.round((notification.readCount / notification.totalRecipients) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        notification.status === "sent" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {notification.status === "sent" ? "送信済み" : "下書き"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="詳細"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {notification.status === "draft" && (
                        <button
                          className="rounded-lg p-2 text-primary hover:bg-primary/10 hover:text-primary"
                          title="送信"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}
