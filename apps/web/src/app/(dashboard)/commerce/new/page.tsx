import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@enterprise/db";

export default function CommerceNewPage() {
  async function saveAction(formData: FormData) {
    "use server";
    const sku = String(formData.get("sku") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const price = Number(formData.get("price") || 0);
    const stock = Number(formData.get("stock") || 0);
    const tenant_id = (formData.get("tenant_id") as string | null) || undefined;

    if (!sku || !title) {
      redirect("/commerce/internal");
    }

    await createProduct({
      tenant_id,
      sku,
      title,
      price_retail_cents: Math.max(0, Math.round(price * 100)),
      stock: Math.max(0, Number.isFinite(stock) ? stock : 0),
    });
    redirect("/commerce/internal");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="商品登録" />
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <form className="grid gap-4 max-w-xl" action={saveAction}>
              <div className="grid gap-2">
                <Label htmlFor="tenant_id">テナント ID（任意）</Label>
                <Input id="tenant_id" name="tenant_id" placeholder="tenant uuid" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="SKU-001" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">商品名</Label>
                <Input id="title" name="title" placeholder="社内販売用の名称" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">小売価格 (JPY)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">在庫数</Label>
                <Input id="stock" name="stock" type="number" step="1" placeholder="0" />
              </div>
              <div className="flex gap-2">
                <Button type="submit">保存</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/commerce/internal">キャンセル</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
