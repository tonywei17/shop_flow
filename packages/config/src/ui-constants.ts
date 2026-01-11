/**
 * @enterprise/config - UI Constants
 *
 * Configurable UI constants including badge colors, status labels,
 * price types, and other display-related settings.
 */

import type {
  UIConstants,
  BadgeColor,
  StatusBadge,
  DataScopeOption,
} from "./types";

// =============================================================================
// Price Types
// =============================================================================

/**
 * Price type options for role/pricing configuration
 */
export const DEFAULT_PRICE_TYPES: Array<{ value: string; label: string }> = [
  { value: "headquarters", label: "本部価格" },
  { value: "branch", label: "支局価格" },
  { value: "classroom", label: "教室価格" },
  { value: "general", label: "一般価格" },
];

// =============================================================================
// Badge Colors
// =============================================================================

/**
 * Available badge colors for roles and other entities
 */
export const DEFAULT_BADGE_COLORS: BadgeColor[] = [
  { value: "gray", label: "グレー", className: "bg-gray-100 text-gray-800" },
  { value: "red", label: "レッド", className: "bg-red-100 text-red-800" },
  {
    value: "orange",
    label: "オレンジ",
    className: "bg-orange-100 text-orange-800",
  },
  {
    value: "amber",
    label: "アンバー",
    className: "bg-amber-100 text-amber-800",
  },
  {
    value: "yellow",
    label: "イエロー",
    className: "bg-yellow-100 text-yellow-800",
  },
  { value: "lime", label: "ライム", className: "bg-lime-100 text-lime-800" },
  {
    value: "green",
    label: "グリーン",
    className: "bg-green-100 text-green-800",
  },
  {
    value: "emerald",
    label: "エメラルド",
    className: "bg-emerald-100 text-emerald-800",
  },
  { value: "teal", label: "ティール", className: "bg-teal-100 text-teal-800" },
  { value: "cyan", label: "シアン", className: "bg-cyan-100 text-cyan-800" },
  { value: "sky", label: "スカイ", className: "bg-sky-100 text-sky-800" },
  { value: "blue", label: "ブルー", className: "bg-blue-100 text-blue-800" },
  {
    value: "indigo",
    label: "インディゴ",
    className: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "violet",
    label: "バイオレット",
    className: "bg-violet-100 text-violet-800",
  },
  {
    value: "purple",
    label: "パープル",
    className: "bg-purple-100 text-purple-800",
  },
  {
    value: "fuchsia",
    label: "フクシア",
    className: "bg-fuchsia-100 text-fuchsia-800",
  },
  { value: "pink", label: "ピンク", className: "bg-pink-100 text-pink-800" },
  { value: "rose", label: "ローズ", className: "bg-rose-100 text-rose-800" },
];

// =============================================================================
// Data Scope Options
// =============================================================================

/**
 * Data scope options for role configuration
 */
export const DEFAULT_DATA_SCOPE_OPTIONS: DataScopeOption[] = [
  { value: "all", label: "全データ", description: "すべてのデータにアクセス可能" },
  {
    value: "branch_and_below",
    label: "支局配下",
    description: "所属支局とその配下のデータにアクセス可能",
  },
  {
    value: "department_only",
    label: "部署のみ",
    description: "所属部署のデータのみアクセス可能",
  },
  {
    value: "self_only",
    label: "自分のみ",
    description: "自分が作成したデータのみアクセス可能",
  },
];

// =============================================================================
// Status Badges
// =============================================================================

/**
 * Default status badge configurations
 */
export const DEFAULT_STATUS_BADGES: Record<string, StatusBadge> = {
  // Account/Entity Status
  active: { label: "有効", variant: "default", className: "bg-green-100 text-green-800" },
  inactive: { label: "無効", variant: "secondary", className: "bg-gray-100 text-gray-500" },
  suspended: { label: "停止中", variant: "destructive", className: "bg-red-100 text-red-800" },
  pending: { label: "保留中", variant: "outline", className: "bg-yellow-100 text-yellow-800" },

  // Invoice Status
  draft: { label: "下書き", variant: "outline", className: "bg-gray-100 text-gray-600" },
  submitted: { label: "提出済", variant: "default", className: "bg-blue-100 text-blue-800" },
  approved: { label: "承認済", variant: "default", className: "bg-green-100 text-green-800" },
  rejected: { label: "却下", variant: "destructive", className: "bg-red-100 text-red-800" },
  paid: { label: "支払済", variant: "default", className: "bg-emerald-100 text-emerald-800" },

  // Order Status
  new: { label: "新規", variant: "default", className: "bg-blue-100 text-blue-800" },
  processing: { label: "処理中", variant: "outline", className: "bg-yellow-100 text-yellow-800" },
  shipped: { label: "発送済", variant: "default", className: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "配達済", variant: "default", className: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", variant: "destructive", className: "bg-red-100 text-red-800" },

  // Boolean status
  true: { label: "はい", variant: "default", className: "bg-green-100 text-green-800" },
  false: { label: "いいえ", variant: "secondary", className: "bg-gray-100 text-gray-500" },

  // Development badge
  developing: { label: "開発中", variant: "outline", className: "bg-amber-100 text-amber-800" },
};

// =============================================================================
// Default UI Constants
// =============================================================================

/**
 * Complete default UI constants
 */
export const DEFAULT_UI_CONSTANTS: UIConstants = {
  priceTypes: DEFAULT_PRICE_TYPES,
  badgeColors: DEFAULT_BADGE_COLORS,
  dataScopeOptions: DEFAULT_DATA_SCOPE_OPTIONS,
  statusBadges: DEFAULT_STATUS_BADGES,
};

// =============================================================================
// UI Constants Cache and Getters
// =============================================================================

let cachedUIConstants: UIConstants | null = null;

/**
 * Clear the UI constants cache
 */
export function clearUIConstantsCache(): void {
  cachedUIConstants = null;
}

/**
 * Get the current UI constants
 */
export function getUIConstants(): UIConstants {
  if (cachedUIConstants) {
    return cachedUIConstants;
  }
  cachedUIConstants = DEFAULT_UI_CONSTANTS;
  return cachedUIConstants;
}

/**
 * Get price type options
 */
export function getPriceTypes(): Array<{ value: string; label: string }> {
  return getUIConstants().priceTypes;
}

/**
 * Get badge color options
 */
export function getBadgeColors(): BadgeColor[] {
  return getUIConstants().badgeColors;
}

/**
 * Get data scope options
 */
export function getDataScopeOptions(): DataScopeOption[] {
  return getUIConstants().dataScopeOptions;
}

/**
 * Get status badges
 */
export function getStatusBadges(): Record<string, StatusBadge> {
  return getUIConstants().statusBadges;
}

/**
 * Get a specific status badge by key
 */
export function getStatusBadge(status: string): StatusBadge | undefined {
  const badges = getStatusBadges();
  return badges[status] ?? badges[status.toLowerCase()];
}

/**
 * Get badge color by value
 */
export function getBadgeColorByValue(value: string): BadgeColor | undefined {
  return getBadgeColors().find((color) => color.value === value);
}

/**
 * Get badge class name for a color value
 */
export function getBadgeClassName(colorValue: string): string {
  const color = getBadgeColorByValue(colorValue);
  return color?.className ?? "bg-gray-100 text-gray-800";
}

// =============================================================================
// UI Constants Override
// =============================================================================

/**
 * Override UI constants with custom values
 */
export function setUIConstants(constants: Partial<UIConstants>): void {
  const current = getUIConstants();
  cachedUIConstants = {
    priceTypes: constants.priceTypes ?? current.priceTypes,
    badgeColors: constants.badgeColors ?? current.badgeColors,
    dataScopeOptions: constants.dataScopeOptions ?? current.dataScopeOptions,
    statusBadges: { ...current.statusBadges, ...constants.statusBadges },
  };
}
