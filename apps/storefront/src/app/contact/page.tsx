import type { ReactElement } from "react";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage(): ReactElement {
  return (
    <div className="container max-w-3xl px-4 py-12 md:px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">お問い合わせ</h1>
        <p className="text-muted-foreground">
          ご質問・不具合・要望などはこちらのフォームからご連絡ください。通常 1-2 営業日以内に回答いたします。
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">お名前</label>
            <Input placeholder="山田 太郎" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">メールアドレス</label>
            <Input type="email" placeholder="example@example.com" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">件名</label>
          <Input placeholder="例）配送先の変更について" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">内容</label>
          <Textarea placeholder="できるだけ具体的にご記入ください。" rows={6} />
        </div>

        <Button className="w-full md:w-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          送信する
        </Button>

        <div className="flex items-center gap-3 text-sm text-muted-foreground border-t pt-4">
          <Mail className="h-4 w-4" />
          <span>緊急のご連絡はシステム担当宛に直接メールしてください。</span>
          <Link href="/help" className="text-primary underline underline-offset-4">
            ヘルプを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
