"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, User, Bell, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

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
  const unreadCount = 2; // Mock data
  const isLanding = variant === "landing";
  const displayTagline = tagline ?? (isLanding ? "オンライン学習プラットフォーム" : "オンライン学習");
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold leading-none">リトミック研究センター</span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{displayTagline}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/experiences" className="text-muted-foreground hover:text-foreground transition-colors">
            体験・見学
          </Link>
          <Link href="/trainings" className="text-muted-foreground hover:text-foreground transition-colors">
            研修
          </Link>
          <Link href="/exams" className="text-muted-foreground hover:text-foreground transition-colors">
            資格試験
          </Link>
          
          <div className="flex items-center gap-2 ml-4 border-l pl-6">
            <ModeToggle />
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border border-background" />
                    )}
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="@user" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">ユーザー名</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          user@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">マイページ</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">設定</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">ログイン</Link>
                </Button>
                <Button asChild>
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4">
           <ModeToggle />
           {isLoggedIn && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              </Button>
           )}
           
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>メニュー</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/experiences" className="text-lg font-medium hover:text-primary">
                  体験・見学
                </Link>
                <Link href="/trainings" className="text-lg font-medium hover:text-primary">
                  研修
                </Link>
                <Link href="/exams" className="text-lg font-medium hover:text-primary">
                  資格試験
                </Link>
                <Link href="/courses" className="text-lg font-medium hover:text-primary">
                  オンライン講座
                </Link>
                
                <div className="border-t my-4" />
                
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="text-lg font-medium hover:text-primary">
                      マイページ
                    </Link>
                    <Link href="/settings" className="text-lg font-medium hover:text-primary">
                      設定
                    </Link>
                    <Button variant="outline" className="mt-4 justify-start">
                      ログアウト
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/auth/login">ログイン</Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href={ctaHref}>{ctaLabel}</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
