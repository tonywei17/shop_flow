'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, User, Crown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FaGoogle, FaApple, FaTwitter, FaInstagram } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟登录成功，跳转到会员中心
    router.push('/dashboard');
  };

  const handleSocialLogin = (provider: string) => {
    // 模拟社交登录
    console.log(`Login with ${provider}`);
    router.push('/dashboard');
  }

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">リトミック研究センター</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">ログイン</h1>
          <p className="text-muted-foreground mt-2">アカウントにログインしてください</p>
        </div>

        {/* Demo Account Buttons */}
        <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-3 text-center">🎭 デモアカウントで体験</p>
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="w-full bg-background hover:bg-muted"
                onClick={() => handleDemoLogin('free')}
              >
                <User className="mr-2 h-4 w-4" />
                無料会員でログイン
              </Button>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none text-white shadow-md"
                onClick={() => handleDemoLogin('premium')}
              >
                <Crown className="mr-2 h-4 w-4" />
                プレミアム会員でログイン
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase">または</span>
          <Separator className="flex-1" />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')}>
            <FaGoogle className="h-4 w-4" />
            <span className="sr-only">Login with Google</span>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('apple')}>
            <FaApple className="h-4 w-4" />
            <span className="sr-only">Login with Apple</span>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('twitter')}>
            <FaTwitter className="h-4 w-4" />
            <span className="sr-only">Login with X</span>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('instagram')}>
            <FaInstagram className="h-4 w-4" />
            <span className="sr-only">Login with Instagram</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase">メールアドレスでログイン</span>
          <Separator className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>通常ログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">パスワード</Label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    忘れた場合
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  ログイン状態を保持
                </Label>
              </div>
              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                無料登録
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

