import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, CreditCard, Settings, LogOut, ChevronRight } from "lucide-react";
import { LogoutButton } from "./logout-button";

export default async function AccountPage(): Promise<ReactElement> {
  // Redirect to login if not authenticated
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account");
  }

  const user = await getCurrentUser();

  const menuItems = [
    {
      href: "/account/orders",
      icon: Package,
      title: "注文履歴",
      description: "過去の注文を確認",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      title: "配送先住所",
      description: "住所の追加・編集",
    },
    {
      href: "/account/settings",
      icon: Settings,
      title: "アカウント設定",
      description: "プロフィールの編集",
    },
  ];

  return (
    <div className="container px-4 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">マイページ</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="text-center space-y-3">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarFallback className="text-2xl">
                  {user?.displayName?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user?.displayName ?? "ユーザー"}</CardTitle>
              <CardDescription>{user?.email ?? user?.accountId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                {user?.departmentName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">所属</span>
                    <span>{user.departmentName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">価格タイプ</span>
                  <span>
                    {user?.priceType === "hq"
                      ? "本部価格"
                      : user?.priceType === "branch"
                        ? "支局価格"
                        : user?.priceType === "classroom"
                          ? "教室価格"
                          : "一般価格"}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-center">
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Card className="hover:bg-muted/60 transition-colors border-muted/60">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
