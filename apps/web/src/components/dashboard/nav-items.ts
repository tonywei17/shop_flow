/**
 * Navigation Items for Dashboard Sidebar
 *
 * This module provides navigation configuration that integrates with
 * the modular architecture from @enterprise/config.
 *
 * Navigation is filtered based on:
 * 1. Enabled modules (via ENABLED_MODULES env var)
 * 2. User's feature permissions (from role)
 */

import type { ComponentType } from "react";
import {
  Building2,
  CreditCard,
  Database,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Wallet,
  Users,
  BarChart3,
  Calendar,
  Bell,
  Award,
  MapPin,
  ClipboardList,
  FileText,
  Settings,
} from "lucide-react";
import {
  getEnabledModules,
  type ModuleId,
} from "@enterprise/config";

// =============================================================================
// Types
// =============================================================================

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  requiredModule?: ModuleId;
};

export type NavSection = {
  label: string;
  items: NavItem[];
  requiredModule?: ModuleId;
};

// =============================================================================
// Static Navigation Sections (with module annotations)
// =============================================================================

/**
 * All navigation sections with their module requirements.
 * These are the base definitions that get filtered by enabled modules.
 */
const ALL_NAV_SECTIONS: NavSection[] = [
  {
    label: "請求書関連",
    requiredModule: "billing",
    items: [
      { label: "請求書生成", href: "/billing/generate", icon: FileText, requiredModule: "billing" },
      { label: "請求書一覧", href: "/billing/invoices", icon: ReceiptText, requiredModule: "billing" },
      { label: "CC会費管理", href: "/billing/cc-fees", icon: CreditCard, requiredModule: "billing" },
      { label: "その他費用管理", href: "/billing/expenses", icon: Wallet, requiredModule: "billing" },
    ],
  },
  {
    label: "オンラインストア管理",
    requiredModule: "commerce",
    items: [
      { label: "商品管理", href: "/commerce", icon: Package, requiredModule: "commerce" },
      { label: "在庫管理", href: "/inventory", icon: Package, requiredModule: "commerce" },
      { label: "注文管理", href: "/commerce/orders", icon: ShoppingBag, requiredModule: "commerce" },
      { label: "商店設定", href: "/commerce/settings", icon: Settings, requiredModule: "commerce" },
    ],
  },
  {
    label: "学習プラットフォーム",
    requiredModule: "learning",
    items: [
      { label: "会員管理", href: "/members", icon: Users, badge: "developing", requiredModule: "learning" },
      { label: "データ分析", href: "/learning-analytics", icon: BarChart3, badge: "developing", requiredModule: "learning" },
      { label: "注文一覧", href: "/learning-orders", icon: CreditCard, badge: "developing", requiredModule: "learning" },
      { label: "研修管理", href: "/trainings", icon: Calendar, badge: "developing", requiredModule: "learning" },
      { label: "見学・体験管理", href: "/experiences", icon: Users, badge: "developing", requiredModule: "learning" },
      { label: "資格一覧", href: "/qualifications", icon: Award, badge: "developing", requiredModule: "learning" },
      { label: "試験管理", href: "/exams", icon: Award, badge: "developing", requiredModule: "learning" },
      { label: "申込一覧", href: "/applications", icon: ClipboardList, badge: "developing", requiredModule: "learning" },
      { label: "資料請求管理", href: "/information-requests", icon: FileText, badge: "developing", requiredModule: "learning" },
      { label: "通知管理", href: "/notifications", icon: Bell, badge: "developing", requiredModule: "learning" },
      { label: "会場一覧", href: "/venues", icon: MapPin, badge: "developing", requiredModule: "learning" },
    ],
  },
  {
    label: "システム管理",
    requiredModule: "system",
    items: [
      { label: "部署管理", href: "/departments", icon: Building2, requiredModule: "system" },
      { label: "アカウント管理", href: "/account", icon: UserCog, requiredModule: "system" },
      { label: "ロール管理", href: "/roles", icon: ShieldCheck, requiredModule: "system" },
      { label: "マスター管理", href: "/master-data", icon: Database, requiredModule: "system" },
    ],
  },
];

// =============================================================================
// Dynamic Navigation Generation
// =============================================================================

/**
 * Get navigation sections filtered by enabled modules.
 * This is the primary function to use when building the sidebar.
 *
 * Note: In client-side context (browser), process.env is not available
 * for non-NEXT_PUBLIC_ variables, so we return all sections by default.
 * Module filtering is primarily enforced at the middleware/route level.
 */
export function getNavSections(): NavSection[] {
  // In browser context, return all sections (module access is enforced by middleware)
  if (typeof window !== "undefined") {
    return ALL_NAV_SECTIONS;
  }

  // In server context, filter by enabled modules
  const enabledModules = getEnabledModules();
  const enabledSet = new Set(enabledModules);

  return ALL_NAV_SECTIONS
    .filter((section) => {
      // Keep section if no module requirement or if required module is enabled
      return !section.requiredModule || enabledSet.has(section.requiredModule);
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Keep item if no module requirement or if required module is enabled
        return !item.requiredModule || enabledSet.has(item.requiredModule);
      }),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Get flat list of all navigation items (filtered by enabled modules)
 */
export function getNavItems(): NavItem[] {
  return getNavSections().flatMap((section) => section.items);
}

/**
 * Check if a navigation item is available based on enabled modules
 */
export function isNavItemEnabled(href: string): boolean {
  const items = getNavItems();
  return items.some((item) => item.href === href);
}

/**
 * Get the module that a navigation href belongs to
 */
export function getModuleForHref(href: string): ModuleId | undefined {
  for (const section of ALL_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.href === href) {
        return item.requiredModule;
      }
    }
  }
  return undefined;
}

// =============================================================================
// Backward Compatibility Exports
// =============================================================================

/**
 * Static navigation sections (for backward compatibility).
 * New code should use getNavSections() for module-aware navigation.
 *
 * @deprecated Use getNavSections() instead for module-aware navigation
 */
export const navSections: NavSection[] = ALL_NAV_SECTIONS;

/**
 * Flat list of all navigation items (for backward compatibility).
 * New code should use getNavItems() for module-aware navigation.
 *
 * @deprecated Use getNavItems() instead for module-aware navigation
 */
export const navItems: NavItem[] = ALL_NAV_SECTIONS.flatMap((section) => section.items);
