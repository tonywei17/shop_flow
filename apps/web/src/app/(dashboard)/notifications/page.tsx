import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Users, CheckCircle, Clock, Send } from "lucide-react";

// Mock data
const notifications = [
  {
    id: "1",
    title: "新コース公開のお知らせ",
    message: "リトミック上級指導者養成コースが公開されました。",
    targetType: "all",
    targetLabel: "全会員",
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
    sentAt: null,
    sentBy: "東京花子",
    readCount: 0,
    totalRecipients: 1,
    status: "draft",
  },
];

export default function NotificationsManagementPage() {
  return (
    <div className="p-8">
      <DashboardHeader
        title="通知管理"
        actions={
          <Link
            href="/notifications/new"
            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            新規通知を作成
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="総送信数" value="248" icon={<Send className="h-5 w-5" />} />
        <StatCard title="今月の送信" value="12" icon={<Clock className="h-5 w-5" />} />
        <StatCard title="平均開封率" value="68.4%" icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="総受信者数" value="1,846" icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="通知を検索..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="border rounded-lg px-4 py-2">
            <option>全ての送信先</option>
            <option>全会員</option>
            <option>プレミアム会員</option>
            <option>無料会員</option>
            <option>資格保持者</option>
            <option>個別送信</option>
          </select>
          <select className="border rounded-lg px-4 py-2">
            <option>全てのステータス</option>
            <option>送信済み</option>
            <option>下書き</option>
          </select>
          <button className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            フィルター
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-sm">タイトル</th>
              <th className="text-left p-4 font-medium text-sm">送信先</th>
              <th className="text-left p-4 font-medium text-sm">送信日時</th>
              <th className="text-left p-4 font-medium text-sm">送信者</th>
              <th className="text-left p-4 font-medium text-sm">開封状況</th>
              <th className="text-left p-4 font-medium text-sm">ステータス</th>
              <th className="text-left p-4 font-medium text-sm">操作</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {notification.message}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      notification.targetType === "all" ? "bg-blue-100 text-blue-700" :
                      notification.targetType === "qualification" ? "bg-purple-100 text-purple-700" :
                      notification.targetType === "membership" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {notification.targetLabel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {notification.totalRecipients}名
                  </div>
                </td>
                <td className="p-4 text-sm">
                  {notification.sentAt || "-"}
                </td>
                <td className="p-4 text-sm">
                  {notification.sentBy}
                </td>
                <td className="p-4">
                  {notification.status === "sent" ? (
                    <div>
                      <div className="text-sm font-medium">
                        {notification.readCount}/{notification.totalRecipients}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-green-600 h-1.5 rounded-full"
                          style={{ width: `${(notification.readCount / notification.totalRecipients) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((notification.readCount / notification.totalRecipients) * 100)}%
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    notification.status === "sent" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {notification.status === "sent" ? "送信済み" : "下書き"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="詳細">
                      <Eye className="h-4 w-4" />
                    </button>
                    {notification.status === "draft" && (
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-600" title="送信">
                        <Send className="h-4 w-4" />
                      </button>
                    )}
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

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
