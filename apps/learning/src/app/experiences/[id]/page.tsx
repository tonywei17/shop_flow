import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2 } from "lucide-react";

import { Header } from "@/components/header";
import { experiences } from "@/data/experiences";

export function generateStaticParams() {
  return experiences.map((experience) => ({ id: experience.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const experience = experiences.find((exp) => exp.id === params.id);
  if (!experience) {
    return { title: "体験が見つかりません" };
  }
  return {
    title: `${experience.title} | 体験・見学`,
    description: experience.summary,
  };
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = experiences.find((exp) => exp.id === id);

  if (!experience) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/experiences" className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="mr-1 h-4 w-4" /> 体験・見学一覧に戻る
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="space-y-6">
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    experience.category === "体験" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {experience.category}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-gray-900">{experience.title}</h1>
                <p className="mt-2 text-gray-600">{experience.description}</p>
              </div>

              <img
                src={experience.heroImage}
                alt={experience.title}
                className="h-80 w-full rounded-2xl object-cover"
              />

              <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                <InfoRow icon={<Calendar className="h-4 w-4 text-emerald-600" />} label="開催日時" value={experience.schedule} />
                <InfoRow icon={<Clock className="h-4 w-4 text-emerald-600" />} label="所要時間" value={experience.duration} />
                <InfoRow icon={<MapPin className="h-4 w-4 text-emerald-600" />} label="会場" value={experience.location} />
                <InfoRow
                  icon={<Users className="h-4 w-4 text-emerald-600" />}
                  label="定員"
                  value={`残り${experience.remainingSeats}席 / 定員${experience.capacity}名`}
                />
              </div>

              <section>
                <h2 className="text-xl font-semibold text-gray-900">体験のポイント</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {experience.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900">持ち物・事前準備</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {experience.preparation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">担当講師</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{experience.instructor}</p>
              <p className="mt-4 text-sm text-gray-600">
                お申し込みいただいた方には担当講師から事前の確認メールをお送りします。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">申込と会場</p>
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <p>選択可能な会場</p>
                <ul className="list-disc space-y-1 pl-5">
                  {experience.venueOptions.map((venue) => (
                    <li key={venue}>{venue}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 space-y-2">
                <Link
                  href={`/experiences/${experience.id}/apply`}
                  className="block rounded-full bg-emerald-600 px-6 py-3 text-center font-semibold text-white hover:bg-emerald-700"
                >
                  申込フォームへ進む
                </Link>
                <Link
                  href="/experiences"
                  className="block rounded-full border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                >
                  他の体験を見る
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
