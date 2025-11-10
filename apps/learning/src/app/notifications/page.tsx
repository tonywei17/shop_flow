"use client";

import { Header } from "@/components/header";
import { useState } from "react";
import { Bell, Check, Trash2, CheckCircle, Clock } from "lucide-react";

// Mock data
const mockNotifications = [
  {
    id: "1",
    title: "新コース公開のお知らせ",
    message: "リトミック上級指導者養成コースが公開されました。ぜひご確認ください。",
    sentAt: "2025-11-10 14:30",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "中級資格試験のご案内",
    message: "12月の中級資格試験の申し込みを開始しました。締切は11月30日です。",
    sentAt: "2025-11-09 10:00",
    read: false,
    type: "important",
  },
  {
    id: "3",
    title: "システムメンテナンスのお知らせ",
    message: "11月15日 2:00-4:00にシステムメンテナンスを実施します。この間、サービスをご利用いただけません。",
    sentAt: "2025-11-08 16:00",
    read: true,
    type: "warning",
  },
  {
    id: "4",
    title: "コース完了おめでとうございます！",
    message: "「リトミック基礎コース」を完了しました。修了証明書をダウンロードできます。",
    sentAt: "2025-11-07 09:15",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "活動申し込み受付完了",
    message: "「幼児指導法ワークショップ」の申し込みを受け付けました。開催日の3日前にリマインドメールをお送りします。",
    sentAt: "2025-11-06 18:20",
    read: true,
    type: "info",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "important":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "success":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">通知センター</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : "すべて既読です"}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <CheckCircle className="h-5 w-5" />
                すべて既読にする
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              すべて ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              未読 ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {filter === "unread" ? "未読通知はありません" : "通知はありません"}
            </h3>
            <p className="text-gray-500">
              {filter === "unread" ? "すべての通知を既読にしました" : "新しい通知が届くとここに表示されます"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-6 transition-all ${
                  !notification.read ? "border-l-4 border-l-blue-600 shadow-sm" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    getTypeColor(notification.type)
                  }`}>
                    <Bell className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-bold text-lg ${
                        !notification.read ? "text-gray-900" : "text-gray-600"
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                            title="既読にする"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                          title="削除"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <p className={`mb-3 ${
                      !notification.read ? "text-gray-700" : "text-gray-500"
                    }`}>
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{notification.sentAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
