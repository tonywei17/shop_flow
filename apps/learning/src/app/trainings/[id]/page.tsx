import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, MapPin, Users, Award, CheckCircle2 } from "lucide-react";

import { Header } from "@/components/header";
import { trainings } from "@/data/trainings";

export function generateStaticParams() {
  return trainings.map((training) => ({ id: training.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const training = trainings.find((item) => item.id === params.id);
  if (!training) {
    return { title: "研修が見つかりません" };
  }

  return {
    title: `${training.title} | 研修`,
    description: training.summary,
  };
}

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const training = trainings.find((item) => item.id === id);

  if (!training) {
    notFound();
  }

  const totalFee = training.entryFee + training.annualFee + training.tuitionFee + training.materialFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/trainings" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="mr-1 h-4 w-4" /> 研修一覧に戻る
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <article className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">{training.category}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{training.areaLabel}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{training.branch}</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{training.title}</h1>
              <p className="mt-2 text-gray-600">{training.summary}</p>
              <p className="mt-1 text-sm text-gray-500">{training.courseName}</p>
            </div>

            <img src={training.heroImage} alt={training.title} className="h-80 w-full rounded-2xl object-cover" />

            <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
              <InfoRow icon={<Calendar className="h-4 w-4 text-indigo-600" />} label="開催日時" value={training.schedule} />
              <InfoRow icon={<MapPin className="h-4 w-4 text-indigo-600" />} label="会場" value={training.location} />
              <InfoRow icon={<Users className="h-4 w-4 text-indigo-600" />} label="定員" value={`残り${training.remainingSeats}席 / 定員${training.capacity}名`} />
              <InfoRow
                icon={<Award className="h-4 w-4 text-indigo-600" />}
                label="参加対象"
                value={training.membership === "premium" ? "プレミアム会員" : "全会員"}
              />
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">費用内訳</h2>
              <div className="mt-3 grid gap-3 rounded-xl border p-4 text-sm text-gray-700 sm:grid-cols-2">
                <CostRow label="入会金" value={training.entryFee} />
                <CostRow label="年会費" value={training.annualFee} />
                <CostRow label="受講料" value={training.tuitionFee} />
                <CostRow label="教材費" value={training.materialFee} />
                <CostRow label="合計" value={totalFee} highlight />
              </div>
            </section>

            {training.requiredQualification && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900">必要資格</h2>
                <p className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  {training.requiredQualification}
                </p>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-gray-900">研修のポイント</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {training.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">持ち物・事前準備</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                {training.preparation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">担当講師</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{training.instructor}</p>
              <p className="mt-3 text-sm text-gray-600">参加者には担当講師から事前の確認メールをお送りします。</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">選択可能な会場</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {training.venues.map((venue) => (
                  <li key={venue}>{venue}</li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                <Link
                  href={`/trainings/${training.id}/apply`}
                  className="block rounded-full bg-indigo-600 px-6 py-3 text-center font-semibold text-white hover:bg-indigo-700"
                >
                  申込フォームへ進む
                </Link>
                <Link
                  href="/trainings"
                  className="block rounded-full border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                >
                  他の研修を見る
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function CostRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? "text-indigo-600" : "text-gray-900"}`}>
        {value === 0 ? "無料" : `¥${value.toLocaleString()}`}
      </span>
    </div>
  );
}
