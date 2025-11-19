"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, User, Bell, Menu, X } from "lucide-react";

type HeaderProps = {
  isLoggedIn?: boolean;
  variant?: "default" | "landing";
  tagline?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function Header({
  isLoggedIn = false,
  variant = "default",
  tagline,
  ctaHref = "/auth/register",
  ctaLabel = "無料登録",
}: HeaderProps) {
  const unreadCount = 2; // Mock data - 实际应该从API获取
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = variant === "landing";
  const displayTagline = tagline ?? (isLanding ? "オンライン学習プラットフォーム" : "オンライン学習");
  const containerClass = isLanding
    ? "container mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    : "container mx-auto px-4 py-3 flex items-center justify-between gap-3";

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b bg-white/95 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className={containerClass}>
        <Link
          href="/"
          className={`flex w-full ${
            isLanding ? "flex-col gap-2 text-center sm:text-left" : "items-center gap-2"
          }`}
        >
          <div className={`flex items-center gap-2 ${isLanding ? "justify-center sm:justify-start" : ""}`}>
            <BookOpen className="h-8 w-8 text-primary" />
            <div className="space-y-0.5">
              <h1 className="text-base font-bold leading-tight sm:text-xl">リトミック研究センター</h1>
              <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">{displayTagline}</p>
            </div>
          </div>
          {isLanding && (
            <span className="inline-flex items-center justify-center gap-1 self-center rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-primary sm:self-start">
              公式オンライン学習
            </span>
          )}
        </Link>

        {/* 桌面端导航 */}
        <nav
          className={`hidden sm:flex items-center ${
            isLanding ? "gap-6 text-sm" : "gap-4 text-sm"
          }`}
        >
          <Link href="/experiences" className="hover:text-primary">
            体験・見学
          </Link>
          <Link href="/trainings" className="hover:text-primary">
            研修
          </Link>
          <Link href="/exams" className="hover:text-primary">
            資格試験
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-primary">
                マイページ
              </Link>
              <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="flex items-center gap-1 border px-2 py-1 rounded-md text-xs hover:bg-gray-50">
                <User className="h-3 w-3" />
                <span>会員</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-primary">
                ログイン
              </Link>
              <Link
                href={ctaHref}
                className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:opacity-90"
              >
                {ctaLabel}
              </Link>
            </>
          )}
        </nav>

        {/* 手机端右侧区域：通知 + 菜单按钮 */}
        <div
          className={`sm:hidden ${
            isLanding ? "flex w-full items-center justify-between gap-3" : "flex items-center gap-2"
          }`}
        >
          {isLoggedIn && (
            <Link href="/notifications" className="relative rounded-lg p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {!isLoggedIn && (
            <Link
              href={ctaHref}
              className={`rounded-full border border-primary px-4 py-1 text-xs font-semibold text-primary hover:bg-primary/5 ${
                isLanding ? "" : ""
              }`}
            >
              {ctaLabel}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
            aria-label="メニューを開閉"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 手机端展开菜单 */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-3 text-sm">
            <Link href="/experiences" className="hover:text-primary" onClick={closeMenu}>
              体験・見学
            </Link>
            <Link href="/trainings" className="hover:text-primary" onClick={closeMenu}>
              研修
            </Link>
            <Link href="/exams" className="hover:text-primary" onClick={closeMenu}>
              資格試験
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hover:text-primary" onClick={closeMenu}>
                  マイページ
                </Link>
                <Link href="/notifications" className="hover:text-primary" onClick={closeMenu}>
                  お知らせ
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-primary" onClick={closeMenu}>
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium text-center hover:opacity-90"
                  onClick={closeMenu}
                >
                  無料登録
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {isLanding && !menuOpen && (
        <div className="sm:hidden border-t bg-slate-50/90">
          <div className="container mx-auto flex flex-col gap-2 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">人気のメニュー</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/experiences"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
              >
                体験・見学
              </Link>
              <Link
                href="/trainings"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
              >
                研修
              </Link>
              <Link
                href="/exams"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
              >
                資格試験
              </Link>
              <Link
                href="/courses"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
              >
                オンライン講座
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
