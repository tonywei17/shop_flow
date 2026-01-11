/**
 * 角色管理相关常量
 */

import type { DataScopeType } from "@enterprise/domain-org";
import type { PriceType } from "@enterprise/db";
import { navSections } from "@/components/dashboard/nav-items";

/**
 * 价格类型选项
 */
export const PRICE_TYPE_OPTIONS: { value: PriceType; label: string }[] = [
  { value: "hq", label: "本部価格" },
  { value: "branch", label: "支局価格" },
  { value: "classroom", label: "教室価格" },
  { value: "retail", label: "一般価格" },
];

/**
 * 角色标签颜色选项
 */
export const BADGE_COLOR_OPTIONS = [
  { value: "#10b981", label: "エメラルド", bg: "bg-emerald-500/15", text: "text-emerald-600" },
  { value: "#22c55e", label: "グリーン", bg: "bg-green-500/15", text: "text-green-600" },
  { value: "#3b82f6", label: "ブルー", bg: "bg-blue-500/15", text: "text-blue-600" },
  { value: "#6366f1", label: "インディゴ", bg: "bg-indigo-500/15", text: "text-indigo-600" },
  { value: "#8b5cf6", label: "バイオレット", bg: "bg-violet-500/15", text: "text-violet-600" },
  { value: "#a855f7", label: "パープル", bg: "bg-purple-500/15", text: "text-purple-600" },
  { value: "#ec4899", label: "ピンク", bg: "bg-pink-500/15", text: "text-pink-600" },
  { value: "#f43f5e", label: "ローズ", bg: "bg-rose-500/15", text: "text-rose-600" },
  { value: "#f97316", label: "オレンジ", bg: "bg-orange-500/15", text: "text-orange-600" },
  { value: "#f59e0b", label: "アンバー", bg: "bg-amber-500/15", text: "text-amber-600" },
  { value: "#eab308", label: "イエロー", bg: "bg-yellow-500/15", text: "text-yellow-600" },
  { value: "#64748b", label: "スレート", bg: "bg-slate-500/15", text: "text-slate-600" },
] as const;

/**
 * 根据颜色值获取标签样式
 */
export function getBadgeStyle(color: string | null | undefined): { bg: string; text: string } {
  if (!color) return { bg: "bg-muted", text: "text-foreground" };
  const found = BADGE_COLOR_OPTIONS.find((opt) => opt.value === color);
  if (found) return { bg: found.bg, text: found.text };
  return { bg: "bg-muted", text: "text-foreground" };
}

/**
 * 数据范围选项
 */
export const DATA_SCOPE_OPTIONS: { value: DataScopeType; label: string; description: string }[] = [
  { value: "all", label: "すべてのデータ", description: "全ての部署のデータにアクセス可能" },
  { value: "self_and_descendants", label: "所属部署と下位部署", description: "所属部署とその下位部署のデータにアクセス可能" },
  { value: "self_only", label: "所属部署のみ", description: "所属部署のデータのみアクセス可能" },
  { value: "custom", label: "カスタム", description: "特定の部署を選択してアクセス範囲を設定" },
];

/**
 * 数据范围标签
 */
export const DATA_SCOPE_LABELS: Record<DataScopeType, string> = {
  all: "全データ",
  self_and_descendants: "部署+下位",
  self_only: "部署のみ",
  custom: "カスタム",
};

/**
 * 功能组（基于导航菜单）
 */
export const FEATURE_GROUPS = navSections.map((section) => ({
  id: section.label,
  label: section.label,
  items: section.items.map((item) => ({
    id: item.href,
    label: item.label,
  })),
}));

/**
 * 所有功能 ID
 */
export const ALL_FEATURE_IDS: string[] = FEATURE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.id),
);

/**
 * SuperAdmin 角色代码
 */
export const SUPER_ADMIN_CODE = "admin";

/**
 * 检查是否为 SuperAdmin 角色
 */
export function isSuperAdminRole(roleCode: string | null | undefined): boolean {
  return roleCode === SUPER_ADMIN_CODE;
}
