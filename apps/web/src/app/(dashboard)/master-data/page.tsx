import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";

const masterItems = [
  { label: "勘定項目", href: "/master-data/account-items" },
  { label: "商品区分", href: "/master-data/product-categories" },
  { label: "相手先", href: "/master-data/counterparties" },
];

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="マスター管理" />
      <Card className="rounded-xl border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border text-sm text-foreground">
            {masterItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/60"
              >
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground">一覧を開く</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
