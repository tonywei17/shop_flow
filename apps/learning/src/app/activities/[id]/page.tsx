'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

type ActivityType = '体験' | '見学' | '研修';

type ActivityVideo = {
  id: string;
  title: string;
  duration: string;
  level?: string;
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
            { id: 'v1', title: '当日の流れと持ち物', duration: '05:30' },
            { id: 'v2', title: 'リトミックの基本理念', duration: '08:10' },
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
            { id: 'v1', title: '幼児の発達段階とリトミック', duration: '18:20', level: '基礎理論' },
            { id: 'v2', title: '年齢別の指導アプローチ', duration: '22:45', level: '実践理論' },
          ],
        },
        {
          id: 'g2',
          title: '実技デモ',
          description: '実際のレッスン風景を収録した動画です。',
          videos: [
            { id: 'v3', title: '3歳児クラスの導入例', duration: '12:10', level: '実技' },
            { id: 'v4', title: 'グループ活動の進め方', duration: '15:30', level: '実技' },
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
            { id: 'v1', title: '見学のポイントと注意事項', duration: '07:40' },
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
            { id: 'v1', title: 'ケーススタディの読み方', duration: '10:05', level: '事前学習' },
            { id: 'v2', title: '観察シートの使い方', duration: '09:30', level: '事前学習' },
          ],
        },
        {
          id: 'g2',
          title: 'フォローアップ動画',
          description: '研修後の振り返りに役立つ動画です。',
          videos: [
            { id: 'v3', title: 'ロールプレイの振り返り', duration: '16:20', level: 'フォローアップ' },
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

  const isPremium = activity.requiredMembership === 'premium';
  const isFull = activity.enrolled >= activity.capacity;
  const availableSeats = activity.capacity - activity.enrolled;

  const handleApply = async () => {
    if (isFull || hasApplied) return;
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsApplying(false);
    setHasApplied(true);
    alert('お申し込みありがとうございます。\n\nこの体験・研修の専用動画が視聴可能になりました。');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold bg-white/20 ${
                    activity.type === '体験'
                      ? 'text-emerald-100'
                      : activity.type === '見学'
                      ? 'text-sky-100'
                      : 'text-violet-100'
                  }`}
                >
                  {activity.type}
                </span>
                {isPremium && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-yellow-400 text-gray-900">
                    プレミアム会員限定
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{activity.title}</h1>
              <p className="text-sm sm:text-base md:text-lg opacity-90 mb-4 sm:mb-6 max-w-2xl">
                {activity.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <Calendar className="h-4 w-4" />
                    <span>開催日時</span>
                  </div>
                  <div className="font-semibold">{activity.date}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <MapPin className="h-4 w-4" />
                    <span>会場</span>
                  </div>
                  <div className="font-semibold">{activity.location}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <Users className="h-4 w-4" />
                    <span>定員</span>
                  </div>
                  <div className="font-semibold">
                    {activity.enrolled}/{activity.capacity}名
                    <span className="block text-xs mt-1">残り {availableSeats}席</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <DollarSign className="h-4 w-4" />
                    <span>参加費</span>
                  </div>
                  <div className="font-semibold text-2xl">
                    {activity.price === 0 ? '無料' : `¥${activity.price.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Application card in hero */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 text-gray-900">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-1">
                  {activity.price === 0 ? '無料' : `¥${activity.price.toLocaleString()}`}
                </div>
                {activity.price > 0 && (
                  <div className="text-xs text-gray-500">参加費（税込）</div>
                )}
              </div>

              <button
                onClick={handleApply}
                disabled={isFull || hasApplied || isApplying}
                className={`w-full py-3 rounded-lg font-semibold text-sm mb-3 transition-colors ${
                  isFull || hasApplied || isApplying
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFull
                  ? '満席のため受付終了'
                  : hasApplied
                  ? '申し込み済み'
                  : isApplying
                  ? '申し込み処理中...'
                  : `${activity.type}に申し込む`}
              </button>

              <p className="text-xs text-gray-600 text-center mb-3">
                申込後に、この活動専用の学習動画が視聴できるようになります。
              </p>

              {activity.requiredQualification && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5" />
                  <span>必要資格: {activity.requiredQualification}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: details & videos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outline */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">活動概要</h2>
              <p className="text-sm text-gray-700 mb-4">{activity.description}</p>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">対象</dt>
                  <dd className="text-gray-900">
                    {activity.type === '体験'
                      ? 'リトミックに興味のある方（初めての方歓迎）'
                      : activity.type === '見学'
                      ? '実際のクラスを見学したい方'
                      : '既に初級資格をお持ちの指導者の方'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">参加条件</dt>
                  <dd className="text-gray-900">
                    {isPremium ? 'プレミアム会員の方' : '無料会員を含む全会員'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Video section */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                  学習動画
                </h2>
                {!hasApplied && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Lock className="h-3.5 w-3.5" /> 申込後に視聴可能
                  </span>
                )}
              </div>

              {!hasApplied ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <p className="text-sm text-gray-700 mb-3">
                    この活動の申込が完了すると、事前学習やフォローアップ用の動画がここに表示されます。
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>・ 体験会の場合：当日の流れや持ち物、リトミックの基本を解説した動画</li>
                    <li>・ 研修の場合：事前学習コンテンツや研修後の振り返り動画</li>
                    <li>・ 見学会の場合：見学のポイントをまとめたガイド動画</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.videos.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {group.title}
                          </h3>
                          {group.description && (
                            <p className="text-xs text-gray-600">{group.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {group.videos.map((video, index) => (
                          <div
                            key={video.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {video.title}
                                  {video.level && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700">
                                      {video.level}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <PlayCircle className="h-3.5 w-3.5" />
                                  <span>{video.duration}</span>
                                </div>
                              </div>
                            </div>
                            <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                              <PlayCircle className="h-3.5 w-3.5" /> 再生
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: links back to list, etc. */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-2">他の体験・研修</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/activities" className="text-blue-600 hover:underline">
                    一覧に戻る
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
