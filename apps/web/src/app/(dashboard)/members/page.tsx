import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Search, Filter, Download, Eye, Mail } from "lucide-react";

// Mock data
const members = [
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
    membershipType: "free",
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
    membershipType: "free",
    joinDate: "2025-10-01",
    lastActive: "2025-11-10",
    coursesEnrolled: 2,
    qualifications: 0,
    totalSpent: 8000,
  },
];

export default function MembersPage() {
  return (
    <div className="p-8">
      <DashboardHeader title="会員管理" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="総会員数" value="1,234" change="+12%" />
        <StatCard title="プレミアム会員" value="456" change="+8%" />
        <StatCard title="無料会員" value="778" change="+15%" />
        <StatCard title="今月の新規" value="89" change="+23%" />
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="会員を検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="border rounded-lg px-4 py-2 text-gray-900">
              <option>全ての会員タイプ</option>
              <option>プレミアム会員</option>
              <option>無料会員</option>
            </select>
            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              フィルター
            </button>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-gray-700">会員名</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">メールアドレス</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">会員タイプ</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">登録日</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">受講コース</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">取得資格</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">総支払額</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">最終アクティブ: {member.lastActive}</div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">{member.email}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    member.membershipType === "premium"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {member.membershipType === "premium" ? "プレミアム" : "無料"}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-900">{member.joinDate}</td>
                <td className="p-4 text-sm text-center text-gray-900">{member.coursesEnrolled}</td>
                <td className="p-4 text-sm text-center text-gray-900">{member.qualifications}</td>
                <td className="p-4 text-sm font-medium text-gray-900">¥{member.totalSpent.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/members/${member.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="詳細"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900" title="メール送信">
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
        <div className="text-sm text-gray-600">
          1-{members.length} / 1,234件を表示
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
            前へ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">次へ</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {change}
        </div>
      </div>
    </div>
  );
}
