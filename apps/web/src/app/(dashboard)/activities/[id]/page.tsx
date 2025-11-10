'use client';

import { DashboardHeader } from "@/components/dashboard/header";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  UserCheck,
  UserX
} from "lucide-react";

// Mock data - 活动详情
const activityDetails = {
  "1": {
    id: "1",
    title: "リトミック体験会（無料）",
    type: "体験",
    date: "2025-11-20 14:00",
    location: "東京本部",
    capacity: 20,
    enrolled: 15,
    price: 0,
    status: "公開中",
    description: "リトミックの基本を体験できる無料イベントです。初心者の方も大歓迎！",
    duration: "2時間",
    instructor: "田中先生",
    participants: [
      { id: "1", name: "山田太郎", email: "yamada@example.com", memberType: "premium", checkedIn: true, checkInTime: "2025-11-20 13:55" },
      { id: "2", name: "佐藤花子", email: "sato@example.com", memberType: "free", checkedIn: true, checkInTime: "2025-11-20 14:02" },
      { id: "3", name: "鈴木一郎", email: "suzuki@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
      { id: "4", name: "田中美咲", email: "tanaka@example.com", memberType: "free", checkedIn: true, checkInTime: "2025-11-20 14:05" },
      { id: "5", name: "高橋健太", email: "takahashi@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
    ]
  },
  "2": {
    id: "2",
    title: "幼児指導法ワークショップ",
    type: "研修",
    date: "2025-11-25 10:00",
    location: "大阪支部",
    capacity: 30,
    enrolled: 22,
    price: 8000,
    status: "公開中",
    description: "幼児を対象としたリトミック指導法を学ぶワークショップです。",
    duration: "4時間",
    instructor: "佐藤先生",
    participants: [
      { id: "6", name: "伊藤真理", email: "ito@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
      { id: "7", name: "渡辺直樹", email: "watanabe@example.com", memberType: "premium", checkedIn: false, checkInTime: null },
    ]
  }
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;
  const activity = activityDetails[activityId as keyof typeof activityDetails];

  const [participants, setParticipants] = useState(activity?.participants || []);

  if (!activity) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">活動が見つかりません</h2>
          <button
            onClick={() => router.push('/activities')}
            className="text-blue-600 hover:text-blue-700"
          >
            活動一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const checkedInCount = participants.filter(p => p.checkedIn).length;
  const checkInRate = participants.length > 0 ? (checkedInCount / participants.length * 100).toFixed(1) : 0;

  const handleCheckIn = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, checkedIn: true, checkInTime: new Date().toLocaleString('ja-JP') }
        : p
    ));
  };

  const handleCheckOut = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, checkedIn: false, checkInTime: null }
        : p
    ));
  };

  return (
    <div className="p-8">
      <DashboardHeader 
        title={activity.title}
        actions={
          <button
            onClick={() => router.push('/activities')}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>
        }
      />

      {/* Activity Info */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              activity.type === "体験" ? "bg-green-100 text-green-700" :
              activity.type === "見学" ? "bg-blue-100 text-blue-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {activity.type}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              activity.status === "公開中" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}>
              {activity.status}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{activity.description}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">日時</div>
                <div className="font-medium">{activity.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">所要時間</div>
                <div className="font-medium">{activity.duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">場所</div>
                <div className="font-medium">{activity.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">定員</div>
                <div className="font-medium">{activity.enrolled}/{activity.capacity}名</div>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in Stats */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">出席状況</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">出席率</span>
                <span className="text-2xl font-bold text-gray-900">{checkInRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{checkedInCount}</span>
                </div>
                <div className="text-sm text-gray-600">出席</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UserX className="h-5 w-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{participants.length - checkedInCount}</span>
                </div>
                <div className="text-sm text-gray-600">未出席</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List with Check-in */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">参加者リスト</h3>
          <p className="text-sm text-gray-600 mt-1">参加者の出席状況を管理できます</p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-gray-700">会員名</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">メールアドレス</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">会員タイプ</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">出席状況</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">チェックイン時刻</th>
              <th className="text-left p-4 font-medium text-sm text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{participant.name}</div>
                </td>
                <td className="p-4 text-sm text-gray-900">{participant.email}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    participant.memberType === "premium"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {participant.memberType === "premium" ? "プレミアム" : "無料"}
                  </span>
                </td>
                <td className="p-4">
                  {participant.checkedIn ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">出席</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">未出席</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-900">
                  {participant.checkInTime || "-"}
                </td>
                <td className="p-4">
                  {participant.checkedIn ? (
                    <button
                      onClick={() => handleCheckOut(participant.id)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      <XCircle className="h-4 w-4" />
                      取消
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(participant.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      チェックイン
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
