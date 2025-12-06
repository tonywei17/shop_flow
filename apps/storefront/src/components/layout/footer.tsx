import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-lg font-bold">社内ストア</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              社内向けの教材・商品販売サイトです。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">クイックリンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  商品一覧
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-foreground">
                  カート
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-muted-foreground hover:text-foreground">
                  注文履歴
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">アカウント</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-foreground">
                  マイページ
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="text-muted-foreground hover:text-foreground">
                  配送先住所
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  ヘルプ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} リトミック研究センター. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
