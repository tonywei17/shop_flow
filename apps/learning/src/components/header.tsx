import Link from "next/link";
import { BookOpen, User, Bell } from "lucide-react";

export function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const unreadCount = 2; // Mock data - 实际应该从API获取

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">リトミック研究センター</h1>
            <p className="text-xs text-muted-foreground">オンライン学習</p>
          </div>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/courses" className="text-sm hover:text-primary">
            コース一覧
          </Link>
          <Link href="/activities" className="text-sm hover:text-primary">
            活動・研修
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-primary">
                マイページ
              </Link>
              <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-50">
                <User className="h-4 w-4" />
                <span className="text-sm">会員</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm hover:text-primary">
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
              >
                無料登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
