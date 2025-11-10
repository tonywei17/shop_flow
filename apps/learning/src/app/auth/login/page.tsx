import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">リトミック研究センター</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">ログイン</h1>
          <p className="text-muted-foreground">アカウントにログインしてください</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6">
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
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">ログイン状態を保持</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                パスワードを忘れた
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              ログイン
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/register" className="text-primary font-medium hover:underline">
                無料登録
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
