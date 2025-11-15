import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowLeft, Award } from "lucide-react";

const exams = [
  {
    id: "1",
    name: "初級指導者資格試験（2025年春期）",
    qualification: "初級指導者資格",
    date: "2025-03-15 10:00",
    location: "東京本部",
    mode: "対面",
    fee: 12000,
    capacity: 80,
    applied: 56,
    status: "募集受付中",
  },
  {
    id: "2",
    name: "中級指導者資格試験（2025年春期）",
    qualification: "中級指導者資格",
    date: "2025-03-22 13:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 18000,
    capacity: 60,
    applied: 48,
    status: "募集受付中",
  },
  {
    id: "3",
    name: "上級指導者資格試験（2024年冬期）",
    qualification: "上級指導者資格",
    date: "2024-12-08 09:30",
    location: "大阪支部",
    mode: "対面",
    fee: 24000,
    capacity: 40,
    applied: 40,
    status: "締切済み",
  },
  {
    id: "4",
    name: "初級指導者資格追試（オンライン）",
    qualification: "初級指導者資格",
    date: "2025-01-12 19:00",
    location: "オンライン",
    mode: "オンライン",
    fee: 8000,
    capacity: 100,
    applied: 32,
    status: "下書き",
  },
];

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const exam = exams.find((e) => e.id === params.id);

  if (!exam) {
    return (
      <div className="p-8">
        <DashboardHeader
          title="試験詳細"
          actions={
            <Link
              href="/exams"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              試験一覧に戻る
            </Link>
          }
        />
        <div className="mt-6 text-sm text-gray-600">指定された試験が見つかりませんでした。</div>
      </div>
    );
  }

  const [examDate, examTime] = exam.date.split(" ");
  const feeLabel = exam.fee === 0 ? "無料" : `¥${exam.fee.toLocaleString()}`;

  return (
    <div className="p-8">
      <DashboardHeader
        title={exam.name}
        actions={
          <div className="flex gap-3">
            <Link
              href="/exams"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              試験一覧に戻る
            </Link>
            <Link
              href={`/exams/${exam.id}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              編集
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Award className="mr-1 h-3.5 w-3.5" />
                {exam.qualification}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  exam.status === "募集受付中"
                    ? "bg-green-100 text-green-700"
                    : exam.status === "締切済み"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {exam.status}
              </span>
            </div>

            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">受験日</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {examDate} {examTime}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">会場 / 形式</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{exam.location}</span>
                  <span className="text-xs text-gray-500">({exam.mode})</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">受験料</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{feeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">定員 / 申込状況</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    {exam.applied}/{exam.capacity}名
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-blue-600"
                      style={{ width: `${(exam.applied / exam.capacity) * 100}%` }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">試験概要</h2>
            <p className="text-sm text-gray-700">
              ここには試験の概要や出題範囲、持ち物などの詳細説明が入る想定です。現在はモックデータのため、
              後続のバックエンド実装時に試験の詳細説明フィールドと連携してください。
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="mb-4 text-sm font-bold text-gray-900">試験情報サマリー</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">資格種別</dt>
                <dd className="font-medium text-gray-900">{exam.qualification}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">形式</dt>
                <dd className="font-medium text-gray-900">{exam.mode}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">受験料</dt>
                <dd className="font-medium text-gray-900">{feeLabel}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">定員</dt>
                <dd className="font-medium text-gray-900">{exam.capacity}名</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">申込数</dt>
                <dd className="font-medium text-gray-900">{exam.applied}名</dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-sm text-blue-900">
            <h3 className="mb-2 text-sm font-bold">運営メモ</h3>
            <ul className="space-y-2">
              <li>・申込締切日や結果発表日などの項目は、今後バックエンド連携時に追加できます。</li>
              <li>・この画面からの編集は「編集」ボタンから行います。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
