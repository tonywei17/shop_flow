"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, Phone, Send } from "lucide-react";

export default function RequestInfoPage() {
  const [formState, setFormState] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-emerald-700">
            リトミック研究センター
          </Link>
          <Link
            href="/"
            className="rounded-full border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            サービスに戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">資料請求</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">音楽学院のプログラム資料をお届けします</h1>
            <p className="mt-4 text-gray-600">
              研修コースや見学・体験の詳細、資格・試験の最新スケジュールなど、最新の情報をまとめた資料をメールでお送りします。
            </p>

            <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              {["最新のカリキュラム", "講師陣・校舎情報", "料金・申し込みフロー"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400">※送信後、2営業日以内に担当者からメールでご連絡いたします。</p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-emerald-100">
            {submitted ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">送信が完了しました</h2>
                <p className="mt-2 text-sm text-gray-600">
                  ご入力いただいたメール宛に確認メールを送信しました。資料は担当者の承認後にお送りします。
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  トップへ戻る
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="name">
                    お名前 <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="例：山田 太郎"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    メールアドレス <span className="text-emerald-600">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <input
                      required
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="例：user@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                    電話番号（任意）
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="例：090-1234-5678"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700" htmlFor="message">
                    興味のある内容・質問（任意）
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formState.message}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="希望するコースや相談したい内容があればご入力ください"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                  資料を請求する
                </button>
                <p className="text-center text-[11px] text-gray-400">
                  送信いただいた個人情報はプライバシーポリシーに基づき厳重に取り扱います。
                </p>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
