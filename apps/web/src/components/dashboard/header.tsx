"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/user-context";
import { Building2, CircleHelp, Home, Menu } from "lucide-react";

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

export function DashboardHeader({
  title,
  breadcrumbs,
  showHelpIcon = true,
  actions,
  rightSlot,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const segments = React.useMemo(() => (pathname || "/").split("/").filter(Boolean), [pathname]);
  const labelMap = React.useMemo(
    () => ({
      billing: "請求書関連",
      invoices: "請求一覧",
      "cc-fees": "CC会費管理",
      expenses: "その他費用管理",
      commerce: "オンラインストア管理",
      internal: "内部商品",
      orders: "注文管理",
      "learning-orders": "学習PF注文",
      departments: "部署管理",
      account: "アカウント管理",
      roles: "ロール管理",
      permissions: "権限管理",
      "system-fields": "システム項目管理",
      "master-data": "マスター管理",
      exams: "試験管理",
      new: "新規作成",
      users: "ユーザー",
    }),
    [],
  );

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
  }, [breadcrumbs, labelMap, segments]);

  const headerRightSlot =
    rightSlot ?? (
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DefaultUserSummary />
      </div>
    );

  return (
    <div className="sticky top-0 z-20 space-y-3 bg-background/95">
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border-b border-border bg-card pl-9 pr-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <MobileSidebarTrigger />
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold leading-none text-foreground">{title}</h1>
              {showHelpIcon ? (
                <button type="button" aria-label="ヘルプ" className="text-primary transition-opacity hover:opacity-80">
                  <CircleHelp className="h-[18px] w-[18px]" />
                </button>
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

function DefaultUserSummary() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex w-[220px] items-center gap-4 rounded-lg bg-primary/10 px-4 py-1.5">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  const displayName = user?.displayName ?? "ゲスト";
  const departmentName = user?.departmentName ?? "未所属";
  const roleName = user?.roleName ?? user?.roleCode ?? "一般";
  const avatarUrl = user?.avatarUrl;
  const initials = displayName.slice(0, 2);

  return (
    <Link href="/profile" className="block">
      <div className="flex w-[220px] items-center gap-4 rounded-lg bg-primary/10 px-4 py-1.5 transition-colors hover:bg-primary/15 cursor-pointer">
        <Avatar className="size-11 border-2 border-card shadow-sm">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-left min-w-0">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{departmentName}</span>
          </div>
          <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
            <span className="whitespace-nowrap truncate max-w-[80px]">{displayName}</span>
            <Badge className="border-none bg-card px-2 py-0.5 text-[11px] font-medium text-primary shrink-0">
              {roleName}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
