import type { ReactElement } from "react";
import Link from "next/link";
import { listProducts } from "@enterprise/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Package, ShoppingBag, Truck } from "lucide-react";

type PriceType = "hq" | "branch" | "classroom" | "retail";

function getProductPrice(product: any, priceType: PriceType): number {
  switch (priceType) {
    case "hq":
      return product.price_hq ?? product.price_retail ?? 0;
    case "branch":
      return product.price_branch ?? product.price_retail ?? 0;
    case "classroom":
      return product.price_classroom ?? product.price_retail ?? 0;
    default:
      return product.price_retail ?? 0;
  }
}

export default async function Home(): Promise<ReactElement> {
  const user = await getCurrentUser();
  const priceType: PriceType = user?.priceType ?? "retail";

  let products: any[] = [];
  try {
    const result = await listProducts({ limit: 8, is_active: true });
    products = Array.isArray(result.products) ? result.products : [];
  } catch (error) {
    console.error("Failed to load products", error);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge variant="secondary" className="px-4 py-1">
              社内限定ストア
            </Badge>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              教材・商品をオンラインで購入
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-lg">
              リトミック研究センターの教材、証書、教具などをオンラインで簡単に購入できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  商品を見る
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    ログイン
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">豊富な品揃え</h3>
              <p className="text-sm text-muted-foreground">
                教材、証書、教具など多数の商品を取り揃えています
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">簡単注文</h3>
              <p className="text-sm text-muted-foreground">
                カートに入れてすぐに注文できます
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">迅速配送</h3>
              <p className="text-sm text-muted-foreground">
                ご注文から素早くお届けします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">おすすめ商品</h2>
              <p className="text-muted-foreground">人気の商品をチェック</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="gap-2">
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                商品がまだ登録されていません。管理画面から商品を追加してください。
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product: any) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{product.code}</p>
                        <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-bold">
                          {formatPrice(getProductPrice(product, priceType))}
                        </span>
                        {product.stock <= 0 && (
                          <Badge variant="secondary">在庫切れ</Badge>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
