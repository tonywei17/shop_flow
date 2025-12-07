"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart/context";
import { useStoreSettings, calculateShippingFee } from "@/lib/store-settings-context";
import { formatPrice } from "@/lib/utils";
import type { StorefrontUser } from "@/lib/auth/types";
import { Loader2, CreditCard, Package, MapPin, AlertCircle } from "lucide-react";

type CheckoutContentProps = {
  user: StorefrontUser | null;
};

export function CheckoutContent({ user }: CheckoutContentProps): React.ReactElement {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { settings, isMaintenanceMode } = useStoreSettings();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Calculate shipping fee based on store settings
  const shippingFee = settings
    ? calculateShippingFee(
        cart.subtotal,
        settings.shipping_fee,
        settings.free_shipping_threshold
      )
    : 0;

  // Calculate total with shipping
  const totalWithShipping = cart.total + shippingFee;

  // Check minimum order amount
  const minimumOrderAmount = settings?.minimum_order_amount ?? 0;
  const isBelowMinimum = minimumOrderAmount > 0 && cart.subtotal < minimumOrderAmount;

  // Shipping address form state
  const [address, setAddress] = React.useState({
    recipientName: user?.displayName ?? "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    phone: "",
  });

  // Show maintenance mode message
  if (isMaintenanceMode) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">メンテナンス中</h2>
        <p className="text-muted-foreground mb-6">
          現在、ストアはメンテナンス中です。しばらくお待ちください。
        </p>
        <Button onClick={() => router.push("/")}>トップページへ</Button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">カートは空です</h2>
        <p className="text-muted-foreground mb-6">
          商品を追加してからお手続きください
        </p>
        <Button onClick={() => router.push("/products")}>商品を見る</Button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          shippingAddress: address,
          subtotal: cart.subtotal,
          taxAmount: cart.taxAmount,
          shippingFee: shippingFee,
          total: totalWithShipping,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "注文の作成に失敗しました");
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注文の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                配送先住所
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">お名前 *</Label>
                  <Input
                    id="recipientName"
                    value={address.recipientName}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, recipientName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">郵便番号 *</Label>
                  <Input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    placeholder="123-4567"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="prefecture">都道府県 *</Label>
                  <Input
                    id="prefecture"
                    value={address.prefecture}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, prefecture: e.target.value }))
                    }
                    placeholder="東京都"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">市区町村 *</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="渋谷区"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">番地・建物名 *</Label>
                <Input
                  id="addressLine1"
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, addressLine1: e.target.value }))
                  }
                  placeholder="1-2-3 ○○ビル 101号室"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">備考</Label>
                <Input
                  id="addressLine2"
                  value={address.addressLine2}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, addressLine2: e.target.value }))
                  }
                  placeholder="配送時の注意事項など"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                お支払い方法
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">クレジットカード決済</p>
                    <p className="text-sm text-muted-foreground">
                      注文確定後、Stripeの決済ページに移動します
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                ご注文内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>ご注文金額</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">商品小計</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">消費税</span>
                <span>{formatPrice(cart.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">送料</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600">無料</span>
                ) : (
                  <span>{formatPrice(shippingFee)}</span>
                )}
              </div>
              {settings?.free_shipping_threshold && shippingFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  あと{formatPrice(settings.free_shipping_threshold - cart.subtotal)}で送料無料
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>合計（税込）</span>
                <span>{formatPrice(totalWithShipping)}</span>
              </div>
              {isBelowMinimum && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>最低注文金額は{formatPrice(minimumOrderAmount)}です</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              {error && (
                <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || isBelowMinimum}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    注文を確定する
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                「注文を確定する」をクリックすると、利用規約に同意したものとみなされます
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
