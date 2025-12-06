"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package } from "lucide-react";

export function CartContent(): React.ReactElement {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">カートは空です</h2>
        <p className="text-muted-foreground mb-6">
          商品を追加してください
        </p>
        <Link href="/products">
          <Button>商品を見る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold hover:underline line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.productCode}</p>
                  <p className="font-medium mt-1">{formatPrice(item.unitPrice)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Subtotal & Remove */}
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive mt-1"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Clear Cart */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearCart}>
            カートを空にする
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>注文内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">小計</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">消費税</span>
              <span>{formatPrice(cart.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>合計</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push("/checkout")}
            >
              レジに進む
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/products" className="w-full">
              <Button variant="outline" className="w-full">
                買い物を続ける
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
