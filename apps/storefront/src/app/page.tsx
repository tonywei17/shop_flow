import type { ReactElement } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, ShoppingBag, Truck, BookOpen, Award, Users } from "lucide-react";

export default async function Home(): Promise<ReactElement> {
  const user = await getCurrentUser();

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
              {user ? (
                <Link href="/products">
                  <Button size="lg" className="gap-2">
                    商品を見る
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    ログインして商品を見る
                    <ArrowRight className="h-4 w-4" />
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

      {/* About Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight mb-4">リトミック研究センターについて</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              リトミック研究センターは、音楽教育の普及と発展に貢献するため、
              質の高い教材と指導者育成プログラムを提供しています。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">充実した教材</h3>
              <p className="text-sm text-muted-foreground">
                長年の研究と実践に基づいた、効果的な教材を提供しています
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">資格認定制度</h3>
              <p className="text-sm text-muted-foreground">
                指導者としてのスキルを証明する資格認定制度を運営しています
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">全国ネットワーク</h3>
              <p className="text-sm text-muted-foreground">
                全国の教室と指導者をつなぐネットワークを構築しています
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 p-8 bg-primary/5 rounded-xl">
            <h2 className="text-2xl font-bold tracking-tight">商品をお探しですか？</h2>
            <p className="text-muted-foreground max-w-md">
              ログインして、教材や教具などの商品をご覧ください。
            </p>
            {user ? (
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  商品一覧へ
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  ログイン
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
