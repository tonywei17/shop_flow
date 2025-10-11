import type { ComponentType } from "react";
import { ListChecks, ShieldCheck, ShoppingBag, FileText, UserCog } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { label: "システム項目管理", href: "/system-fields", icon: ListChecks },
  { label: "権限管理", href: "/permissions", icon: ShieldCheck },
  { label: "オンラインストア管理", href: "/commerce", icon: ShoppingBag },
  { label: "申請書管理", href: "/request-forms", icon: FileText },
  { label: "アカウント設定", href: "/account", icon: UserCog },
];
