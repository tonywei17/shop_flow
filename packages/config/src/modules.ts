/**
 * @enterprise/config - Module Registry
 *
 * Defines all available modules and their configurations.
 * This is the central registry for the modular architecture.
 */

import type { ModuleId, ModuleDefinition, MenuSection } from "./types";
import { getEnabledModules, isModuleEnabled } from "./env";

// =============================================================================
// Navigation Sections by Module
// =============================================================================

const BILLING_NAV_SECTIONS: MenuSection[] = [
  {
    id: "billing",
    label: "請求書関連",
    requiredModule: "billing",
    items: [
      {
        id: "billing-generate",
        label: "請求書生成",
        href: "/billing/generate",
        icon: "FileText",
      },
      {
        id: "billing-invoices",
        label: "請求書一覧",
        href: "/billing/invoices",
        icon: "ReceiptText",
      },
      {
        id: "billing-cc-fees",
        label: "CC会費管理",
        href: "/billing/cc-fees",
        icon: "CreditCard",
      },
      {
        id: "billing-expenses",
        label: "その他費用管理",
        href: "/billing/expenses",
        icon: "Wallet",
      },
    ],
  },
];

const COMMERCE_NAV_SECTIONS: MenuSection[] = [
  {
    id: "commerce",
    label: "オンラインストア管理",
    requiredModule: "commerce",
    items: [
      {
        id: "commerce-products",
        label: "商品管理",
        href: "/commerce",
        icon: "Package",
      },
      {
        id: "commerce-inventory",
        label: "在庫管理",
        href: "/inventory",
        icon: "Package",
      },
      {
        id: "commerce-orders",
        label: "注文管理",
        href: "/commerce/orders",
        icon: "ShoppingBag",
      },
      {
        id: "commerce-settings",
        label: "商店設定",
        href: "/commerce/settings",
        icon: "Settings",
      },
    ],
  },
];

const LEARNING_NAV_SECTIONS: MenuSection[] = [
  {
    id: "learning",
    label: "学習プラットフォーム",
    requiredModule: "learning",
    items: [
      {
        id: "learning-members",
        label: "会員管理",
        href: "/members",
        icon: "Users",
        badge: "developing",
      },
      {
        id: "learning-analytics",
        label: "データ分析",
        href: "/learning-analytics",
        icon: "BarChart3",
        badge: "developing",
      },
      {
        id: "learning-orders",
        label: "注文一覧",
        href: "/learning-orders",
        icon: "CreditCard",
        badge: "developing",
      },
      {
        id: "learning-trainings",
        label: "研修管理",
        href: "/trainings",
        icon: "Calendar",
        badge: "developing",
      },
      {
        id: "learning-experiences",
        label: "見学・体験管理",
        href: "/experiences",
        icon: "Users",
        badge: "developing",
      },
      {
        id: "learning-qualifications",
        label: "資格一覧",
        href: "/qualifications",
        icon: "Award",
        badge: "developing",
      },
      {
        id: "learning-exams",
        label: "試験管理",
        href: "/exams",
        icon: "Award",
        badge: "developing",
      },
      {
        id: "learning-applications",
        label: "申込一覧",
        href: "/applications",
        icon: "ClipboardList",
        badge: "developing",
      },
      {
        id: "learning-info-requests",
        label: "資料請求管理",
        href: "/information-requests",
        icon: "FileText",
        badge: "developing",
      },
      {
        id: "learning-notifications",
        label: "通知管理",
        href: "/notifications",
        icon: "Bell",
        badge: "developing",
      },
      {
        id: "learning-venues",
        label: "会場一覧",
        href: "/venues",
        icon: "MapPin",
        badge: "developing",
      },
    ],
  },
];

const SYSTEM_NAV_SECTIONS: MenuSection[] = [
  {
    id: "system",
    label: "システム管理",
    requiredModule: "system",
    items: [
      {
        id: "system-departments",
        label: "部署管理",
        href: "/departments",
        icon: "Building2",
      },
      {
        id: "system-accounts",
        label: "アカウント管理",
        href: "/account",
        icon: "UserCog",
      },
      {
        id: "system-roles",
        label: "ロール管理",
        href: "/roles",
        icon: "ShieldCheck",
      },
      {
        id: "system-master-data",
        label: "マスター管理",
        href: "/master-data",
        icon: "Database",
      },
    ],
  },
];

// =============================================================================
// Module Registry
// =============================================================================

/**
 * Complete module definitions registry
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  billing: {
    id: "billing",
    name: "請求書関連",
    description: "請求書生成、CC会費管理、その他費用管理",
    navSections: BILLING_NAV_SECTIONS,
    routes: ["/billing", "/inventory"],
    apiRoutes: ["/api/invoices", "/api/expenses", "/api/cc-members"],
    dependencies: ["system"], // Billing depends on system (departments, accounts)
  },

  commerce: {
    id: "commerce",
    name: "オンラインストア管理",
    description: "商品管理、在庫管理、注文管理、商店設定",
    navSections: COMMERCE_NAV_SECTIONS,
    routes: ["/commerce", "/inventory"],
    apiRoutes: [
      "/api/internal/products",
      "/api/internal/orders",
      "/api/internal/inventory",
      "/api/internal/store-settings",
      "/api/orders",
    ],
    dependencies: ["system"],
  },

  learning: {
    id: "learning",
    name: "学習プラットフォーム",
    description: "会員管理、研修管理、試験管理、通知管理など",
    navSections: LEARNING_NAV_SECTIONS,
    routes: [
      "/members",
      "/learning-analytics",
      "/learning-orders",
      "/trainings",
      "/experiences",
      "/qualifications",
      "/exams",
      "/applications",
      "/information-requests",
      "/notifications",
      "/venues",
      "/course-videos",
    ],
    apiRoutes: ["/api/learning"],
    dependencies: ["system"],
  },

  system: {
    id: "system",
    name: "システム管理",
    description: "部署管理、アカウント管理、ロール管理、マスター管理",
    navSections: SYSTEM_NAV_SECTIONS,
    routes: [
      "/departments",
      "/account",
      "/roles",
      "/master-data",
      "/profile",
      "/permissions",
      "/system-fields",
      "/request-forms",
    ],
    apiRoutes: [
      "/api/internal/departments",
      "/api/internal/accounts",
      "/api/internal/roles",
      "/api/internal/account-items",
      "/api/internal/counterparties",
      "/api/internal/product-categories",
      "/api/auth",
    ],
    dependencies: [], // System is the base module, no dependencies
  },
};

// =============================================================================
// Module Utility Functions
// =============================================================================

/**
 * Get the module definition for a given module ID
 */
export function getModuleDefinition(
  moduleId: ModuleId
): ModuleDefinition | undefined {
  return MODULE_REGISTRY[moduleId];
}

/**
 * Get all module definitions
 */
export function getAllModuleDefinitions(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Get module definitions for enabled modules only
 */
export function getEnabledModuleDefinitions(): ModuleDefinition[] {
  const enabled = getEnabledModules();
  return enabled.map((id) => MODULE_REGISTRY[id]);
}

/**
 * Get navigation sections for enabled modules
 */
export function getEnabledNavSections(): MenuSection[] {
  return getEnabledModuleDefinitions().flatMap((m) => m.navSections);
}

/**
 * Check if a route path belongs to an enabled module
 */
export function isRouteEnabled(pathname: string): boolean {
  const enabled = getEnabledModules();

  // Always allow root, login, and common paths
  if (pathname === "/" || pathname === "/login" || pathname === "/profile") {
    return true;
  }

  // Check against each enabled module's routes
  for (const moduleId of enabled) {
    const module = MODULE_REGISTRY[moduleId];
    if (module.routes.some((route) => pathname.startsWith(route))) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an API route belongs to an enabled module
 */
export function isApiRouteEnabled(pathname: string): boolean {
  const enabled = getEnabledModules();

  // Always allow auth API
  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  // Check against each enabled module's API routes
  for (const moduleId of enabled) {
    const module = MODULE_REGISTRY[moduleId];
    if (module.apiRoutes.some((route) => pathname.startsWith(route))) {
      return true;
    }
  }

  return false;
}

/**
 * Get the module that owns a specific route
 */
export function getModuleForRoute(pathname: string): ModuleId | null {
  for (const [moduleId, module] of Object.entries(MODULE_REGISTRY)) {
    if (module.routes.some((route) => pathname.startsWith(route))) {
      return moduleId as ModuleId;
    }
  }
  return null;
}

/**
 * Check if all dependencies for a module are satisfied (enabled)
 */
export function areModuleDependenciesSatisfied(moduleId: ModuleId): boolean {
  const module = MODULE_REGISTRY[moduleId];
  if (!module.dependencies || module.dependencies.length === 0) {
    return true;
  }

  const enabled = getEnabledModules();
  return module.dependencies.every((dep) => enabled.includes(dep));
}

/**
 * Get unsatisfied dependencies for a module
 */
export function getUnsatisfiedDependencies(moduleId: ModuleId): ModuleId[] {
  const module = MODULE_REGISTRY[moduleId];
  if (!module.dependencies || module.dependencies.length === 0) {
    return [];
  }

  const enabled = getEnabledModules();
  return module.dependencies.filter((dep) => !enabled.includes(dep));
}
