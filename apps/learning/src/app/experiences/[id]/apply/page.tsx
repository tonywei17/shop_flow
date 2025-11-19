"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

import { Header } from "@/components/header";
import { experiences } from "@/data/experiences";

const venueOptions = ["東京本部", "愛知県名古屋市", "大阪支部", "希望しない"];
const referralOptions = [
  "知人から聞いて",
  "ホームページを見て",
  "SNSで",
  "新聞を見て",
  "ダイレクトメール",
  "職場や学校で",
  "ポスター・掲示板",
  "雑誌・本を見て",
  "講座に参加して",
  "その他",
];

export default function ExperienceApplyPage() {
  const params = useParams<{ id: string }>();
  const experience = experiences.find((exp) => exp.id === params.id);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const [formState, setFormState] = useState({
    firstChoice: venueOptions[0],
    secondChoice: "",
    thirdChoice: "",
    request: "東京校",
    lastNameKanji: "",
    firstNameKanji: "",
    lastNameKana: "",
    firstNameKana: "",
    gender: "男",
    age: "",
    phone: "",
    email: "",
    postalCode: "",
    prefecture: "",
    address: "",
    workplace: "",
    referral: referralOptions[0],
    note: "",
  });

  const labelClass = "text-xs font-medium text-gray-600";
  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/experiences");
    }, 1500);
  };

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-gray-600">
          <p>体験・見学が見つかりませんでした。</p>
          <Link href="/experiences" className="text-emerald-600">一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = useMemo(() => [
    { label: "ホーム", href: "/" },
    { label: "体験申し込みフォーム" },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">体験申し込みフォーム</h1>
            <nav className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.label}>
                  {index > 0 && <span className="mx-1">/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-gray-700">
                      {crumb.label}
                    </Link>
                  ) : (
                    crumb.label
                  )}
                </span>
              ))}
            </nav>
          </div>
          <Link href="/experiences" className="inline-flex items-center text-sm text-emerald-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> 一覧に戻る
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">体験会情報</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className={labelClass}>
                  体験会 <span className="text-red-500">*</span>
                </p>
                <input disabled value={experience.title} className={inputClass} />
              </div>
              <div>
                <p className={labelClass}>
                  開催日時
                </p>
                <input disabled value={experience.schedule} className={inputClass} />
              </div>
              <div>
                <p className={labelClass}>
                  第1ご希望会場 <span className="text-red-500">*</span>
                </p>
                <select name="firstChoice" value={formState.firstChoice} className={inputClass} onChange={handleChange}>
                  {experience.venueOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelClass}>第2ご希望会場</p>
                <select name="secondChoice" value={formState.secondChoice} className={inputClass} onChange={handleChange}>
                  <option value="">選択してください</option>
                  {experience.venueOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">体験者情報</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className={labelClass}>
                    姓 <span className="text-red-500">*</span>
                  </p>
                  <input name="lastNameKanji" value={formState.lastNameKanji} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <p className={labelClass}>
                    名 <span className="text-red-500">*</span>
                  </p>
                  <input name="firstNameKanji" value={formState.firstNameKanji} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <p className={labelClass}>セイ</p>
                  <input name="lastNameKana" value={formState.lastNameKana} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <p className={labelClass}>メイ</p>
                  <input name="firstNameKana" value={formState.firstNameKana} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <p className={labelClass}>電話番号</p>
                  <input name="phone" value={formState.phone} onChange={handleChange} className={inputClass} placeholder="123-456-7890" />
                </div>
                <div>
                  <p className={labelClass}>ご年齢</p>
                  <input name="age" value={formState.age} onChange={handleChange} className={inputClass} placeholder="例：27" />
                </div>
                <div>
                  <p className={labelClass}>
                    メールアドレス <span className="text-red-500">*</span>
                  </p>
                  <input name="email" value={formState.email} onChange={handleChange} className={inputClass} type="email" required />
                </div>
                <div>
                  <p className={labelClass}>ご職業</p>
                  <input name="workplace" value={formState.workplace} onChange={handleChange} className={inputClass} placeholder="会社員" />
                </div>
                <div>
                  <p className={labelClass}>郵便番号</p>
                  <input name="postalCode" value={formState.postalCode} onChange={handleChange} className={inputClass} placeholder="123-4567" />
                </div>
                <div>
                  <p className={labelClass}>都道府県</p>
                  <input name="prefecture" value={formState.prefecture} onChange={handleChange} className={inputClass} placeholder="東京都" />
                </div>
                <div className="lg:col-span-2">
                  <p className={labelClass}>住所（市区町村・番地）</p>
                  <input name="address" value={formState.address} onChange={handleChange} className={inputClass} placeholder="港区南青山2-10" />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">その他情報</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {referralOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="referral"
                      value={option}
                      checked={formState.referral === option}
                      onChange={handleChange}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <div>
                <p className={labelClass}>ご質問・ご要望など</p>
                <textarea
                  name="note"
                  rows={3}
                  value={formState.note}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  placeholder="例：持ち物の確認をしたいです"
                />
              </div>
            </section>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                送信
              </button>
              {submitted && <p className="mt-3 text-center text-sm text-emerald-600">送信が完了しました。管理者が確認次第ご連絡いたします。</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
