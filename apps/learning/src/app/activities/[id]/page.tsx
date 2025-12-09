'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign, PlayCircle, Lock, CheckCircle, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VimeoPlayer } from '@/components/vimeo-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActivityAICompanion } from '@/components/activity-ai-companion';

type ActivityType = '体験' | '見学' | '研修';

type ActivityVideo = {
  id: string;
  title: string;
  duration: string;
  level?: string;
  vimeoId?: string; // Real Vimeo Video ID
};

type ActivityVideoGroup = {
  id: string;
  title: string;
  description?: string;
  videos: ActivityVideo[];
};

type ActivityDetail = {
  id: string;
  title: string;
  type: ActivityType;
  description: string;
  date: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  requiredMembership: 'free' | 'premium';
  requiredQualification?: string;
  videos: ActivityVideoGroup[];
};

const getActivityData = (id: string): ActivityDetail => {
  const base: Record<string, ActivityDetail> = {
    '1': {
      id: '1',
      title: 'リトミック体験会（無料）',
      type: '体験',
      description:
        '初めての方向けの無料体験セッションです。実際のレッスンの雰囲気を体験しながら、リトミックの魅力を感じていただけます。',
      date: '2025年11月20日 14:00-16:00',
      location: '東京本部',
      capacity: 20,
      enrolled: 15,
      price: 0,
      requiredMembership: 'free',
      videos: [
        {
          id: 'g1',
          title: '体験会の事前ガイダンス',
          description: '体験会に参加する前に知っておきたいポイントをまとめた短い動画です。',
          videos: [
            { id: 'v1', title: '当日の流れと持ち物', duration: '05:30', vimeoId: '76979871' },
            { id: 'v2', title: 'リトミックの基本理念', duration: '08:10', vimeoId: '76979871' },
          ],
        },
      ],
    },
    '2': {
      id: '2',
      title: '幼児指導法ワークショップ',
      type: '研修',
      description:
        '3-5歳児への効果的な指導テクニックを学ぶ1日集中ワークショップです。講義と実技の両方で、明日から使える指導法を習得します。',
      date: '2025年11月25日 10:00-17:00',
      location: '大阪支部',
      capacity: 30,
      enrolled: 22,
      price: 8000,
      requiredMembership: 'premium',
      requiredQualification: '初級指導者資格',
      videos: [
        {
          id: 'g1',
          title: '講義パート',
          description: '理論編の動画をまとめたグループです。',
          videos: [
            { id: 'v1', title: '幼児の発達段階とリトミック', duration: '18:20', level: '基礎理論', vimeoId: '76979871' },
            { id: 'v2', title: '年齢別の指導アプローチ', duration: '22:45', level: '実践理論', vimeoId: '824804225' },
          ],
        },
        {
          id: 'g2',
          title: '実技デモ',
          description: '実際のレッスン風景を収録した動画です。',
          videos: [
            { id: 'v3', title: '3歳児クラスの導入例', duration: '12:10', level: '実技', vimeoId: '76979871' },
            { id: 'v4', title: 'グループ活動の進め方', duration: '15:30', level: '実技', vimeoId: '76979871' },
          ],
        },
      ],
    },
    '3': {
      id: '3',
      title: 'リトミック見学会',
      type: '見学',
      description:
        '実際のクラスをオンラインで見学できます。ご自宅から指導の様子を確認し、今後の学びに活かしてください。',
      date: '2025年12月5日 13:00-15:00',
      location: 'オンライン',
      capacity: 50,
      enrolled: 35,
      price: 0,
      requiredMembership: 'free',
      videos: [
        {
          id: 'g1',
          title: '見学用ガイド動画',
          videos: [
            { id: 'v1', title: '見学のポイントと注意事項', duration: '07:40', vimeoId: '76979871' },
          ],
        },
      ],
    },
    '4': {
      id: '4',
      title: '中級指導者認定研修',
      type: '研修',
      description:
        '中級資格取得のための必須研修です。ケーススタディとロールプレイを通じて、より高度な指導スキルを身につけます。',
      date: '2025年12月10日 09:00-18:00',
      location: '東京本部',
      capacity: 25,
      enrolled: 18,
      price: 15000,
      requiredMembership: 'premium',
      requiredQualification: '初級指導者資格',
      videos: [
        {
          id: 'g1',
          title: '事前学習コンテンツ',
          description: '研修当日までに視聴しておくと理解が深まる動画です。',
          videos: [
            { id: 'v1', title: 'ケーススタディの読み方', duration: '10:05', level: '事前学習', vimeoId: '76979871' },
            { id: 'v2', title: '観察シートの使い方', duration: '09:30', level: '事前学習', vimeoId: '76979871' },
          ],
        },
        {
          id: 'g2',
          title: 'フォローアップ動画',
          description: '研修後の振り返りに役立つ動画です。',
          videos: [
            { id: 'v3', title: 'ロールプレイの振り返り', duration: '16:20', level: 'フォローアップ', vimeoId: '76979871' },
          ],
        },
      ],
    },
  };

  return base[id] ?? base['1'];
};

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const activity = getActivityData(params.id);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActivityVideo | null>(null);

  const isPremium = activity.requiredMembership === 'premium';
  const isFull = activity.enrolled >= activity.capacity;
  const availableSeats = activity.capacity - activity.enrolled;

  const handleApply = async () => {
    if (isFull || hasApplied) return;
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsApplying(false);
    setHasApplied(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero */}
      <div className="bg-primary/5 pb-8 pt-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
                <Link href="/activities">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  一覧に戻る
                </Link>
              </Button>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-background">
                  {activity.type}
                </Badge>
                {isPremium && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">
                    プレミアム会員限定
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">{activity.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl leading-relaxed">
                {activity.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-background/50 border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">開催日時</p>
                      <p className="font-semibold text-sm">{activity.date}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">会場</p>
                      <p className="font-semibold text-sm">{activity.location}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">定員</p>
                      <p className="font-semibold text-sm">
                        {activity.enrolled}/{activity.capacity}名
                        <span className="text-xs text-muted-foreground ml-1">残り{availableSeats}席</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">参加費</p>
                      <p className="font-semibold text-sm">{activity.price === 0 ? '無料' : `¥${activity.price.toLocaleString()}`}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Application Card */}
            <Card className="w-full lg:max-w-sm shadow-lg border-primary/20">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold">
                  {activity.price === 0 ? '無料' : `¥${activity.price.toLocaleString()}`}
                </CardTitle>
                {activity.price > 0 && <CardDescription>参加費（税込）</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleApply}
                  disabled={isFull || hasApplied || isApplying}
                  className="w-full text-lg h-12"
                  size="lg"
                  variant={hasApplied ? "secondary" : "default"}
                >
                  {isFull
                    ? '満席のため受付終了'
                    : hasApplied
                    ? '申し込み済み'
                    : isApplying
                    ? '申し込み処理中...'
                    : `${activity.type}に申し込む`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  申込後に、この活動専用の学習動画が視聴できるようになります。
                </p>

                {activity.requiredQualification && (
                  <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-md border border-amber-200 flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>必要資格: {activity.requiredQualification}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Learning Video Section - Full Width */}
      <div className="w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 py-12 border-y border-slate-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-primary" />
              学習動画
            </h2>
            {!hasApplied && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-transparent shadow-sm">
                <Lock className="h-3 w-3" /> 申込後に視聴可能
              </Badge>
            )}
          </div>

          {!hasApplied ? (
            <div className="bg-white/60 dark:bg-zinc-900/50 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-12 text-center max-w-3xl mx-auto">
              <PlayCircle className="h-16 w-16 mx-auto text-slate-400 dark:text-zinc-700 mb-6" />
              <p className="font-bold text-lg mb-3">申し込みを完了すると動画が視聴できます</p>
              <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                事前学習動画や、当日の振り返りに役立つフォローアップ動画など、
                より深い学びに役立つコンテンツをご用意しています。
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Video Player & AI Companion */}
              {activeVideo ? (
                <div className="grid xl:grid-cols-4 gap-6">
                  <div className="xl:col-span-3 space-y-4">
                    <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video border border-slate-200 dark:border-zinc-800">
                      <VimeoPlayer videoId={activeVideo.vimeoId || '76979871'} autoplay className="h-full w-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <PlayCircle className="h-6 w-6 text-primary" />
                        {activeVideo.title}
                      </h3>
                      <Badge variant="outline" className="text-slate-500 dark:text-zinc-400 border-slate-300 dark:border-zinc-700">
                        {activeVideo.duration}
                      </Badge>
                    </div>
                  </div>
                  <div className="xl:col-span-1 h-full min-h-[500px]">
                    <ActivityAICompanion 
                      activityTitle={activity.title} 
                      videoTitle={activeVideo.title} 
                      className="h-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-zinc-900 rounded-xl p-12 text-center border border-slate-200 dark:border-zinc-800">
                  <p className="font-medium text-slate-500 dark:text-zinc-400">リストから動画を選択して再生してください</p>
                </div>
              )}

              {/* Video List */}
              <div className="bg-white/60 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  動画リスト
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {activity.videos.map((group) => (
                    <div key={group.id} className="space-y-3">
                      <h4 className="font-medium text-slate-500 dark:text-zinc-400 text-sm pl-2 border-l-2 border-primary">
                        {group.title}
                      </h4>
                      <div className="space-y-2">
                        {group.videos.map((video, index) => (
                          <button
                            key={video.id}
                            onClick={() => setActiveVideo(video)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left group shadow-sm ${
                              activeVideo?.id === video.id 
                                ? 'bg-primary/10 border border-primary/30 dark:bg-primary/20' 
                                : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-100 dark:border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                activeVideo?.id === video.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:bg-slate-200 dark:group-hover:bg-zinc-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${activeVideo?.id === video.id ? 'text-primary' : 'text-slate-700 dark:text-zinc-300'}`}>
                                  {video.title}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                                  {video.duration}
                                </div>
                              </div>
                            </div>
                            {activeVideo?.id === video.id && (
                              <PlayCircle className="h-4 w-4 text-primary animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">活動概要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">{activity.description}</p>
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">対象</p>
                    <p className="text-sm">
                      {activity.type === '体験'
                        ? 'リトミックに興味のある方（初めての方歓迎）'
                        : activity.type === '見学'
                        ? '実際のクラスを見学したい方'
                        : '既に初級資格をお持ちの指導者の方'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">参加条件</p>
                    <p className="text-sm">
                      {isPremium ? 'プレミアム会員の方' : '無料会員を含む全会員'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">他の体験・研修</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <Link href="/activities" className="text-sm hover:text-primary hover:underline block truncate">
                      ・ リトミック見学会（オンライン）
                    </Link>
                  </li>
                  <li>
                    <Link href="/activities" className="text-sm hover:text-primary hover:underline block truncate">
                      ・ 中級指導者認定研修
                    </Link>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t text-center">
                  <Button variant="link" size="sm" asChild>
                    <Link href="/activities">一覧に戻る</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
