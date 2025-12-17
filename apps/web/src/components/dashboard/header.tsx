"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useUser } from "@/contexts/user-context";
import { Building2, CircleHelp, Home, Menu, LogOut, Settings } from "lucide-react";

type BreadcrumbEntry = {
  label: string;
  href?: string;
};

type DashboardHeaderProps = {
  title: string;
  breadcrumbs?: BreadcrumbEntry[];
  showHelpIcon?: boolean;
  actions?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

// Breadcrumb label map - defined outside component to avoid hydration mismatch
const labelMap: Record<string, string> = {
  // 請求書関連
  billing: "請求書関連",
  invoices: "請求一覧",
  "cc-fees": "CC会費管理",
  expenses: "その他費用管理",
  // オンラインストア管理
  commerce: "商品管理",
  internal: "内部商品",
  orders: "注文管理",
  settings: "商店設定",
  // 学習プラットフォーム
  members: "会員管理",
  "learning-analytics": "データ分析",
  "learning-orders": "注文一覧",
  trainings: "研修管理",
  experiences: "見学・体験管理",
  qualifications: "資格一覧",
  exams: "試験管理",
  "exam-levels": "試験レベル",
  applications: "申込一覧",
  "information-requests": "資料請求管理",
  notifications: "通知管理",
  "course-videos": "コース動画",
  // 会場関連
  venues: "会場一覧",
  // システム管理
  departments: "部署管理",
  account: "アカウント管理",
  roles: "ロール管理",
  permissions: "権限管理",
  "system-fields": "システム項目管理",
  // マスター管理
  "master-data": "マスター管理",
  "account-items": "勘定項目",
  "product-categories": "商品区分",
  counterparties: "相手先",
  // その他
  profile: "プロフィール",
  activities: "アクティビティ",
  "request-forms": "申請フォーム",
  new: "新規作成",
  users: "ユーザー",
};

const tooltipMap: Record<string, string> = {
  billing: "請求書発行と費用精算を管理します",
  invoices: "請求一覧の確認とステータス管理を行います",
  "cc-fees": "CC会費の計上・管理を行います",
  expenses: "その他費用の登録と管理を行います",
  commerce: "商品カタログと価格を管理します",
  internal: "内部商品データを管理します",
  orders: "受注一覧の確認と出荷状況管理を行います",
  settings: "店舗の基本設定・送料・税率を管理します",
  members: "会員アカウントの登録・閲覧を行います",
  "learning-analytics": "学習データの分析と可視化を行います",
  "learning-orders": "学習コースの注文と決済履歴を管理します",
  trainings: "研修プログラムの登録・編集を行います",
  experiences: "見学・体験申込の管理を行います",
  qualifications: "資格種別と要件の管理を行います",
  exams: "試験スケジュールと結果の管理を行います",
  "exam-levels": "試験レベルの定義と設定を行います",
  applications: "各種申込の受付状況を管理します",
  "information-requests": "資料請求の対応状況を管理します",
  notifications: "通知テンプレートと配信履歴を管理します",
  "course-videos": "コース動画の登録と公開設定を行います",
  venues: "会場情報の登録・編集を行います",
  departments: "部署マスタと階層の管理を行います",
  account: "管理者アカウントの作成・権限設定を行います",
  roles: "ロール権限の定義と付与を行います",
  permissions: "機能レベルのアクセス権を管理します",
  "system-fields": "システム項目の追加・編集を行います",
  "master-data": "共通マスターデータを管理します",
  "account-items": "勘定科目マスターを管理します",
  "product-categories": "商品カテゴリの分類を管理します",
  counterparties: "取引先情報の管理を行います",
  profile: "自身のプロフィールを確認・編集します",
  activities: "アクティビティの管理を行います",
  "request-forms": "申請フォームの作成と公開を行います",
  new: "新規作成ページです",
  users: "ユーザー一覧と詳細管理を行います",
};

export function DashboardHeader({
  title,
  breadcrumbs,
  showHelpIcon = true,
  actions,
  rightSlot,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const segments = React.useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);

  const computedBreadcrumbs = React.useMemo<BreadcrumbEntry[]>(() => {
    if (breadcrumbs) return breadcrumbs;
    const list: BreadcrumbEntry[] = [{ label: "ホーム", href: "/" }];
    segments.forEach((seg, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      list.push({
        label: labelMap[seg as keyof typeof labelMap] ?? seg,
        href: index === segments.length - 1 ? undefined : href,
      });
    });
    return list;
  }, [breadcrumbs, segments]);

  const currentTooltip = React.useMemo(() => {
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      const key = segments[i];
      if (tooltipMap[key]) return tooltipMap[key];
    }
    return undefined;
  }, [segments]);

  const headerRightSlot =
    rightSlot ?? (
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <HeaderUserSummary />
      </div>
    );

  return (
    <div className="sticky top-0 z-20 space-y-3 bg-background mb-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border-b border-border bg-card pl-9 pr-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <MobileSidebarTrigger />
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold leading-none text-foreground">{title}</h1>
              {showHelpIcon ? (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="ページの概要"
                        className="text-primary transition-opacity hover:opacity-80"
                      >
                        <CircleHelp className="h-[18px] w-[18px]" />
                      </button>
                    </TooltipTrigger>
                    {currentTooltip ? (
                      <TooltipContent side="right">{currentTooltip}</TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          </div>
          {headerRightSlot}
        </div>
        {actions ? <div className="flex justify-end gap-2">{actions}</div> : null}
      </div>
      {computedBreadcrumbs.length ? (
        <div className="pl-9 pr-6">
          <BreadcrumbRow items={computedBreadcrumbs} />
        </div>
      ) : null}
    </div>
  );
}

function BreadcrumbRow({ items }: { items: BreadcrumbEntry[] }) {
  if (!items.length) return null;

  return (
    <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
      {items.map((item, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const content = item.href && !isLast ? (
          <Link href={item.href} className="flex items-center gap-1 hover:text-foreground">
            {isFirst ? <Home className="h-3.5 w-3.5" /> : null}
            <span>{item.label}</span>
          </Link>
        ) : (
          <span className={isLast ? "text-foreground" : undefined}>
            {isFirst ? (
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </span>
        );

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 ? <span className="text-muted-foreground/60">/</span> : null}
            {content}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function MobileSidebarTrigger() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="メニューを開く" className="shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[268px] p-0">
          <Sidebar isMobile onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function HeaderUserSummary() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-[280px] items-center gap-4 rounded-lg bg-primary/10 px-4 py-1.5">
        <Skeleton className="size-11 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  const displayName = user?.displayName ?? "ゲスト";
  const departmentName = user?.departmentName ?? "未所属";
  const roleName = user?.roleName ?? user?.roleCode ?? "一般";
  const avatarUrl = user?.avatarUrl;
  const roleBadgeColor = user?.roleBadgeColor;
  const initials = displayName.slice(0, 2);

  // Get badge style from color
  const getBadgeStyle = (color: string | null | undefined) => {
    if (!color) return "bg-card text-primary";
    const colorMap: Record<string, string> = {
      "#10b981": "bg-emerald-500/15 text-emerald-600",
      "#22c55e": "bg-green-500/15 text-green-600",
      "#3b82f6": "bg-blue-500/15 text-blue-600",
      "#6366f1": "bg-indigo-500/15 text-indigo-600",
      "#8b5cf6": "bg-violet-500/15 text-violet-600",
      "#a855f7": "bg-purple-500/15 text-purple-600",
      "#ec4899": "bg-pink-500/15 text-pink-600",
      "#f43f5e": "bg-rose-500/15 text-rose-600",
      "#f97316": "bg-orange-500/15 text-orange-600",
      "#f59e0b": "bg-amber-500/15 text-amber-600",
      "#eab308": "bg-yellow-500/15 text-yellow-600",
      "#64748b": "bg-slate-500/15 text-slate-600",
    };
    return colorMap[color] ?? "bg-card text-primary";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="block focus:outline-none">
          <div className="flex w-[280px] items-center gap-4 rounded-lg bg-primary/10 px-4 py-1.5 transition-colors hover:bg-primary/15 cursor-pointer">
            <Avatar className="size-11 border-2 border-card shadow-sm shrink-0">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{departmentName}</span>
              </div>
              <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                <span className="truncate flex-1">{displayName}</span>
                <Badge className={`border-none px-2 py-0.5 text-[11px] font-medium shrink-0 hover:bg-transparent ${getBadgeStyle(roleBadgeColor)}`}>
                  {roleName}
                </Badge>
              </div>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            プロフィール設定
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "ログアウト中..." : "ログアウト"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
