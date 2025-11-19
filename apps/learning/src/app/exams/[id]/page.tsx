'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Calendar, MapPin, Users, DollarSign, Award, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { getExamById, type Exam } from '@/lib/mock-data';
import { LoadingSpinner } from '@/components/loading/loading-spinner';
import { ErrorMessage } from '@/components/error/error-message';

export default function ExamDetailPage() {
  const params = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const id = params.id as string;
        const data = await getExamById(id);
        if (!data) {
          setError(new Error('試験が見つかりませんでした'));
        } else {
          setExam(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [params.id]);

  const handleApply = async () => {
    if (!exam) return;
    
    setApplying(true);
    // Mock application process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setApplying(false);
    setApplied(true);
    
    // Show success message
    alert(`「${exam.name}」への申し込みが完了しました！\n\n確認メールをお送りしましたのでご確認ください。`);
  };

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

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  const isOnline = exam.locationType === 'オンライン';
  const isPremiumOnly = exam.targetMembership === 'premium';
  const isOpen = exam.status === '募集受付中';
  const isFull = exam.applied >= exam.capacity;
  const remaining = Math.max(exam.capacity - exam.applied, 0);
  const canApply = isOpen && !isFull && !applied;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Award className="h-4 w-4" />
                {exam.qualification}
              </span>
              {isPremiumOnly && (
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                  プレミアム会員のみ
                </span>
              )}
              {isOnline && (
                <span className="bg-emerald-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                  オンライン
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  exam.status === '募集受付中'
                    ? 'bg-green-400 text-gray-900'
                    : exam.status === '締切済み'
                    ? 'bg-gray-400 text-gray-900'
                    : 'bg-yellow-400 text-gray-900'
                }`}
              >
                {exam.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{exam.name}</h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 mb-4 sm:mb-6">{exam.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-75">
                  <Calendar className="h-4 w-4" />
                  <span>試験日</span>
                </div>
                <div className="font-bold">
                  {exam.examDate}
                  {exam.examTime && (
                    <>
                      <br />
                      <span className="text-sm">{exam.examTime}〜</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-75">
                  <MapPin className="h-4 w-4" />
                  <span>会場</span>
                </div>
                <div className="font-bold text-sm">{exam.location}</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-75">
                  <Users className="h-4 w-4" />
                  <span>定員</span>
                </div>
                <div className="font-bold">
                  {exam.applied}/{exam.capacity}名
                  <br />
                  <span className="text-sm">残り {remaining}席</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1 text-sm opacity-75">
                  <DollarSign className="h-4 w-4" />
                  <span>受験料</span>
                </div>
                <div className="font-bold text-2xl">
                  {exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Period */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                申込期間
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">申込開始</div>
                  <div className="font-medium text-lg">{exam.applicationStart}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">申込締切</div>
                  <div className="font-medium text-lg text-red-600">{exam.applicationEnd}</div>
                </div>
              </div>
            </div>

            {/* Required Materials */}
            {exam.requiredMaterials && exam.requiredMaterials.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-4">必要な持ち物</h2>
                <ul className="space-y-2">
                  {exam.requiredMaterials.map((material, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exam Details */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">試験詳細</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">資格種別</dt>
                  <dd className="text-gray-900">{exam.qualification}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">実施形式</dt>
                  <dd className="text-gray-900">{exam.locationType}</dd>
                </div>
                {exam.venueCode && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">会場コード</dt>
                    <dd className="text-gray-900">{exam.venueCode}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">対象会員</dt>
                  <dd className="text-gray-900">
                    {isPremiumOnly ? 'プレミアム会員のみ' : '全会員（無料会員も可）'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                注意事項
              </h3>
              <ul className="space-y-2 text-sm text-amber-900">
                <li>• 申込後のキャンセルは試験日の7日前までとなります。</li>
                <li>• 受験票は試験日の3日前までにメールでお送りします。</li>
                <li>• 当日は受験票と身分証明書を必ずご持参ください。</li>
                {isOnline && (
                  <li>• オンライン試験の場合、安定したインターネット環境が必要です。</li>
                )}
                <li>• 遅刻された場合、受験できない場合があります。</li>
              </ul>
            </div>
          </div>

          {/* Sidebar - Application Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 lg:sticky lg:top-4">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">
                  {exam.fee === 0 ? '無料' : `¥${exam.fee.toLocaleString()}`}
                </div>
                <div className="text-sm text-gray-600">受験料</div>
              </div>

              {applied ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle className="h-5 w-5" />
                    申し込み完了
                  </div>
                  <p className="text-sm text-green-600">
                    受験票をメールでお送りしました。
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={!canApply || applying}
                  className={`w-full py-4 rounded-lg font-bold text-lg mb-4 transition-colors ${
                    canApply && !applying
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {applying
                    ? '申し込み中...'
                    : !isOpen
                    ? '募集は終了しました'
                    : isFull
                    ? '満席のため受付終了'
                    : '試験に申し込む'}
                </button>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">申込状況</span>
                  <span className="font-medium">
                    {exam.applied}/{exam.capacity}名
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">残席数</span>
                  <span className={`font-medium ${remaining < 10 ? 'text-red-600' : ''}`}>
                    {remaining}席
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">申込締切</span>
                  <span className="font-medium text-red-600">{exam.applicationEnd}</span>
                </div>
              </div>

              {isPremiumOnly && (
                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    この試験はプレミアム会員限定です。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
