'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Calendar, MapPin, Users, DollarSign, Award } from 'lucide-react';
import { getExams, type Exam } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { ErrorMessage } from '@/components/error/error-message';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const data = await getExams();
        // C端では公開中の試験のみ表示
        setExams(data.filter((exam) => exam.isActive));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner text="試験情報を読み込み中です..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">資格試験一覧</h1>
          <p className="text-muted-foreground">
            指導者資格試験の中から受験したい試験を選択してください
          </p>
        </div>

        {/* Filters （UIのみ / 今はロジックなし） */}
        <div className="bg-white p-6 rounded-lg border mb-8">
          <div className="flex flex-wrap gap-4">
            <select className="border rounded-md px-4 py-2 text-sm">
              <option>全ての資格種別</option>
              <option>初級指導者資格</option>
              <option>中級指導者資格</option>
              <option>上級指導者資格</option>
            </select>
            <select className="border rounded-md px-4 py-2 text-sm">
              <option>全ての実施形式</option>
              <option>対面</option>
              <option>オンライン</option>
            </select>
            <select className="border rounded-md px-4 py-2 text-sm">
              <option>全ての価格</option>
              <option>無料</option>
              <option>有料</option>
            </select>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
          {exams.length === 0 && (
            <div className="bg-white rounded-lg border p-8 text-center text-sm text-muted-foreground">
              現在、公開中の試験はありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const isOnline = exam.locationType === 'オンライン';
  const isPremiumOnly = exam.targetMembership === 'premium';
  const isOpen = exam.status === '募集受付中';
  const isFull = exam.applied >= exam.capacity;
  const remaining = Math.max(exam.capacity - exam.applied, 0);

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
              <Award className="h-3.5 w-3.5" />
              {exam.qualification}
            </span>
            {isPremiumOnly && (
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                プレミアム会員のみ
              </span>
            )}
            {isOnline && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                オンライン
              </span>
            )}
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                exam.status === '募集受付中'
                  ? 'bg-green-100 text-green-700'
                  : exam.status === '締切済み'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {exam.status}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-2">{exam.name}</h2>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{exam.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {exam.examDate}
                {exam.examTime && ` ${exam.examTime}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {exam.location}
                <span className="text-xs text-gray-500 ml-1">({exam.locationType})</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {exam.applied}/{exam.capacity}名
                <span className="text-xs text-gray-500 ml-1">(残り {remaining}席)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between md:w-56">
          <div className="text-right mb-4">
            <div className="text-3xl font-bold mb-1">
              {exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}
            </div>
            <div className="text-xs text-muted-foreground">
              申込期間: {exam.applicationStart} 〜 {exam.applicationEnd}
            </div>
          </div>

          <Link
            href={`/exams/${exam.id}`}
            className={`block text-center px-6 py-3 rounded-lg font-medium text-sm ${
              !isOpen || isFull
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {!isOpen
              ? '募集は終了しました'
              : isFull
              ? '満席'
              : '詳細・申し込み'}
          </Link>
        </div>
      </div>
    </div>
  );
}
