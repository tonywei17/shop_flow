"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "./nav-items";

function normalize(value: string | null | undefined): string {
  if (!value) return "/";
  if (value === "/") return "/";
  return value.replace(/\/$/, "");
}

function findActiveNavItem(pathname: string | null | undefined): NavItem | undefined {
  const normalizedPath = normalize(pathname);
  const flat: NavItem[] = navItems as NavItem[];

  let best: NavItem | undefined;

  flat.forEach((item) => {
    const href = normalize(item.href);
    const matches =
      normalizedPath === href || normalizedPath.startsWith(`${href}/`);
    if (!matches) return;
    if (!best) {
      best = item;
      return;
    }
    const bestHref = normalize(best.href);
    if (href.length > bestHref.length) {
      best = item;
    }
  });

  return best;
}

export function FeatureGuard({
  children,
  allowedFeatureIds,
}: {
  children: React.ReactNode;
  allowedFeatureIds?: string[];
}) {
  const pathname = usePathname();
  const activeItem = React.useMemo(
    () => findActiveNavItem(pathname),
    [pathname],
  );

  const currentFeatureId = activeItem ? normalize(activeItem.href) : null;

  // 如果还没有启用功能过滤（undefined），则不做限制
  if (!Array.isArray(allowedFeatureIds)) {
    return <>{children}</>;
  }

  // 未能从 navItems 映射出的页面（例如 dashboard 根页），暂时放行，避免误伤
  if (!currentFeatureId) {
    return <>{children}</>;
  }

  const normalizedAllowed = new Set(
    allowedFeatureIds
      .filter((id) => typeof id === "string" && id.length > 0)
      .map((id) => normalize(id)),
  );

  const isAllowed = normalizedAllowed.has(currentFeatureId);

  if (!isAllowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-destructive">
            この画面へのアクセス権限がありません。
          </p>
          <p className="text-xs text-muted-foreground">
            管理者に問い合わせて、ロールの機能権限を確認してください。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
