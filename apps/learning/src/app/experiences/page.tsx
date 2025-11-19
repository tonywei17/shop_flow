import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

import { Header } from "@/components/header";
import { experiences } from "@/data/experiences";

const categoryFilters = [
  { value: "all", label: "すべて" },
  { value: "体験", label: "体験" },
  { value: "見学", label: "見学" },
];

export default function ExperiencesPage() {
  const filtered = experiences; // 追加の絞り込みが必要になったら state を追加

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-b from-emerald-50 to-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-emerald-600">体験・見学</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">まずは体験・見学からスタート</h1>
            <p className="mt-4 text-base text-gray-600">
              リトミックのクラスや講師陣の雰囲気を実際に体験し、最適なプログラムを見つけましょう。オンライン参加もご用意しています。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {categoryFilters.map((filter) => (
                <span
                  key={filter.value}
                  className={`rounded-full border px-4 py-1 text-sm font-medium ${
                    filter.value === "all" ? "border-emerald-500 bg-white text-emerald-600" : "border-transparent bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {filter.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-6">
        {filtered.map((experience) => (
          <article key={experience.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-6 p-6 lg:flex-row">
              <div className="relative h-56 w-full overflow-hidden rounded-xl lg:h-64 lg:w-96">
                <img src={experience.heroImage} alt={experience.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${experience.category === "体験" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                    {experience.category}
                  </span>
                  {experience.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{experience.title}</h2>
                  <p className="mt-2 text-gray-600">{experience.summary}</p>
                </div>
                <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    {experience.schedule}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {experience.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    {experience.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    残り{experience.remainingSeats}席 / 定員{experience.capacity}名
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t pt-4">
                  <p className="text-2xl font-bold text-gray-900">{experience.price === 0 ? "無料" : `¥${experience.price.toLocaleString()}`}</p>
                  <div className="ml-auto flex gap-3">
                    <Link
                      href={`/experiences/${experience.id}`}
                      className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      詳細を見る
                    </Link>
                    <Link
                      href={`/experiences/${experience.id}/apply`}
                      className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      申し込む
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
