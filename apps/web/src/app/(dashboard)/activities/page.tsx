import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";

// Mock data
const activities = [
  {
    id: "1",
    title: "リトミック体験会（無料）",
    type: "体験",
    date: "2025-11-20 14:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
  },
  {
    id: "2",
    title: "幼児指導法ワークショップ",
    type: "研修",
    date: "2025-11-25 10:00",
    location: "大阪支部",
    capacity: 30,
    enrolled: 22,
    price: 8000,
    status: "公開中",
    requiredMembership: "premium",
  },
  {
    id: "3",
    title: "リトミック見学会",
    type: "見学",
    date: "2025-12-05 13:00",
    location: "オンライン",
    capacity: 50,
    enrolled: 35,
    price: 0,
    status: "公開中",
    requiredMembership: "free",
  },
  {
    id: "4",
    title: "中級指導者認定研修",
    type: "研修",
    date: "2025-12-10 09:00",
    location: "東京本部",
    capacity: 25,
    enrolled: 18,
    price: 15000,
    status: "下書き",
    requiredMembership: "premium",
  },
];

export default function ActivitiesManagementPage() {
  return (
    <div className="p-8">
      <DashboardHeader
        title="活動・研修管理"
        actions={
          <Link
            href="/activities/new"
            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新規活動を作成
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="総活動数" value="24" />
        <StatCard title="公開中" value="18" />
        <StatCard title="今月の参加者" value="156" />
        <StatCard title="今月の収入" value="¥892,000" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="活動を検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="border rounded-lg px-4 py-2 text-gray-900">
            <option>全ての種類</option>
            <option>体験</option>
            <option>見学</option>
            <option>研修</option>
          </select>
          <select className="border rounded-lg px-4 py-2 text-gray-900">
            <option>全てのステータス</option>
            <option>公開中</option>
            <option>下書き</option>
            <option>終了</option>
          </select>
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-gray-700">活動名</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">種類</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">日時</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">場所</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">参加状況</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">価格</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">ステータス</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-500">
                    {activity.requiredMembership === "premium" ? "プレミアム会員限定" : "全会員"}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    activity.type === "体験" ? "bg-green-100 text-green-700" :
                    activity.type === "見学" ? "bg-blue-100 text-blue-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {activity.type}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {activity.date}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {activity.location}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    {activity.enrolled}/{activity.capacity}名
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(activity.enrolled / activity.capacity) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="p-4 text-sm font-medium text-gray-900">
                  {activity.price === 0 ? "無料" : `¥${activity.price.toLocaleString()}`}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "公開中" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {activity.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/activities/${activity.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900"
                      title="詳細・チェックイン"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900" title="編集">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600 hover:text-red-700" title="削除">
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
