'use client';

import { Header } from "@/components/header";
import Link from "next/link";
import { Award, Calendar, CreditCard, User, LogOut, CheckCircle, ChevronRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const [user] = useState({
    name: "山田太郎",
    email: "yamada@example.com",
    membershipType: "premium",
    membershipExpiry: "2026年1月15日",
    qualifications: ["初級指導者資格"],
    enrolledCourses: 3,
    completedCourses: 1,
    upcomingActivities: 2,
    progress: 33,
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <Header isLoggedIn />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">マイページ</h1>
            <p className="text-muted-foreground mt-1">学習の進捗や活動予定を確認しましょう</p>
          </div>
          <Button asChild>
            <Link href="/courses">新しいコースを探す</Link>
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 border-none bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/20">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">YT</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-primary-foreground/80">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                      {user.membershipType === "premium" ? "プレミアム会員" : "無料会員"}
                    </Badge>
                    <span className="text-xs text-primary-foreground/80">
                      有効期限: {user.membershipExpiry}
                    </span>
                  </div>
                </div>
              </div>
              <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Link href="/membership">
                  会員プラン変更
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Award className="h-5 w-5" />}
            title="取得資格"
            value={`${user.qualifications.length}つ`}
            link="/dashboard/qualifications"
            description="次の資格まであと2ステップ"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            title="参加予定の活動"
            value={`${user.upcomingActivities}件`}
            link="/dashboard/activities"
            description="直近: 11/25 大阪支部"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            title="学習進捗"
            value={`${user.progress}%`}
            link="/dashboard/courses"
            description="現在のコース: 初級指導法"
            showProgress
            progressValue={user.progress}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Qualifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                取得資格
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/qualifications" className="text-primary text-xs">
                  資格について <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {user.qualifications.map((qual, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{qual}</h4>
                      <p className="text-xs text-muted-foreground">取得日: 2024年10月15日</p>
                    </div>
                    <Button variant="outline" size="sm">
                      証明書
                    </Button>
                  </div>
                ))}
                <Link
                  href="/qualifications"
                  className="group block text-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">次の資格に挑戦する</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                参加予定の体験・研修
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activities" className="text-primary text-xs">
                  探す <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <ActivityItem
                  id="2"
                  title="幼児指導法ワークショップ"
                  date="2025年11月25日 10:00"
                  location="大阪支部"
                  type="研修"
                />
                <ActivityItem
                  id="4"
                  title="中級指導者認定研修"
                  date="2025年12月10日 09:00"
                  location="東京本部"
                  type="研修"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold">アカウント設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/dashboard/profile">
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">プロフィール編集</span>
                  </div>
                </Link>
                <Link href="/dashboard/payments">
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">支払い方法</span>
                  </div>
                </Link>
                <button className="flex items-center gap-3 p-4 border rounded-lg hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-colors text-left group">
                  <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-red-600" />
                  <span className="font-medium">ログアウト</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  link, 
  description,
  showProgress = false,
  progressValue = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  link: string;
  description?: string;
  showProgress?: boolean;
  progressValue?: number;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={link}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-muted-foreground bg-muted p-2 rounded-full">{icon}</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold">{value}</span>
            {showProgress ? (
              <div className="w-full mt-2">
                <Progress value={progressValue} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{progressValue}% 完了</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function ActivityItem({ id, title, date, location, type }: { id: string; title: string; date: string; location: string; type: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {type}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {date}
          </span>
        </div>
        <Link href={`/activities/${id}`} className="block font-medium hover:text-primary transition-colors">
          {title}
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          {location}
        </div>
      </div>
      <Button size="sm" variant="secondary" asChild className="shrink-0">
        <Link href={`/activities/${id}`}>詳細</Link>
      </Button>
    </div>
  );
}

