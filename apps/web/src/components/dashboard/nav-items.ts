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
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "請求書関連",
    items: [
      { label: "請求一覧", href: "/billing/invoices", icon: ReceiptText },
      { label: "CC会費管理", href: "/billing/cc-fees", icon: CreditCard },
      { label: "その他費用管理", href: "/billing/expenses", icon: Wallet },
    ],
  },
  {
    label: "オンラインストア管理",
    items: [
      { label: "商品管理", href: "/commerce", icon: Package },
      { label: "注文管理", href: "/commerce/orders", icon: ShoppingBag },
    ],
  },
  {
    label: "システム管理",
    items: [
      { label: "部署管理", href: "/departments", icon: Building2 },
      { label: "アカウント管理", href: "/account", icon: UserCog },
      { label: "ロール管理", href: "/roles", icon: ShieldCheck },
      { label: "マスター管理", href: "/master-data", icon: Database },
    ],
  },
];

export const navItems: NavItem[] = navSections.flatMap((section) => section.items);
