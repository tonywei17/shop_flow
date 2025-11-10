'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, User, Crown } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟登录成功，跳转到会员中心
    router.push('/dashboard');
  };

  const handleDemoLogin = (type: 'free' | 'premium') => {
    // 设置演示账号信息到 localStorage
    const demoUser = type === 'premium' 
      ? {
          name: '山田太郎',
          email: 'demo-premium@example.com',
          memberType: 'premium',
          joinDate: '2024-06-15',
          coursesEnrolled: 5,
          qualifications: 2
        }
      : {
          name: '佐藤花子',
          email: 'demo-free@example.com',
          memberType: 'free',
          joinDate: '2024-09-20',
          coursesEnrolled: 1,
          qualifications: 0
        };
    
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">リトミック研究センター</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-600">アカウントにログインしてください</p>
        </div>

        {/* Demo Account Buttons */}
        <div className="mb-6 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-3">🎭 デモアカウントで体験</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('free')}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <User className="h-5 w-5" />
                無料会員でログイン
              </button>
              <button
                onClick={() => handleDemoLogin('premium')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
              >
                <Crown className="h-5 w-5" />
                プレミアム会員でログイン
              </button>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">または通常ログイン</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">ログイン状態を保持</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                パスワードを忘れた
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">
                無料登録
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
