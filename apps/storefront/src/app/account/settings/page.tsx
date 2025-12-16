import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { updateAdminAccount } from "@enterprise/db";

async function updateProfile(formData: FormData): Promise<void> {
  "use server";
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login?redirect=/account/settings");
  }
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login?redirect=/account/settings");
  }

  const displayName = (formData.get("display_name") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const title = (formData.get("title") as string) || null;
  const bio = (formData.get("bio") as string) || null;

  const payload: Record<string, string | null> = {};
  if (displayName !== null) payload.display_name = displayName;
  if (email !== null) payload.email = email;
  if (phone !== null) payload.phone = phone;
  if (title !== null) payload.department_name = title; // reuse field as肩書き/部門名
  if (bio !== null) payload.account_scope = bio; // store bio temporarily in account_scope (placeholder)

  if (Object.keys(payload).length) {
    await updateAdminAccount(user.id, payload);
  }

  revalidatePath("/account");
  revalidatePath("/account/settings");
}

export default async function AccountSettingsPage(): Promise<ReactElement> {
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account/settings");
  }
  const user = await getCurrentUser();

  return (
    <div className="container max-w-4xl px-4 py-10 md:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">アカウント設定</h1>
        <p className="text-muted-foreground">
          プロフィールや連絡先を更新できます。変更内容は保存後に反映されます。
        </p>
      </div>

      <Card className="border-muted/70">
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
          <CardDescription>氏名や肩書きを更新します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">氏名</label>
                <Input name="display_name" placeholder="山田 太郎" defaultValue={user?.displayName ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">肩書き / 部門</label>
                <Input name="title" placeholder="営業部 / スーパーバイザー" defaultValue={user?.departmentName ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">自己紹介</label>
              <Textarea name="bio" placeholder="一言プロフィールを入力してください。" rows={3} defaultValue="" />
            </div>
            <Separator />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="reset">
                クリア
              </Button>
              <Button type="submit">保存する</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-muted/70">
        <CardHeader>
          <CardTitle>連絡先</CardTitle>
          <CardDescription>メールアドレス・電話番号を管理します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">メールアドレス</label>
                <Input type="email" name="email" placeholder="example@example.com" defaultValue={user?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">電話番号</label>
                <Input name="phone" placeholder="090-XXXX-XXXX" defaultValue={user?.phone ?? ""} />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="reset">
                キャンセル
              </Button>
              <Button type="submit">保存する</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
