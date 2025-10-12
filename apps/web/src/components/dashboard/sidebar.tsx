"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "./nav-items";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

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
        "flex h-full w-[268px] min-w-[268px] flex-col border-r border-border bg-white",
        isMobile ? "" : "hidden md:flex md:min-h-screen",
        className,
      )}
    >
      <div className="flex h-20 flex-col justify-center gap-1 px-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#00ac4d]">認定NPO法人</span>
        <span className="text-lg font-semibold text-[#111111]">リトミック研究センター</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        <div className="flex flex-col gap-6">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <p className="px-2 text-sm font-medium text-[#6f6f6f]">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon: ComponentType<{ className?: string }> = item.icon;
                  const normalizedHref = normalize(item.href);
                  const active = normalizedHref === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#e9f8ef] text-[#00ac4d]"
                          : "text-[#4f4f4f] hover:bg-[#f2f2f2] hover:text-[#111111]",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-[#00ac4d]" : "text-[#8a8a8a]")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      <div className="px-4 pb-6">
        <Link
          href="/storefront"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-md bg-[#00ac4d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00943f]"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>オンラインストアへ</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
        </Link>
      </div>
    </aside>
  );
}
