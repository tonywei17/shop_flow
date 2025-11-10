import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">リトミック研究センター</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">無料会員登録</h1>
          <p className="text-muted-foreground">今すぐ学習を始めましょう</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                お名前
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="8文字以上"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                パスワード（確認）
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="パスワードを再入力"
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
                および
                <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
                に同意します
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              無料で登録
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
