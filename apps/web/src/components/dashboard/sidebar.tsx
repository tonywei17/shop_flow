"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, useState, type ComponentType } from "react";
import { GraduationCap, ShoppingBag, ChevronDown, ChevronRight } from "lucide-react";

import { getNavSections, navSections, type NavSection } from "./nav-items";
import { cn } from "@/lib/utils";

// External app URLs - use environment variables for production
const LEARNING_PLATFORM_URL = process.env.NEXT_PUBLIC_LEARNING_URL || "http://localhost:3002";
const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";

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

  // Use static navigation sections in client component
  // Module access control is enforced by middleware at the route level
  const moduleFilteredSections = navSections;
  const flatItems = moduleFilteredSections.flatMap((section) => section.items);
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
    // First apply module filtering, then feature permission filtering
    if (!Array.isArray(allowedFeatureIds)) return moduleFilteredSections;
    const set = featureSet ?? new Set<string>();
    return moduleFilteredSections
      .map((section) => {
        const items = section.items.filter((item) => set.has(normalize(item.href)));
        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [allowedFeatureIds, featureSet, moduleFilteredSections]);

  return (
    <aside
      className={cn(
        "flex w-[256px] min-w-[256px] flex-col bg-sidebar shadow-sm",
        isMobile ? "" : "hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:h-screen",
        className,
      )}
    >
      <div className="px-6 pt-4">
        <Image
          src="/eu_logo.png"
          alt="リトミック研究センター ロゴ"
          width={400}
          height={120}
          className="h-auto w-full"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-1 min-h-0 flex-col px-4 pb-5 pt-4">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto pb-3 pr-1">
            {filteredSections.map((section, index) => (
              <Fragment key={section.label}>
                <SidebarSection
                  section={section}
                  activeHref={activeHref}
                  normalize={normalize}
                  currentPath={normalizedPath}
                  onNavigate={onNavigate}
                />
                {index < filteredSections.length - 1 && <div className="mx-4 my-2" />}
              </Fragment>
            ))}
          </div>
        </div>
        <Link
          href={LEARNING_PLATFORM_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
          className="mt-4 flex items-center justify-center gap-2 rounded-md bg-sidebar-accent px-4 py-3 text-sm font-semibold text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent/80"
        >
          <GraduationCap className="h-4 w-4" />
          <span>学習プラットフォームへ</span>
        </Link>
        <Link
          href={STOREFRONT_URL}
          target="_blank"
          rel="noreferrer"
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
  defaultExpanded?: boolean;
};

function SidebarSection({ section, activeHref, normalize, currentPath, onNavigate, defaultExpanded = true }: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Check if any item in this section is active
  const hasActiveItem = section.items.some((item) => normalize(item.href) === activeHref);
  
  // Auto-expand if there's an active item
  React.useEffect(() => {
    if (hasActiveItem && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasActiveItem, isExpanded]);

  return (
    <div className="px-2 pb-1 pt-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-sidebar-accent/30"
      >
        <span>{section.label}</span>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-1">
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
      )}
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
      {item.badge && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
