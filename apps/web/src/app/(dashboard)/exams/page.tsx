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
    <div className="p-8">
      <DashboardHeader
        title="試験管理"
        actions={
          <div className="flex gap-3">
            <Link
              href="/exam-levels"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              受験級を管理
            </Link>
            <Link
              href="/exams/new"
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              新規試験を作成
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="総試験数" value="12" />
        <StatCard title="募集受付中" value="4" />
        <StatCard title="今月の受験申込" value="86" />
        <StatCard title="今月の受験料合計" value="¥1,024,000" />
      </div>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="試験を検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="border rounded-lg px-4 py-2 text-gray-900">
            <option>全ての資格種別</option>
            <option>初級指導者資格</option>
            <option>中級指導者資格</option>
            <option>上級指導者資格</option>
          </select>
          <select className="border rounded-lg px-4 py-2 text-gray-900">
            <option>全てのステータス</option>
            <option>募集受付中</option>
            <option>締切済み</option>
            <option>下書き</option>
          </select>
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-gray-700">試験名</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">資格種別</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">実施日</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">会場 / 形式</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">申込状況</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">受験料</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">ステータス</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span>{exam.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">{exam.qualification}</td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {exam.date}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{exam.location}</span>
                    <span className="text-xs text-gray-500">({exam.mode})</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    {exam.applied}/{exam.capacity}名
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(exam.applied / exam.capacity) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-gray-900">
                  {exam.fee === 0 ? "無料" : `¥${exam.fee.toLocaleString()}`}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === "募集受付中"
                        ? "bg-green-100 text-green-700"
                        : exam.status === "締切済み"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/exams/${exam.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="詳細"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/exams/${exam.id}/edit`}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-600 hover:text-red-700"
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
    <div className="bg-white rounded-lg border p-6">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
