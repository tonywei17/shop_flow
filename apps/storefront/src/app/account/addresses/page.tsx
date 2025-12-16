import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MapPin, Plus, Home, Building, Phone, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { isAuthenticated, getCurrentUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@enterprise/db";

type AddressRecord = {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  address_line1: string;
  address_line2: string | null;
  is_default: boolean;
  created_at: string | null;
};

async function addAddress(formData: FormData): Promise<void> {
  "use server";
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login?redirect=/account/addresses");
  }
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login?redirect=/account/addresses");
  }

  const label = (formData.get("label") as string) || null;
  const recipient = (formData.get("recipient") as string) || "";
  const phone = (formData.get("phone") as string) || null;
  const postal = (formData.get("postal") as string) || null;
  const prefecture = (formData.get("prefecture") as string) || null;
  const city = (formData.get("city") as string) || null;
  const address1 = (formData.get("address1") as string) || "";
  const address2 = (formData.get("address2") as string) || null;
  const isDefault = formData.get("is_default") === "on";

  const sb = getSupabaseAdmin();
  if (isDefault) {
    await sb.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  await sb.from("addresses").insert({
    user_id: user.id,
    label,
    recipient_name: recipient,
    phone,
    postal_code: postal,
    prefecture,
    city,
    address_line1: address1,
    address_line2: address2,
    is_default: isDefault,
  });

  revalidatePath("/account/addresses");
}

async function deleteAddress(formData: FormData): Promise<void> {
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
  const sb = getSupabaseAdmin();
  await sb.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export default async function AccountAddressesPage(): Promise<ReactElement> {
  if (!(await isAuthenticated())) {
    redirect("/login?redirect=/account/addresses");
  }
  const user = await getCurrentUser();
  const sb = getSupabaseAdmin();

  const { data: addresses } = await sb
    .from("addresses")
    .select(
      "id,label,recipient_name,phone,postal_code,prefecture,city,address_line1,address_line2,is_default,created_at",
    )
    .eq("user_id", user?.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="container max-w-6xl px-4 py-10 md:px-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">配送先住所</h1>
          <p className="text-muted-foreground text-sm md:text-base">よく使う住所を登録・編集できます。</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(addresses ?? []).map((addr: AddressRecord) => (
          <Card key={addr.id} className="border-muted/70">
            <CardHeader className="flex flex-row items-start gap-3 pb-2">
              <div className="rounded-full bg-primary/10 p-3">
                {addr.label?.includes("職") ? (
                  <Building className="h-5 w-5 text-primary" />
                ) : (
                  <Home className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {addr.label || "住所"}
                  {addr.is_default && <Badge variant="secondary">デフォルト</Badge>}
                </CardTitle>
                <CardDescription>受取人: {addr.recipient_name}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">郵便番号</p>
                <p>{addr.postal_code || "未設定"}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">住所</p>
                <p>
                  {[addr.prefecture, addr.city, addr.address_line1, addr.address_line2].filter(Boolean).join(" ")}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">電話番号</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {addr.phone || "未設定"}
                </p>
              </div>
              <div className="flex gap-3">
                <form action={deleteAddress} className="flex-1">
                  <input type="hidden" name="id" value={addr.id} />
                  <Button variant="outline" size="sm" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-muted/70">
        <CardHeader>
          <CardTitle>住所を登録</CardTitle>
          <CardDescription>新しい配送先を登録します。保存後に一覧へ追加されます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={addAddress} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">ラベル</label>
                <Input name="label" placeholder="例）自宅 / 職場" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">受取人</label>
                <Input name="recipient" placeholder="山田 太郎" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">電話番号</label>
                <Input name="phone" placeholder="090-XXXX-XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">郵便番号</label>
                <Input name="postal" placeholder="100-0001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">都道府県</label>
                <Input name="prefecture" placeholder="東京都" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">市区町村</label>
                <Input name="city" placeholder="千代田区" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">番地・町名</label>
                <Input name="address1" placeholder="千代田1-1" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">建物名・部屋番号</label>
              <Textarea name="address2" placeholder="マンション名・部屋番号など" rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <input id="is_default" name="is_default" type="checkbox" className="h-4 w-4" />
              <label htmlFor="is_default" className="text-sm text-muted-foreground">
                デフォルトの配送先に設定
              </label>
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
    </div>
  );
}
