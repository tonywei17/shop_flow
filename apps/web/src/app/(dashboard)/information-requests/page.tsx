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
    <div className="space-y-6">
      <DashboardHeader title="資料請求管理" />

      <div className="mb-4 grid gap-6 md:grid-cols-4">
        <StatCard title="総リクエスト" value={`${stats.total}件`} icon={<Mail className="h-4 w-4" />} />
        <StatCard title="審査待ち" value={`${stats.pending}件`} icon={<Clock className="h-4 w-4" />} accent="text-primary" />
        <StatCard title="自動送信設定" value={`${stats.automation}件`} icon={<Send className="h-4 w-4" />} accent="text-primary" />
        <StatCard title="送付済" value={`${stats.approved}件`} icon={<UserCheck className="h-4 w-4" />} accent="text-primary" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              type="text"
              placeholder="申請者やメールで検索"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <select
            className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as RequestStatus | "all")}
          >
            <option value="all">全てのステータス</option>
            <option value="pending">審査待ち</option>
            <option value="approved">承認済</option>
            <option value="rejected">差し戻し</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={autoOnly}
              onChange={(event) => setAutoOnly(event.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            自動送信のみ
          </label>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
            <Filter className="h-4 w-4" />
            詳細フィルター
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            CSV Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">申請者</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">興味カテゴリ</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">備考</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">提出日時</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">ステータス</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">自動送付</th>
              <th className="p-4 text-left text-xs font-semibold text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="border-b border-border last:border-b-0 hover:bg-muted/60">
                <td className="p-4">
                  <div className="font-semibold text-foreground">{request.applicantName}</div>
                  <div className="text-xs text-muted-foreground">{request.email}</div>
                  {request.phone && <div className="text-xs text-muted-foreground">{request.phone}</div>}
                </td>
                <td className="p-4 text-sm text-foreground">{request.interest}</td>
                <td className="p-4 text-sm text-muted-foreground">{request.note ?? "-"}</td>
                <td className="p-4 text-sm text-foreground">{request.submittedAt}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(request.status)}`}>
                    {statusLabel(request.status)}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      request.automation ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {request.automation ? "自動" : "手動"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
                      承認
                    </button>
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                      差し戻し
                    </button>
                    <Link href="/applications" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted">
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold text-foreground ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function statusClass(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "bg-primary/10 text-primary";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    case "pending":
    default:
      return "bg-muted text-muted-foreground";
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
