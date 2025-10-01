import type { ComponentType } from "react";
import { Users, ShoppingCart, GraduationCap, Wallet, Building2 } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { label: "CRM", href: "/crm", icon: Users },
  { label: "Commerce", href: "/commerce", icon: ShoppingCart },
  { label: "LMS", href: "/lms", icon: GraduationCap },
  { label: "Settlement", href: "/settlement", icon: Wallet },
  { label: "Org", href: "/org", icon: Building2 },
];
