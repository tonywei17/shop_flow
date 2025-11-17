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
  Video,
  Bell,
  Award,
  MapPin,
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
    label: "学習プラットフォーム",
    items: [
      { label: "会員管理", href: "/members", icon: Users },
      { label: "データ分析", href: "/learning-analytics", icon: BarChart3 },
      { label: "注文一覧", href: "/learning-orders", icon: CreditCard },
      { label: "活動・研修管理", href: "/activities", icon: Calendar },
      { label: "動画コンテンツ", href: "/course-videos", icon: Video },
      { label: "資格一覧", href: "/qualifications", icon: Award },
      { label: "試験管理", href: "/exams", icon: Award },
      { label: "通知管理", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "会場関連",
    items: [{ label: "会場一覧", href: "/venues", icon: MapPin }],
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
