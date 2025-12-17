import type { ReactElement } from "react";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@enterprise/db";

function validatePostalCode(postal: string | null): boolean {
  if (!postal) return true;
  return /^\d{3}-?\d{4}$/.test(postal);
}

function validatePhone(phone: string | null): boolean {
  if (!phone) return true;
  return /^[\d\-+()]{10,15}$/.test(phone.replace(/\s/g, ""));
}

async function updateAddress(formData: FormData): Promise<void> {
  "use server";
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login?redirect=/account/addresses");
  }
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login?redirect=/account/addresses");
  }

  const id = formData.get("id") as string;
  if (!id) return;

  const label = (formData.get("label") as string) || null;
  const recipient = (formData.get("recipient") as string) || "";
  const phone = (formData.get("phone") as string) || null;
  const postal = (formData.get("postal") as string) || null;
  const prefecture = (formData.get("prefecture") as string) || null;
  const city = (formData.get("city") as string) || null;
  const address1 = (formData.get("address1") as string) || "";
  const address2 = (formData.get("address2") as string) || null;
  const isDefault = formData.get("is_default") === "on";

  if (!recipient.trim()) {
    throw new Error("受取人は必須です");
  }
  if (!address1.trim()) {
    throw new Error("番地・町名は必須です");
  }
  if (!validatePostalCode(postal)) {
    throw new Error("郵便番号の形式が正しくありません（例: 100-0001）");
  }
  if (!validatePhone(phone)) {
    throw new Error("電話番号の形式が正しくありません");
  }

  const sb = getSupabaseAdmin();
  if (isDefault) {
    await sb.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  await sb.from("addresses").update({
    label,
    recipient_name: recipient.trim(),
    phone: phone?.trim() || null,
    postal_code: postal?.trim() || null,
    prefecture: prefecture?.trim() || null,
    city: city?.trim() || null,
    address_line1: address1.trim(),
    address_line2: address2?.trim() || null,
    is_default: isDefault,
  }).eq("id", id).eq("user_id", user.id);

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account/addresses");
  }

  const { id } = await params;
  const user = await getCurrentUser();
  const sb = getSupabaseAdmin();

  const { data: address, error } = await sb
    .from("addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single();

  if (error || !address) {
    notFound();
  }

  return (
    <div className="container max-w-2xl px-4 py-10 md:px-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/account/addresses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Link>
      </div>

      <Card className="border-muted/70">
        <CardHeader>
          <CardTitle>住所を編集</CardTitle>
          <CardDescription>配送先情報を更新します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateAddress} className="space-y-4">
            <input type="hidden" name="id" value={address.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">ラベル</label>
                <Input name="label" placeholder="例）自宅 / 職場" defaultValue={address.label || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">受取人 <span className="text-destructive">*</span></label>
                <Input name="recipient" placeholder="山田 太郎" defaultValue={address.recipient_name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">電話番号</label>
                <Input name="phone" placeholder="090-XXXX-XXXX" defaultValue={address.phone || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">郵便番号</label>
                <Input name="postal" placeholder="100-0001" defaultValue={address.postal_code || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">都道府県</label>
                <Input name="prefecture" placeholder="東京都" defaultValue={address.prefecture || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">市区町村</label>
                <Input name="city" placeholder="千代田区" defaultValue={address.city || ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">番地・町名 <span className="text-destructive">*</span></label>
                <Input name="address1" placeholder="千代田1-1" defaultValue={address.address_line1} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">建物名・部屋番号</label>
              <Textarea name="address2" placeholder="マンション名・部屋番号など" rows={2} defaultValue={address.address_line2 || ""} />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_default"
                name="is_default"
                type="checkbox"
                className="h-4 w-4"
                defaultChecked={address.is_default}
              />
              <label htmlFor="is_default" className="text-sm text-muted-foreground">
                デフォルトの配送先に設定
              </label>
            </div>
            <Separator />
            <div className="flex justify-end gap-3">
              <Link href="/account/addresses">
                <Button variant="outline" type="button">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit">保存する</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
