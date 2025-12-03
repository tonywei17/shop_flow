"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, type ComponentType } from "react";
import { GraduationCap, ShoppingBag } from "lucide-react";

import { navSections } from "./nav-items";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
  className?: string;
  allowedFeatureIds?: string[];
};

export function Sidebar({ isMobile = false, onNavigate, className, allowedFeatureIds }: SidebarProps) {
  const pathname = usePathname();
  const normalize = (value: string | null | undefined) => {
    if (!value) return "/";
    if (value === "/") return "/";
    return value.replace(/\/$/, "");
  };
  const normalizedPath = normalize(pathname);
  const flatItems = navSections.flatMap((section) => section.items);
  const activeHref = flatItems.reduce<string | undefined>((best, item) => {
    const normalizedHref = normalize(item.href);
    const matches =
      normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
    if (!matches) return best;
    if (!best) return normalizedHref;
    return normalizedHref.length > best.length ? normalizedHref : best;
  }, undefined);

  const featureSet = React.useMemo(() => {
    if (!Array.isArray(allowedFeatureIds)) return null;
    return new Set(
      allowedFeatureIds
        .filter((id) => typeof id === "string" && id.length > 0)
        .map((id) => normalize(id)),
    );
  }, [allowedFeatureIds]);

  const filteredSections = React.useMemo(() => {
    if (!Array.isArray(allowedFeatureIds)) return navSections;
    const set = featureSet ?? new Set<string>();
    return navSections
      .map((section) => {
        const items = section.items.filter((item) => set.has(normalize(item.href)));
        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [allowedFeatureIds, featureSet]);

  return (
    <aside
      className={cn(
        "flex w-[256px] min-w-[256px] flex-col border-r border-sidebar-border bg-sidebar",
        isMobile ? "" : "hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:h-screen",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-6 pb-5 pt-6">
        <Image
          src="/eu_logo.png"
          alt="リトミック研究センター ロゴ"
          width={400}
          height={120}
          className="h-auto w-full"
          priority
        />
      </div>
      <div className="flex flex-1 min-h-0 flex-col px-4 pb-5 pt-4">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-2xl border border-sidebar-border bg-sidebar pb-3 pr-1">
            {filteredSections.map((section, index) => (
              <Fragment key={section.label}>
                <SidebarSection
                  section={section}
                  activeHref={activeHref}
                  normalize={normalize}
                  currentPath={normalizedPath}
                  onNavigate={onNavigate}
                />
                {index < navSections.length - 1 && <div className="mx-4 h-px bg-sidebar-border/20" />}
              </Fragment>
            ))}
          </div>
        </div>
        <Link
          href="http://localhost:3002"
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
          className="mt-4 flex items-center justify-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-4 py-3 text-sm font-semibold text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent/80"
        >
          <GraduationCap className="h-4 w-4" />
          <span>学習プラットフォームへ</span>
        </Link>
        <Link
          href="/storefront"
          onClick={onNavigate}
          className="mt-3 flex items-center justify-center gap-2 rounded-md bg-sidebar-primary px-4 py-3 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-colors hover:bg-sidebar-primary/90"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>オンラインストアへ</span>
        </Link>
      </div>
    </aside>
  );
}

type SidebarSectionProps = {
  section: (typeof navSections)[number];
  activeHref?: string;
  normalize: (value: string | null | undefined) => string;
  currentPath: string;
  onNavigate?: () => void;
};

function SidebarSection({ section, activeHref, normalize, currentPath, onNavigate }: SidebarSectionProps) {
  return (
    <div className="px-2 pb-3 pt-4">
      <p className="px-3 text-[12px] font-medium tracking-wide text-muted-foreground">{section.label}</p>
      <div className="mt-2 space-y-1">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={normalize(item.href) === activeHref}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

type SidebarNavItemProps = {
  item: (typeof navSections)[number]["items"][number];
  active: boolean;
  currentPath: string;
  onNavigate?: () => void;
};

function SidebarNavItem({ item, active, currentPath, onNavigate }: SidebarNavItemProps) {
  const Icon: ComponentType<{ className?: string }> = item.icon;

  // Special expandable menu for マスター管理
  if (item.href === "/master-data") {
    const children = [
      { label: "勘定項目", href: "/master-data/account-items" },
      { label: "商品区分", href: "/master-data/product-categories" },
      { label: "相手先", href: "/master-data/counterparties" },
    ];

    const isChildActive = children.some((child) => currentPath.startsWith(child.href));

    return (
      <div className="space-y-1">
        <Link
          href={children[0].href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            active || isChildActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/40",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              active || isChildActive ? "text-sidebar-primary" : "text-muted-foreground",
            )}
          />
          <span className="truncate">{item.label}</span>
        </Link>
        <div className="ml-8 space-y-0.5 text-[13px]">
          {children.map((child) => {
            const childActive = currentPath.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  childActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/40",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/40",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-sidebar-primary" : "text-muted-foreground")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
