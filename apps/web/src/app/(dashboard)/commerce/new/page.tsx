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
    const code = String(formData.get("code") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const price = Number(formData.get("price") || 0);
    const stock = Number(formData.get("stock") || 0);

    if (!code || !name) {
      redirect("/commerce/internal");
    }

    await createProduct({
      code,
      name,
      price_retail: Math.max(0, Math.round(price)),
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
                <Label htmlFor="code">商品コード</Label>
                <Input id="code" name="code" placeholder="PROD-001" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">商品名</Label>
                <Input id="name" name="name" placeholder="商品名を入力" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">小売価格 (JPY)</Label>
                <Input id="price" name="price" type="number" step="1" placeholder="0" />
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
