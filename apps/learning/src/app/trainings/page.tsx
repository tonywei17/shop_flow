import Link from "next/link";
import { Calendar, MapPin, Users, Award } from "lucide-react";

import { Header } from "@/components/header";
import { trainings } from "@/data/trainings";

export default function TrainingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-slate-600">研修プログラム</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">指導者として成長できる研修を選ぶ</h1>
            <p className="mt-4 text-base text-gray-600">
              指導力向上や資格取得に向けた集合研修・オンライン研修を提供しています。レベルや目的に応じて最適なプログラムをお選びください。
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-6 px-4 py-10">
        {trainings.map((training) => {
          const totalFee = training.entryFee + training.annualFee + training.tuitionFee + training.materialFee;
          return (
            <article key={training.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{training.category}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{training.areaLabel}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{training.branch}</span>
                    {training.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{training.title}</h2>
                    <p className="mt-2 text-gray-600">{training.summary}</p>
                    <p className="mt-1 text-sm text-gray-500">{training.courseName}</p>
                  </div>
                  {training.requiredQualification && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                      <span className="inline-flex items-center gap-1">
                        <Award className="h-4 w-4" /> 必要資格: {training.requiredQualification}
                      </span>
                    </p>
                  )}
                  <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      {training.schedule}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      {training.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      定員{training.capacity}名（残り{training.remainingSeats}席）
                    </span>
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-indigo-500" />
                      {training.membership === "premium" ? "プレミアム会員" : "全会員"}
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-stretch justify-between gap-4 lg:w-60">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">総額</p>
                    <p className="text-3xl font-bold text-gray-900">{totalFee === 0 ? "無料" : `¥${totalFee.toLocaleString()}`}</p>
                    {totalFee > 0 && (
                      <p className="text-xs text-gray-500">
                        入会金 {`¥${training.entryFee.toLocaleString()}`} / 受講料 {`¥${training.tuitionFee.toLocaleString()}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/trainings/${training.id}`}
                      className="rounded-full border border-gray-300 px-6 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      詳細を見る
                    </Link>
                    <Link
                      href={`/trainings/${training.id}/apply`}
                      className="rounded-full bg-indigo-600 px-6 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      申し込む
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
