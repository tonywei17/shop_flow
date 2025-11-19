"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { CheckCircle2, Clock, Download, Filter, Mail, Search, Send, UserCheck } from "lucide-react";

type RequestStatus = "pending" | "approved" | "rejected";

type InfoRequest = {
  id: string;
  applicantName: string;
  email: string;
  phone?: string;
  interest: "研修" | "見学" | "資格" | "その他";
  note?: string;
  submittedAt: string;
  status: RequestStatus;
  automation: boolean;
};

const requests: InfoRequest[] = [
  {
    id: "req-001",
    applicantName: "山田太郎",
    email: "yamada@example.com",
    phone: "090-1234-5678",
    interest: "研修",
    note: "指導者コースの資料を希望",
    submittedAt: "2025-11-12 10:25",
    status: "pending",
    automation: false,
  },
  {
    id: "req-002",
    applicantName: "佐藤花子",
    email: "sato@example.com",
    interest: "見学",
    submittedAt: "2025-11-13 15:40",
    status: "approved",
    automation: true,
  },
  {
    id: "req-003",
    applicantName: "鈴木一郎",
    email: "suzuki@example.com",
    phone: "080-0000-1111",
    interest: "資格",
    note: "更新試験の日程も知りたい",
    submittedAt: "2025-11-14 09:10",
    status: "pending",
    automation: false,
  },
  {
    id: "req-004",
    applicantName: "田中美咲",
    email: "tanaka@example.com",
    interest: "その他",
    note: "資料を自動送信に切り替え希望",
    submittedAt: "2025-11-15 12:30",
    status: "rejected",
    automation: true,
  },
];

export default function InformationRequestPage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [autoOnly, setAutoOnly] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const keywordMatch = keyword
        ? request.applicantName.includes(keyword) || request.email.includes(keyword)
        : true;
      const statusMatch = statusFilter === "all" || request.status === statusFilter;
      const automationMatch = !autoOnly || request.automation;
      return keywordMatch && statusMatch && automationMatch;
    });
  }, [keyword, statusFilter, autoOnly]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      automation: requests.filter((request) => request.automation).length,
      approved: requests.filter((request) => request.status === "approved").length,
    };
  }, []);

  return (
    <div className="p-8">
      <DashboardHeader title="資料請求管理" />

      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <StatCard title="総リクエスト" value={`${stats.total}件`} icon={<Mail className="h-4 w-4" />} />
        <StatCard title="審査待ち" value={`${stats.pending}件`} icon={<Clock className="h-4 w-4" />} accent="text-amber-600" />
        <StatCard title="自動送信設定" value={`${stats.automation}件`} icon={<Send className="h-4 w-4" />} accent="text-emerald-600" />
        <StatCard title="送付済" value={`${stats.approved}件`} icon={<UserCheck className="h-4 w-4" />} accent="text-blue-600" />
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              type="text"
              placeholder="申請者やメールで検索"
              className="w-full rounded-lg border border-gray-300 px-10 py-2 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <select
            className="rounded-lg border px-4 py-2 text-gray-900"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as RequestStatus | "all")}
          >
            <option value="all">全てのステータス</option>
            <option value="pending">審査待ち</option>
            <option value="approved">承認済</option>
            <option value="rejected">差し戻し</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoOnly}
              onChange={(event) => setAutoOnly(event.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            自動送信のみ
          </label>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            詳細フィルター
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text白 text-white hover:bg-blue-700">
            <Download className="h-4 w-4" />
            CSV Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">申請者</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">興味カテゴリ</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">備考</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">提出日時</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">ステータス</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">自動送付</th>
              <th className="p-4 text-left text-xs font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{request.applicantName}</div>
                  <div className="text-xs text-gray-500">{request.email}</div>
                  {request.phone && <div className="text-xs text-gray-400">{request.phone}</div>}
                </td>
                <td className="p-4 text-sm text-gray-900">{request.interest}</td>
                <td className="p-4 text-sm text-gray-700">{request.note ?? "-"}</td>
                <td className="p-4 text-sm text-gray-900">{request.submittedAt}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(request.status)}`}>
                    {statusLabel(request.status)}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      request.automation ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {request.automation ? "自動" : "手動"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">
                      承認
                    </button>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      差し戻し
                    </button>
                    <Link href="/applications" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      申込一覧
                    </Link>
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

function StatCard({ title, value, icon, accent }: { title: string; value: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">{title}</p>
        <span className="text-gray-400">{icon}
        </span>
      </div>
      <p className={`mt-2 text-2xl font-bold text-gray-900 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function statusClass(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "bg-blue-50 text-blue-700";
    case "rejected":
      return "bg-red-50 text-red-600";
    case "pending":
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function statusLabel(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "承認済";
    case "rejected":
      return "差し戻し";
    case "pending":
    default:
      return "審査待ち";
  }
}
