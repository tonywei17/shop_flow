"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ComponentType } from "react";
import { GraduationCap, ShoppingBag } from "lucide-react";

import { navSections } from "./nav-items";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function Sidebar({ isMobile = false, onNavigate, className }: SidebarProps) {
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

  return (
    <aside
      className={cn(
        "flex w-[256px] min-w-[256px] flex-col border-r border-[#11111114] bg-white",
        isMobile ? "" : "hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:h-screen",
        className,
      )}
    >
      <div className="border-b border-[#1111111a] px-6 pb-5 pt-6">
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
          <div className="h-full overflow-y-auto rounded-2xl border border-[#11111114] bg-white pb-3 pr-1">
            {navSections.map((section, index) => (
              <Fragment key={section.label}>
                <SidebarSection
                  section={section}
                  activeHref={activeHref}
                  normalize={normalize}
                  onNavigate={onNavigate}
                />
                {index < navSections.length - 1 && <div className="mx-4 h-px bg-[#1111110d]" />}
              </Fragment>
            ))}
          </div>
        </div>
        <Link
          href="http://localhost:3002"
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
          className="mt-4 flex items-center justify-center gap-2 rounded-md border border-[#00ac4d26] bg-[#f2fbf5] px-4 py-3 text-sm font-semibold text-[#008a3e] transition-colors hover:bg-[#e6f6ec]"
        >
          <GraduationCap className="h-4 w-4" />
          <span>学習プラットフォームへ</span>
        </Link>
        <Link
          href="/storefront"
          onClick={onNavigate}
          className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#00ac4d] px-4 py-3 text-sm font-semibold text-white shadow-[0px_4px_14px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#009043]"
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
  onNavigate?: () => void;
};

function SidebarSection({ section, activeHref, normalize, onNavigate }: SidebarSectionProps) {
  return (
    <div className="px-2 pb-3 pt-4">
      <p className="px-3 text-[12px] font-medium tracking-wide text-[#9b9b9b]">{section.label}</p>
      <div className="mt-2 space-y-1">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={normalize(item.href) === activeHref}
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
  onNavigate?: () => void;
};

function SidebarNavItem({ item, active, onNavigate }: SidebarNavItemProps) {
  const Icon: ComponentType<{ className?: string }> = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[rgba(0,172,75,0.12)] text-[#00ac4d]"
          : "text-[#333333] hover:bg-[#f3f5f4]",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#00ac4d]" : "text-[#4d4d4d]")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
