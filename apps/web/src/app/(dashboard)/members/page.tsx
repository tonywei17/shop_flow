import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Search, Filter, Download, Eye, Mail } from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  membershipType: "premium" | "trial";
  joinDate: string;
  lastActive: string;
  coursesEnrolled: number;
  qualifications: number;
  totalSpent: number;
};

// Mock data
const members: Member[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    membershipType: "premium",
    joinDate: "2024-06-15",
    lastActive: "2025-11-09",
    coursesEnrolled: 5,
    qualifications: 2,
    totalSpent: 45800,
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@example.com",
    membershipType: "trial",
    joinDate: "2024-09-20",
    lastActive: "2025-11-10",
    coursesEnrolled: 1,
    qualifications: 0,
    totalSpent: 0,
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    membershipType: "premium",
    joinDate: "2024-03-10",
    lastActive: "2025-11-08",
    coursesEnrolled: 8,
    qualifications: 3,
    totalSpent: 89600,
  },
  {
    id: "4",
    name: "田中美咲",
    email: "tanaka@example.com",
    membershipType: "trial",
    joinDate: "2025-10-01",
    lastActive: "2025-11-10",
    coursesEnrolled: 2,
    qualifications: 0,
    totalSpent: 8000,
  },
];

export default function MembersPage() {
  const totalMembers = members.length;
  const premiumMembers = members.filter((member) => member.membershipType === "premium").length;
  const trialMembers = members.filter((member) => member.membershipType === "trial").length;

  return (
    <div className="space-y-6">
      <DashboardHeader title="会員管理" />

      {/* Stats Cards */}
      <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard title="総会員数" value={`${totalMembers.toLocaleString()}名`} change="+12%" />
        <StatCard title="プレミアム会員" value={`${premiumMembers}名`} change="+8%" />
        <StatCard title="仮会員" value={`${trialMembers}名`} change="+15%" />
        <StatCard title="今月の新規" value="89名" change="+23%" />
      </div>

      {/* Filters and Actions */}
      <div className="mb-4 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-1 gap-4 md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="会員を検索..."
                className="flex h-9 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <select className="h-9 rounded-lg border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <option>全ての会員タイプ</option>
              <option>プレミアム会員</option>
              <option>仮会員</option>
            </select>
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
              <Filter className="h-4 w-4" />
              フィルター
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">会員名</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">メールアドレス</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">会員タイプ</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">登録日</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">受講コース</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">取得資格</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">総支払額</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border text-sm hover:bg-muted/60">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-foreground">{member.name}</div>
                    <div className="text-sm text-muted-foreground">最終アクティブ: {member.lastActive}</div>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">{member.email}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      member.membershipType === "premium"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {member.membershipType === "premium" ? "プレミアム" : "仮会員"}
                  </span>
                </td>
                <td className="p-4 text-sm text-foreground">{member.joinDate}</td>
                <td className="p-4 text-center text-sm text-foreground">{member.coursesEnrolled}</td>
                <td className="p-4 text-center text-sm text-foreground">{member.qualifications}</td>
                <td className="p-4 text-sm font-medium text-foreground">¥{member.totalSpent.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/members/${member.id}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="詳細"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="メール送信">
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          1-{members.length} / 1,234件を表示
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50" disabled>
            前へ
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">1</button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">2</button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">3</button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">次へ</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 text-sm text-muted-foreground">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className={`text-sm font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
          {change}
        </div>
      </div>
    </div>
  );
}
