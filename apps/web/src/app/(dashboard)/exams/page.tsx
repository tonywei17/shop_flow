import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users, Award } from "lucide-react";

const exams = [
  {
    id: "1",
    name: "初級指導者資格試験（2025年春期）",
    qualification: "初級指導者資格",
    date: "2025-03-15 10:00",
    location: "東京本部",
    mode: "対面",
    fee: 12000,
    capacity: 80,
    applied: 56,
    status: "募集受付中",
  },
  {
    id: "2",
    name: "中級指導者資格試験（2025年春期）",
    qualification: "中級指導者資格",
    date: "2025-03-22 13:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 18000,
    capacity: 60,
    applied: 48,
    status: "募集受付中",
  },
  {
    id: "3",
    name: "上級指導者資格試験（2024年冬期）",
    qualification: "上級指導者資格",
    date: "2024-12-08 09:30",
    location: "大阪支部",
    mode: "対面",
    fee: 24000,
    capacity: 40,
    applied: 40,
    status: "締切済み",
  },
  {
    id: "4",
    name: "初級指導者資格追試（オンライン）",
    qualification: "初級指導者資格",
    date: "2025-01-12 19:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 8000,
    capacity: 100,
    applied: 32,
    status: "下書き",
  },
];

export default function ExamsManagementPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="試験管理"
        actions={
          <div className="flex gap-3">
            <Link
              href="/exam-levels"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              受験級を管理
            </Link>
            <Link
              href="/exams/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              新規試験を作成
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="総試験数" value="12" />
        <StatCard title="募集受付中" value="4" />
        <StatCard title="今月の受験申込" value="86" />
        <StatCard title="今月の受験料合計" value="¥1,024,000" />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="試験を検索..."
              className="flex h-9 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>全ての資格種別</option>
            <option>初級指導者資格</option>
            <option>中級指導者資格</option>
            <option>上級指導者資格</option>
          </select>
          <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <option>全てのステータス</option>
            <option>募集受付中</option>
            <option>締切済み</option>
            <option>下書き</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">試験名</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">資格種別</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">実施日</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">会場 / 形式</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">申込状況</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">受験料</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">ステータス</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} className="border-b border-border hover:bg-muted/60">
                <td className="p-4">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{exam.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">{exam.qualification}</td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {exam.date}
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{exam.location}</span>
                    <span className="text-xs text-muted-foreground">({exam.mode})</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {exam.applied}/{exam.capacity}名
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(exam.applied / exam.capacity) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {exam.fee === 0 ? "無料" : `¥${exam.fee.toLocaleString()}`}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === "募集受付中"
                        ? "bg-primary/10 text-primary"
                        : exam.status === "締切済み"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary/10 text-secondary-foreground"
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/exams/${exam.id}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="詳細"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/exams/${exam.id}/edit`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 text-sm text-muted-foreground">{title}</div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}
