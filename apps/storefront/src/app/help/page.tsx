import type { ReactElement } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Info } from "lucide-react";

export default function HelpPage(): ReactElement {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">ヘルプ</h1>
        <p className="text-muted-foreground">
          よくある質問とサポート案内です。解決しない場合は「お問い合わせ」からご連絡ください。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">よくある質問</h2>
          </div>
          <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
            <li>
              <p className="font-medium text-foreground">Q. ログインできません</p>
              <p>パスワードをお忘れの場合は「パスワードリセット」から再設定してください。</p>
            </li>
            <li>
              <p className="font-medium text-foreground">Q. 商品画像が表示されません</p>
              <p>ブラウザを更新し、ネットワーク設定や広告ブロッカーを確認してください。</p>
            </li>
            <li>
              <p className="font-medium text-foreground">Q. 在庫・価格が違う</p>
              <p>キャッシュをクリアし、最新の情報で再表示してください。それでも解決しない場合はお問い合わせください。</p>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">サポートへの連絡</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-6">
            <p>フォームからのご相談はこちら。</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary underline underline-offset-4"
            >
              お問い合わせフォームへ
            </Link>
            <p className="text-xs text-muted-foreground">
              ※ 緊急のシステム障害は件名に「【緊急】」と明記してください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
