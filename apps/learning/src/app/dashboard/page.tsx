'use client';

import { Header } from "@/components/header";
import Link from "next/link";
import { Award, Calendar, CreditCard, User } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState({
    name: "山田太郎",
    email: "yamada@example.com",
    membershipType: "premium",
    membershipExpiry: "2026年1月15日",
    qualifications: ["初級指導者資格"],
    enrolledCourses: 3,
    completedCourses: 1,
    upcomingActivities: 2,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">マイページ</h1>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
              <p className="text-white opacity-90 mb-4">{user.email}</p>
              <div className="flex items-center gap-4">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium text-white">
                  {user.membershipType === "premium" ? "プレミアム会員" : "無料会員"}
                </span>
                <span className="text-sm text-white opacity-90">
                  有効期限: {user.membershipExpiry}
                </span>
              </div>
            </div>
            <Link
              href="/membership"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100"
            >
              会員プラン変更
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Award className="h-8 w-8" />}
            title="取得資格"
            value={user.qualifications.length}
            link="/dashboard/qualifications"
          />
          <StatCard
            icon={<Calendar className="h-8 w-8" />}
            title="参加予定の体験・研修"
            value={user.upcomingActivities}
            link="/dashboard/activities"
          />
          <StatCard
            icon={<CreditCard className="h-8 w-8" />}
            title="支払い履歴"
            value="確認"
            link="/dashboard/payments"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Qualifications */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">取得資格</h3>
              <Link href="/qualifications" className="text-primary text-sm hover:underline">
                資格について →
              </Link>
            </div>
            <div className="space-y-4">
              {user.qualifications.map((qual, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Award className="h-10 w-10 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-bold">{qual}</h4>
                    <p className="text-sm text-muted-foreground">取得日: 2024年10月15日</p>
                  </div>
                  <button className="text-sm text-primary hover:underline">
                    証明書
                  </button>
                </div>
              ))}
              <Link
                href="/qualifications"
                className="block text-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">次の資格に挑戦</p>
              </Link>
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">参加予定の体験・研修</h3>
              <Link href="/activities" className="text-primary text-sm hover:underline">
                体験・研修を探す →
              </Link>
            </div>
            <div className="space-y-4">
              <ActivityItem
                id="2"
                title="幼児指導法ワークショップ"
                date="2025年11月25日 10:00"
                location="大阪支部"
              />
              <ActivityItem
                id="4"
                title="中級指導者認定研修"
                date="2025年12月10日 09:00"
                location="東京本部"
              />
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-xl font-bold mb-6">アカウント設定</h3>
            <div className="space-y-3">
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>プロフィール編集</span>
              </Link>
              <Link href="/dashboard/payments" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span>支払い方法</span>
              </Link>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, link }: { icon: React.ReactNode; title: string; value: number | string; link: string }) {
  return (
    <Link href={link} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function ActivityItem({ id, title, date, location }: { id: string; title: string; date: string; location: string }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-2">
        <Link href={`/activities/${id}`} className="text-primary hover:underline">
          {title}
        </Link>
      </h4>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {date}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </span>
      </div>
      <div className="mt-3">
        <Link href={`/activities/${id}`} className="text-xs text-primary hover:underline">
          詳細・動画を見る
        </Link>
      </div>
    </div>
  );
}
