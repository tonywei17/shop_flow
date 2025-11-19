"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

import { Header } from "@/components/header";
import { trainings } from "@/data/trainings";

const paymentOptions = ["銀行振込", "クレジットカード", "口座振替"];
const motivationOptions = ["資格取得", "スキルアップ", "現場で必要", "その他"];
const experienceOptions = ["有", "無"];

export default function TrainingApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const training = trainings.find((item) => item.id === params.id);

  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    area: training?.areaLabel ?? "",
    venue: training?.venues[0] ?? "",
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    gender: "男性",
    phone: "",
    phone2: "",
    age: "",
    occupation: "",
    email: "",
    emailConfirm: "",
    postalCode: "",
    prefecture: "",
    address: "",
    building: "",
    payment: paymentOptions[0],
    motivation: motivationOptions[0],
    materials: "",
    experience: experienceOptions[1],
    request: "",
  });

  const breadcrumbs = useMemo(
    () => [
      { label: "ホーム", href: "/" },
      { label: "研修申込" },
    ],
    [],
  );

  if (!training) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center text-gray-600">
          <p>研修が見つかりませんでした。</p>
          <Link href="/trainings" className="text-indigo-600">
            研修一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/trainings");
    }, 1500);
  };

  const labelClass = "text-xs font-medium text-gray-600";
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">研修申込フォーム</h1>
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
          <Link href="/trainings" className="inline-flex items-center text-sm text-indigo-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> 一覧に戻る
          </Link>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">研修情報</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className={labelClass}>
                研修会場エリア <span className="text-red-500">*</span>
              </p>
              <input disabled value={training.areaLabel} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>研修会場</p>
              <input disabled value={training.location} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>研修コース名</p>
              <input disabled value={training.courseName} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>研修コース名（略称）</p>
              <input disabled value={training.courseShortName} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>研修日</p>
              <input disabled value={training.schedule} className={inputClass} />
            </div>
            <div>
              <p className={labelClass}>商品名</p>
              <input disabled value={training.productName} className={inputClass} />
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <p className={labelClass}>
                  第1ご希望会場 <span className="text-red-500">*</span>
                </p>
                <select name="venue" value={formState.venue} onChange={handleChange} className={inputClass}>
                  {training.venues.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelClass}>第2ご希望会場</p>
                <select name="secondChoice" onChange={handleChange} className={inputClass}>
                  <option value="">選択してください</option>
                  {training.venues.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelClass}>第3ご希望会場</p>
                <select name="thirdChoice" onChange={handleChange} className={inputClass}>
                  <option value="">選択してください</option>
                  {training.venues.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">受講者情報</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className={labelClass}>姓 *</p>
                <input name="lastName" value={formState.lastName} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <p className={labelClass}>名 *</p>
                <input name="firstName" value={formState.firstName} onChange={handleChange} className={inputClass} required />
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
                <p className={labelClass}>電話番号1</p>
                <input name="phone" value={formState.phone} onChange={handleChange} className={inputClass} placeholder="123-456-7890" />
              </div>
              <div>
                <p className={labelClass}>電話番号2</p>
                <input name="phone2" value={formState.phone2} onChange={handleChange} className={inputClass} placeholder="123-456-7890" />
              </div>
              <div>
                <p className={labelClass}>年齢</p>
                <input name="age" value={formState.age} onChange={handleChange} className={inputClass} placeholder="例：27" />
              </div>
              <div>
                <p className={labelClass}>ご職業</p>
                <input name="occupation" value={formState.occupation} onChange={handleChange} className={inputClass} placeholder="会社員" />
              </div>
              <div>
                <p className={labelClass}>メールアドレス *</p>
                <input name="email" value={formState.email} onChange={handleChange} className={inputClass} type="email" required />
              </div>
              <div>
                <p className={labelClass}>メールアドレス（確認用） *</p>
                <input name="emailConfirm" value={formState.emailConfirm} onChange={handleChange} className={inputClass} type="email" required />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <p className={labelClass}>郵便番号</p>
                <input name="postalCode" value={formState.postalCode} onChange={handleChange} className={inputClass} placeholder="123-4567" />
              </div>
              <div>
                <p className={labelClass}>都道府県</p>
                <input name="prefecture" value={formState.prefecture} onChange={handleChange} className={inputClass} placeholder="東京都" />
              </div>
              <div>
                <p className={labelClass}>建物名</p>
                <input name="building" value={formState.building} onChange={handleChange} className={inputClass} placeholder="フローレンス白鳥" />
              </div>
              <div className="lg:col-span-3">
                <p className={labelClass}>住所（市区町村・番地）</p>
                <input name="address" value={formState.address} onChange={handleChange} className={inputClass} placeholder="〇〇市〇〇町1-2-3" />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">その他情報</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className={labelClass}>お支払い方法</p>
                <select name="payment" value={formState.payment} onChange={handleChange} className={inputClass}>
                  {paymentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelClass}>志望動機</p>
                <select name="motivation" value={formState.motivation} onChange={handleChange} className={inputClass}>
                  {motivationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={labelClass}>教材</p>
                <input name="materials" value={formState.materials} onChange={handleChange} className={inputClass} placeholder="例：テキスト一式" />
              </div>
              <div>
                <p className={labelClass}>受講経験</p>
                <div className="flex items-center gap-4">
                  {experienceOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="experience"
                        value={option}
                        checked={formState.experience === option}
                        onChange={handleChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className={labelClass}>志望動機（自由入力）</p>
                <textarea name="request" value={formState.request} onChange={handleChange} className={inputClass} rows={4} placeholder="志望動機を入力してください" />
              </div>
            </div>
          </section>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
              送信
            </button>
            {submitted && <p className="mt-3 text-center text-sm text-indigo-600">送信が完了しました。確認後ご連絡いたします。</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
