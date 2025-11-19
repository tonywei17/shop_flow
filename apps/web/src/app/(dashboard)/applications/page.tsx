"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Search, Filter, Download, Calendar, MapPin, Award, Users } from "lucide-react";

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

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesKeyword = keyword
        ? application.title.includes(keyword) || application.applicantName.includes(keyword)
        : true;
      const matchesType = selectedType === "all" || application.eventType === selectedType;
      const matchesStatus = selectedStatus === "all" || application.status === selectedStatus;
      return matchesKeyword && matchesType && matchesStatus;
    });
  }, [keyword, selectedType, selectedStatus]);

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
    <div className="p-8">
      <DashboardHeader title="申込一覧" />
      <p className="mt-2 text-sm text-gray-500">研修・見学/体験・試験の申込を一元管理できます</p>

      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <StatCard title="総申込" value={`${stats.total}件`} accent="bg-emerald-50 text-emerald-700" />
        <StatCard title="研修" value={`${stats.trainings}件`} accent="bg-blue-50 text-blue-700" />
        <StatCard title="見学/体験" value={`${stats.experiences}件`} accent="bg-amber-50 text-amber-700" />
        <StatCard title="試験" value={`${stats.exams}件`} accent="bg-purple-50 text-purple-700" subtitle={`見込み売上 ¥${stats.revenue.toLocaleString()}`} />
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              type="text"
              placeholder="申込対象や申込者で検索..."
              className="w-full rounded-lg border border-gray-300 px-10 py-2 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <select
            className="rounded-lg border px-4 py-2 text-gray-900"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            {applicationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border px-4 py-2 text-gray-900"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            詳細フィルター
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">申込対象</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">カテゴリ/種類</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">開催日時</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">申込者</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">支払ステータス</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">申込ステータス</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => (
              <tr key={application.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{application.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    {iconByType(application.eventType)}
                    {application.eventType}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">{application.category}</td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {application.schedule}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {application.location}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="font-medium">{application.applicantName}</div>
                  <p className="text-xs text-gray-500">{application.applicantEmail}</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      application.membershipType === "premium"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {application.membershipType === "premium" ? "プレミアム会員" : "仮会員"}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold text-gray-900">{application.paymentStatus}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(application.status)}`}>
                    {application.status}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${application.eventType === "試験" ? "exams" : application.eventType === "研修" ? "trainings" : "experiences"}/${application.id}`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      詳細
                    </Link>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      更新
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className={`mt-1 text-xs font-medium ${accent ?? "text-gray-500"}`}>{subtitle}</p>}
    </div>
  );
}

function statusBadgeClass(status: Application["status"]) {
  switch (status) {
    case "申込済":
      return "bg-emerald-50 text-emerald-700";
    case "承認待ち":
      return "bg-blue-50 text-blue-700";
    case "支払待ち":
      return "bg-amber-50 text-amber-700";
    case "キャンセル":
    default:
      return "bg-red-50 text-red-600";
  }
}

function iconByType(type: Application["eventType"]) {
  switch (type) {
    case "試験":
      return <Award className="h-3.5 w-3.5 text-purple-600" />;
    case "研修":
      return <Users className="h-3.5 w-3.5 text-emerald-600" />;
    case "体験":
      return <Users className="h-3.5 w-3.5 text-amber-600" />;
    case "見学":
    default:
      return <Users className="h-3.5 w-3.5 text-blue-600" />;
  }
}
