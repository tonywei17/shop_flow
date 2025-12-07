/**
 * 共享的状态标签配置
 * 用于统一管理系统中所有状态标签的样式
 */

export type BadgeConfig = {
  label: string;
  className: string;
};

/**
 * 通用状态标签 (有効/無効)
 */
export const STATUS_BADGE_MAP: Record<string, BadgeConfig> = {
  有効: { label: "有効", className: "bg-green-500 text-white" },
  無効: { label: "無効", className: "bg-red-500 text-white" },
  停止中: { label: "停止中", className: "bg-amber-500 text-white" },
};

/**
 * 获取状态标签配置
 */
export function getStatusBadge(status: string | null | undefined): BadgeConfig {
  if (!status) {
    return { label: "未設定", className: "bg-muted text-muted-foreground" };
  }
  return STATUS_BADGE_MAP[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
}

/**
 * 数据范围标签
 */
export const DATA_SCOPE_BADGE_MAP: Record<string, BadgeConfig> = {
  all: { label: "全データ", className: "bg-primary/10 text-primary" },
  self_and_descendants: { label: "部署+下位", className: "bg-blue-500/10 text-blue-600" },
  self_only: { label: "部署のみ", className: "bg-amber-500/10 text-amber-600" },
  custom: { label: "カスタム", className: "bg-muted text-foreground" },
  // Legacy values
  "すべてのデータ権限": { label: "全権限", className: "bg-primary/10 text-primary" },
  "カスタムデータ権限": { label: "カスタム", className: "bg-muted text-foreground" },
};

/**
 * 获取数据范围标签配置
 */
export function getScopeBadge(
  scopeType: string | null | undefined,
  legacyScope?: string | null
): BadgeConfig {
  // First try scopeType (new field)
  if (scopeType && DATA_SCOPE_BADGE_MAP[scopeType]) {
    return DATA_SCOPE_BADGE_MAP[scopeType];
  }
  // Fallback to legacy scope
  if (legacyScope && DATA_SCOPE_BADGE_MAP[legacyScope]) {
    return DATA_SCOPE_BADGE_MAP[legacyScope];
  }
  return { label: "未設定", className: "bg-muted text-muted-foreground" };
}

/**
 * 角色标签颜色选项
 */
export const BADGE_COLOR_OPTIONS = [
  { value: "#ef4444", label: "レッド", className: "bg-red-500 text-white" },
  { value: "#f97316", label: "オレンジ", className: "bg-orange-500 text-white" },
  { value: "#eab308", label: "イエロー", className: "bg-yellow-500 text-white" },
  { value: "#22c55e", label: "グリーン", className: "bg-green-500 text-white" },
  { value: "#14b8a6", label: "ティール", className: "bg-teal-500 text-white" },
  { value: "#3b82f6", label: "ブルー", className: "bg-blue-500 text-white" },
  { value: "#8b5cf6", label: "パープル", className: "bg-purple-500 text-white" },
  { value: "#ec4899", label: "ピンク", className: "bg-pink-500 text-white" },
  { value: "#64748b", label: "スレート", className: "bg-slate-500 text-white" },
] as const;

/**
 * 根据颜色值获取标签样式
 */
export function getBadgeColorStyle(color: string | null | undefined): string {
  if (!color) {
    return "bg-primary/10 text-primary";
  }
  const option = BADGE_COLOR_OPTIONS.find((opt) => opt.value === color);
  return option?.className ?? "bg-primary/10 text-primary";
}
